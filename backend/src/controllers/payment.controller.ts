import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/verifyJwt";
import { prisma } from "../utils/prisma";
import { completePaymentSchema } from "../schemas/payment.schema";

export async function completePayment(req: AuthenticatedRequest, res: Response) {
  const parsed = completePaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", message: "Invalid input", issues: parsed.error.issues });
  }

  const { orderId, amountPaid, paymentMethod } = parsed.data;
  const userId = req.user!.userId;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true, transaction: true },
  });

  if (!order) {
    return res.status(404).json({ status: "error", message: "Order not found" });
  }

  if (order.status !== "PENDING") {
    return res.status(400).json({ status: "error", message: "Order is not pending payment" });
  }

  const total = Number(order.total);

  if (amountPaid < total) {
    return res.status(400).json({ status: "error", message: "Amount paid is less than total" });
  }

  const change = amountPaid - total;

  for (const item of order.orderItems) {
    const stockLevel = await prisma.stockLevel.findUnique({ where: { productId: item.productId } });
    if (!stockLevel || stockLevel.quantity < item.quantity) {
      return res.status(400).json({
        status: "error",
        message: `Insufficient stock for product ${item.productId}`,
      });
    }
  }

  const operations = [
    prisma.transaction.create({
      data: {
        orderId,
        amountPaid,
        paymentMethod,
        change,
        status: "COMPLETED",
      },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    }),
    ...order.orderItems.flatMap((item) => [
      prisma.stockLevel.update({
        where: { productId: item.productId },
        data: { quantity: { decrement: item.quantity } },
      }),
      prisma.stockMovement.create({
        data: {
          productId: item.productId,
          userId,
          type: "STOCK_OUT",
          quantity: item.quantity,
          reason: `Order ${orderId} completed`,
        },
      }),
    ]),
  ];

  const results = await prisma.$transaction(operations);
  const transaction = results[0];

  res.status(201).json({ status: "success", transaction, change });
}

export async function getTransaction(req: AuthenticatedRequest, res: Response) {
  const { orderId } = req.params;

  const transaction = await prisma.transaction.findUnique({
    where: { orderId },
    include: { order: { include: { orderItems: { include: { product: true } } } } },
  });

  if (!transaction) {
    return res.status(404).json({ status: "error", message: "Transaction not found" });
  }

  res.json({ status: "success", transaction });
}

export async function listTransactions(req: AuthenticatedRequest, res: Response) {
  const transactions = await prisma.transaction.findMany({
    include: { order: { include: { cashier: { select: { id: true, name: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json({ status: "success", transactions });
}

export async function voidTransaction(req: AuthenticatedRequest, res: Response) {
  const { orderId } = req.params;

  const transaction = await prisma.transaction.findUnique({
    where: { orderId },
    include: { order: { include: { orderItems: true } } },
  });

  if (!transaction) {
    return res.status(404).json({ status: "error", message: "Transaction not found" });
  }

  if (transaction.status === "REFUNDED") {
    return res.status(400).json({ status: "error", message: "Transaction already refunded" });
  }

  const userId = req.user!.userId;

  const operations = [
    prisma.transaction.update({
      where: { orderId },
      data: { status: "REFUNDED" },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: "REFUNDED" },
    }),
    ...transaction.order.orderItems.flatMap((item) => [
      prisma.stockLevel.update({
        where: { productId: item.productId },
        data: { quantity: { increment: item.quantity } },
      }),
      prisma.stockMovement.create({
        data: {
          productId: item.productId,
          userId,
          type: "STOCK_IN",
          quantity: item.quantity,
          reason: `Refund for order ${orderId}`,
        },
      }),
    ]),
  ];

  const results = await prisma.$transaction(operations);
  res.json({ status: "success", transaction: results[0] });
}