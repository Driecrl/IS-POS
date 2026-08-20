import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/verifyJwt";
import { prisma } from "../utils/prisma";
import { stockInSchema, stockOutSchema, stockAdjustSchema } from "../schemas/stock.schema";

export async function stockIn(req: AuthenticatedRequest, res: Response) {
  const parsed = stockInSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", message: "Invalid input", issues: parsed.error.issues });
  }

  const { productId, quantity, reason } = parsed.data;
  const userId = req.user!.userId;

  const stockLevel = await prisma.stockLevel.findUnique({ where: { productId } });
  if (!stockLevel) {
    return res.status(404).json({ status: "error", message: "Product not found" });
  }

  const [updated] = await prisma.$transaction([
    prisma.stockLevel.update({
      where: { productId },
      data: { quantity: { increment: quantity } },
    }),
    prisma.stockMovement.create({
      data: { productId, userId, type: "STOCK_IN", quantity, reason },
    }),
  ]);

  res.json({ status: "success", stockLevel: updated });
}

export async function stockOut(req: AuthenticatedRequest, res: Response) {
  const parsed = stockOutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", message: "Invalid input", issues: parsed.error.issues });
  }

  const { productId, quantity, reason } = parsed.data;
  const userId = req.user!.userId;

  const stockLevel = await prisma.stockLevel.findUnique({ where: { productId } });
  if (!stockLevel) {
    return res.status(404).json({ status: "error", message: "Product not found" });
  }

  if (stockLevel.quantity < quantity) {
    return res.status(400).json({ status: "error", message: "Insufficient stock" });
  }

  const [updated] = await prisma.$transaction([
    prisma.stockLevel.update({
      where: { productId },
      data: { quantity: { decrement: quantity } },
    }),
    prisma.stockMovement.create({
      data: { productId, userId, type: "STOCK_OUT", quantity, reason },
    }),
  ]);

  res.json({ status: "success", stockLevel: updated });
}

export async function stockAdjust(req: AuthenticatedRequest, res: Response) {
  const parsed = stockAdjustSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", message: "Invalid input", issues: parsed.error.issues });
  }

  const { productId, quantity, reason } = parsed.data;
  const userId = req.user!.userId;

  const stockLevel = await prisma.stockLevel.findUnique({ where: { productId } });
  if (!stockLevel) {
    return res.status(404).json({ status: "error", message: "Product not found" });
  }

  const [updated] = await prisma.$transaction([
    prisma.stockLevel.update({
      where: { productId },
      data: { quantity },
    }),
    prisma.stockMovement.create({
      data: { productId, userId, type: "ADJUSTMENT", quantity, reason },
    }),
  ]);

  res.json({ status: "success", stockLevel: updated });
}

export async function getStockLevels(req: Request, res: Response) {
  const stockLevels = await prisma.stockLevel.findMany({
    include: { product: { include: { category: true } } },
    orderBy: { quantity: "asc" },
  });
  res.json({ status: "success", stockLevels });
}

export async function getLowStock(req: Request, res: Response) {
  const stockLevels = await prisma.stockLevel.findMany({
    include: { product: { include: { category: true } } },
  });
  const lowStock = stockLevels.filter((s) => s.quantity <= s.lowStockThreshold);
  res.json({ status: "success", lowStock });
}

export async function getStockHistory(req: Request, res: Response) {
  const { productId } = req.query;

  const movements = await prisma.stockMovement.findMany({
    where: productId ? { productId: String(productId) } : undefined,
    include: { product: true, user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  res.json({ status: "success", movements });
}