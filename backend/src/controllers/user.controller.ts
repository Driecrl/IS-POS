import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma";
import { createUserSchema } from "../schemas/user.schema";

export async function createUser(req: Request, res: Response) {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", message: "Invalid input", issues: parsed.error.issues });
  }

  const { name, email, password, roleName } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ status: "error", message: "Email already in use" });
  }

  const role = await prisma.role.findUnique({ where: { roleName } });
  if (!role) {
    return res.status(400).json({ status: "error", message: "Invalid role" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      userRole: {
        create: { roleId: role.id },
      },
    },
    include: { userRole: { include: { role: true } } },
  });

  res.status(201).json({
    status: "success",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.userRole?.role.roleName,
    },
  });
}

export async function listUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany({
    include: { userRole: { include: { role: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    status: "success",
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      isActive: u.isActive,
      role: u.userRole?.role.roleName ?? null,
    })),
  });
}