import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export async function salesReport(req: Request, res: Response) {
  const { from, to } = req.query;

  const where: any = { status: "COMPLETED" };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(String(from));
    if (to) where.createdAt.lte = new Date(String(to));
  }

  const orders = await prisma.order.findMany({ where });

  const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalDiscount = orders.reduce((sum, o) => sum + Number(o.discount), 0);
  const totalOrders = orders.length;

  res.json({
    status: "success",
    report: { totalSales, totalDiscount, totalOrders },
  });
}

export async function bestSellingProducts(req: Request, res: Response) {
  const orderItems = await prisma.orderItem.findMany({
    include: { product: true, order: true },
    where: { order: { status: "COMPLETED" } },
  });

  const productMap = new Map<string, { name: string; quantitySold: number; revenue: number }>();

  for (const item of orderItems) {
    const existing = productMap.get(item.productId) ?? {
      name: item.product.name,
      quantitySold: 0,
      revenue: 0,
    };
    existing.quantitySold += item.quantity;
    existing.revenue += item.quantity * Number(item.unitPrice);
    productMap.set(item.productId, existing);
  }

  const bestSellers = Array.from(productMap.entries())
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 10);

  res.json({ status: "success", bestSellers });
}

export async function inventoryMovementReport(req: Request, res: Response) {
  const { from, to } = req.query;

  const where: any = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(String(from));
    if (to) where.createdAt.lte = new Date(String(to));
  }

  const movements = await prisma.stockMovement.findMany({
    where,
    include: { product: true },
  });

  const stockIn = movements.filter((m) => m.type === "STOCK_IN").reduce((sum, m) => sum + m.quantity, 0);
  const stockOut = movements.filter((m) => m.type === "STOCK_OUT").reduce((sum, m) => sum + m.quantity, 0);
  const adjustments = movements.filter((m) => m.type === "ADJUSTMENT").length;

  res.json({
    status: "success",
    report: { stockIn, stockOut, adjustments, totalMovements: movements.length },
  });
}

export async function dashboardSummary(req: Request, res: Response) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayOrders, totalProducts, lowStockCount, recentOrders] = await Promise.all([
    prisma.order.findMany({ where: { status: "COMPLETED", createdAt: { gte: today } } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.stockLevel.count({ where: { quantity: { lte: 10 } } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { cashier: { select: { name: true } } },
    }),
  ]);

  const todaySales = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);

  res.json({
    status: "success",
    dashboard: {
      todaySales,
      todayOrderCount: todayOrders.length,
      totalProducts,
      lowStockCount,
      recentOrders,
    },
  });
}