import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { createSupplierSchema, updateSupplierSchema } from "../schemas/supplier.schema";

export async function createSupplier(req: Request, res: Response) {
  const parsed = createSupplierSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", message: "Invalid input", issues: parsed.error.issues });
  }

  const supplier = await prisma.supplier.create({ data: parsed.data });
  res.status(201).json({ status: "success", supplier });
}

export async function listSuppliers(req: Request, res: Response) {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  res.json({ status: "success", suppliers });
}

export async function updateSupplier(req: Request, res: Response) {
  const parsed = updateSupplierSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", message: "Invalid input", issues: parsed.error.issues });
  }

  const { id } = req.params;

  try {
    const supplier = await prisma.supplier.update({ where: { id }, data: parsed.data });
    res.json({ status: "success", supplier });
  } catch (error) {
    res.status(404).json({ status: "error", message: "Supplier not found" });
  }
}

export async function deleteSupplier(req: Request, res: Response) {
  const { id } = req.params;

  try {
    await prisma.supplier.delete({ where: { id } });
    res.json({ status: "success", message: "Supplier deleted" });
  } catch (error) {
    res.status(404).json({ status: "error", message: "Supplier not found" });
  }
}