import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
  supplierId: z.string().uuid().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  highStockThreshold: z.number().int().nonnegative().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  barcode: z.string().optional(),
  price: z.number().positive().optional(),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]).optional(),
});