import { prisma } from "./prisma";

interface AuditLogInput {
  userId?: string | null;
  username?: string | null;
  userRole?: string | null;
  module: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "EXPORT" | "VOID" | "ADJUST" | "FAILED";
  description: string;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  status?: string;
}

export async function logAudit(input: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        username: input.username ?? null,
        userRole: input.userRole ?? null,
        module: input.module,
        action: input.action,
        description: input.description,
        oldValue: input.oldValue ?? null,
        newValue: input.newValue ?? null,
        ipAddress: input.ipAddress ?? null,
        status: input.status ?? "Success",
      },
    });
  } catch (error) {
    console.error("AUDIT LOG FAILED:", error);
  }
}