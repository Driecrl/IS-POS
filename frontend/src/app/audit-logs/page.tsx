"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "#lib/auth";
import { getAuditLogs } from "#lib/audit-logs";
import type { AuditLog } from "#lib/audit-logs/types";
import Navbar from "#components/navbar";

const ACTION_STYLES: Record<string, string> = {
  CREATE: "bg-success-bg text-success-text",
  UPDATE: "bg-brand-100 text-brand-800",
  DELETE: "bg-danger-bg text-danger-text",
  LOGIN: "bg-purple-100 text-purple-800",
  LOGOUT: "bg-surface text-text-secondary",
  FAILED: "bg-danger-bg text-danger-text",
  VOID: "bg-orange-100 text-orange-800",
  ADJUST: "bg-warning-bg text-warning-text",
  EXPORT: "bg-cyan-100 text-cyan-800",
};

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    getAuditLogs(session.token)
      .then(setLogs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const modules = Array.from(new Set(logs.map((l) => l.module))).sort();
  const actions = Array.from(new Set(logs.map((l) => l.action))).sort();

  const filteredLogs = logs.filter(
    (l) =>
      (!moduleFilter || l.module === moduleFilter) &&
      (!actionFilter || l.action === actionFilter)
  );

  return (
    <div className="flex min-h-screen">
      <Navbar activePath="/audit-logs" />
      <main className="flex-1 bg-surface p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Audit Trail</h1>
          <p className="text-sm text-text-secondary">{filteredLogs.length} of {logs.length} entries</p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-danger-bg p-3 text-danger-text">{error}</div>}

        <div className="mb-4 flex gap-3">
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none">
            <option value="">All Modules</option>
            {modules.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none">
            <option value="">All Actions</option>
            {actions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-sm">
          {loading ? (
            <p className="p-6 text-text-muted">Loading...</p>
          ) : filteredLogs.length === 0 ? (
            <p className="p-6 text-text-muted">No logs found</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-text-secondary">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t border-surface-border">
                    <td className="whitespace-nowrap p-3 text-text-muted">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-text-primary">{log.username ?? "—"}</p>
                      <p className="text-xs text-text-muted">{log.userRole ?? ""}</p>
                    </td>
                    <td className="p-3 text-text-primary">{log.module}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${ACTION_STYLES[log.action] ?? "bg-surface text-text-secondary"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-text-secondary">{log.description}</td>
                    <td className="p-3">
                      <span className={log.status === "Success" ? "text-success-text" : "text-danger-text"}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}