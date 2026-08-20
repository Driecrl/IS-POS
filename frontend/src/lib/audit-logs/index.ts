const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

import type { AuditLog } from "./types";

export async function getAuditLogs(token: string): Promise<AuditLog[]> {
  const res = await fetch(`${API_URL}/audit-logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data.logs;
}