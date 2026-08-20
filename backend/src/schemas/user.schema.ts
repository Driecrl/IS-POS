import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleName: z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER", "CASHIER"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;