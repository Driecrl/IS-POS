import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export async function listAuditLogs(req: Request, res: Response) {
  const { module, action, status, userId } = req.query;

  const where: any = {};
  if (module) where.module = String(module);
  if (action) where.action = String(action);
  if (status) where.status = String(status);
  if (userId) where.userId = String(userId);

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  res.json({ status: "success", logs });
}