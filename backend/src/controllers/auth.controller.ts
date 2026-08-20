import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { loginSchema } from "../schemas/auth.schema";
import { logAudit } from "../utils/auditLog";

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", message: "Invalid input", issues: parsed.error.issues });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { userRole: { include: { role: true } } },
  });

  if (!user || !user.isActive) {
    await logAudit({
      username: email,
      module: "Auth",
      action: "FAILED",
      description: `Failed login attempt for ${email}`,
      status: "Failed",
    });
    return res.status(401).json({ status: "error", message: "Invalid credentials" });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    await logAudit({
      userId: user.id,
      username: user.name,
      module: "Auth",
      action: "FAILED",
      description: `Failed login attempt (wrong password) for ${email}`,
      status: "Failed",
    });
    return res.status(401).json({ status: "error", message: "Invalid credentials" });
  }

  const roleName = user.userRole?.role.roleName ?? null;

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: roleName },
    process.env.JWT_SECRET as string,
    { expiresIn: "8h" }
  );

  await logAudit({
    userId: user.id,
    username: user.name,
    userRole: roleName,
    module: "Auth",
    action: "LOGIN",
    description: `${user.name} logged in`,
  });

  res.json({
    status: "success",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: roleName,
    },
  });
}