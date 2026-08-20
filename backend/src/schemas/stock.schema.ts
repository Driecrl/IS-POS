import { z } from "zod";

export const stockInSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  reason: z.string().optional(),
});

export const stockOutSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  reason: z.string().optional(),
});

export const stockAdjustSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int(),
  reason: z.string().min(1, "Reason is required for adjustments"),
});