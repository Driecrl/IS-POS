import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { createProductSchema, updateProductSchema } from "../schemas/product.schema";

export async function createProduct(req: Request, res: Response) {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", message: "Invalid input", issues: parsed.error.issues });
  }

  const { name, sku, barcode, price, categoryId, supplierId, lowStockThreshold, highStockThreshold } = parsed.data;

  const existingSku = await prisma.product.findUnique({ where: { sku } });
  if (existingSku) {
    return res.status(409).json({ status: "error", message: "SKU already exists" });
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return res.status(400).json({ status: "error", message: "Invalid category" });
  }

  if (supplierId) {
    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      return res.status(400).json({ status: "error", message: "Invalid supplier" });
    }
  }

  const product = await prisma.product.create({
    data: {
      name,
      sku,
      barcode,
      price,
      categoryId,
      supplierId,
      stockLevel: {
        create: {
          quantity: 0,
          lowStockThreshold: lowStockThreshold ?? 10,
          highStockThreshold: highStockThreshold ?? 100,
        },
      },
    },
    include: { category: true, supplier: true, stockLevel: true },
  });

  res.status(201).json({ status: "success", product });
}

export async function listProducts(req: Request, res: Response) {
  const products = await prisma.product.findMany({
    include: { category: true, supplier: true, stockLevel: true },
    orderBy: { name: "asc" },
  });
  res.json({ status: "success", products });
}

export async function getProduct(req: Request, res: Response) {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, supplier: true, stockLevel: true },
  });

  if (!product) {
    return res.status(404).json({ status: "error", message: "Product not found" });
  }

  res.json({ status: "success", product });
}

export async function updateProduct(req: Request, res: Response) {
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", message: "Invalid input", issues: parsed.error.issues });
  }

  const { id } = req.params;

  try {
    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      include: { category: true, supplier: true, stockLevel: true },
    });
    res.json({ status: "success", product });
  } catch (error) {
    res.status(404).json({ status: "error", message: "Product not found" });
  }
}

export async function deactivateProduct(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const product = await prisma.product.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
    res.json({ status: "success", message: "Product deactivated", product });
  } catch (error) {
    res.status(404).json({ status: "error", message: "Product not found" });
  }
}