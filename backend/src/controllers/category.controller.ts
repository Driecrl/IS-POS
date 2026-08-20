import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { createCategorySchema, updateCategorySchema } from "../schemas/category.schema";

export async function createCategory(req: Request, res: Response) {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", message: "Invalid input", issues: parsed.error.issues });
  }

  const existing = await prisma.category.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return res.status(409).json({ status: "error", message: "Category name already exists" });
  }

  const category = await prisma.category.create({ data: parsed.data });
  res.status(201).json({ status: "success", category });
}

export async function listCategories(req: Request, res: Response) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json({ status: "success", categories });
}

export async function updateCategory(req: Request, res: Response) {
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", message: "Invalid input", issues: parsed.error.issues });
  }

  const { id } = req.params;

  try {
    const category = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });
    res.json({ status: "success", category });
  } catch (error) {
    res.status(404).json({ status: "error", message: "Category not found" });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id } });
    res.json({ status: "success", message: "Category deleted" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ status: "error", message: "Category not found" });
    }
    if (error.code === "P2003") {
      return res.status(400).json({ status: "error", message: "Cannot delete category: products are still linked to it" });
    }
    res.status(500).json({ status: "error", message: "Failed to delete category" });
  }
}
