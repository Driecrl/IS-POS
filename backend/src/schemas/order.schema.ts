import { z } from "zod";

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Order must have at least one item"),
  discount: z.number().nonnegative().optional().default(0),
});