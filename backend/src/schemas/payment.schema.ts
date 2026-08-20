import { z } from "zod";

export const completePaymentSchema = z.object({
  orderId: z.string().uuid(),
  amountPaid: z.number().positive(),
  paymentMethod: z.enum(["CASH", "CARD", "GCASH", "MAYA"]),
});