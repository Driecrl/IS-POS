import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/verifyJwt";
import { prisma } from "../utils/prisma";
import { createOrderSchema } from "../schemas/order.schema";

export async function createOrder(req: AuthenticatedRequest, res: Response) {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", message: "Invalid input", issues: parsed.error.issues });
  }

  const { items, discount } = parsed.data;
  const cashierId = req.user!.userId;

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  if (products.length !== productIds.length) {
    return res.status(400).json({ status: "error", message: "One or more products not found" });
  }

  let subtotal = 0;
  const orderItemsData = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const unitPrice = Number(product.price);
    subtotal += unitPrice * item.quantity;
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: unitPrice,
    };
  });

  const total = subtotal - discount;

  const order = await prisma.order.create({
    data: {
      cashierId,
      total,
      discount,
      status: "PENDING",
      orderItems: { create: orderItemsData },
    },
    include: { orderItems: { include: { product: true } } },
  });

  res.status(201).json({ status: "success", order });
}

export async function listOrders(req: AuthenticatedRequest, res: Response) {
  const orders = await prisma.order.findMany({
    include: { orderItems: { include: { product: true } }, cashier: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json({ status: "success", orders });
}

export async function getOrder(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: { include: { product: true } },
      cashier: { select: { id: true, name: true } },
      transaction: true,
    },
  });

  if (!order) {
    return res.status(404).json({ status: "error", message: "Order not found" });
  }

  res.json({ status: "success", order });
}

export async function voidOrder(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return res.status(404).json({ status: "error", message: "Order not found" });
  }

  if (order.status === "COMPLETED") {
    return res.status(400).json({ status: "error", message: "Cannot void a completed order. Use refund instead." });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  res.json({ status: "success", order: updated });
}