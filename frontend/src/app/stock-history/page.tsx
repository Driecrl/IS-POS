"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "#lib/auth";
import { listStockHistory } from "#lib/stock";
import type { StockMovement } from "#lib/stock/types";
import Navbar from "#components/navbar";

const typeStyles: Record<string, string> = {
  STOCK_IN: "bg-success-bg text-success-text",
  STOCK_OUT: "bg-orange-100 text-orange-700",
  ADJUSTMENT: "bg-brand-100 text-brand-700",
};

export default function StockHistoryPage() {
  const router = useRouter();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [filter, setFilter] = useState<"ALL" | "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT">("ALL");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    loadHistory(session.token);
  }, []);

  async function loadHistory(token: string) {
    try {
      const data = await listStockHistory(token);
      setMovements(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredMovements = filter === "ALL" ? movements : movements.filter((m) => m.type === filter);

  return (
    <div className="flex min-h-screen">
      <Navbar activePath="/stock-history" />
      <main className="flex-1 bg-surface p-8">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">Stock History</h1>

        {error && <div className="mb-4 rounded-lg bg-danger-bg p-3 text-danger-text">{error}</div>}

        <div className="mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="STOCK_IN">Stock In</option>
            <option value="STOCK_OUT">Stock Out</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>
        </div>

        {loading ? (
          <p className="text-text-muted">Loading...</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border bg-surface text-left text-sm text-text-secondary">
                  <th className="p-3">Product</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-text-muted">
                      No movements found
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => (
                    <tr key={m.id} className="border-b border-surface-border">
                      <td className="p-3 text-text-primary">{m.product?.name || "Unknown"}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${typeStyles[m.type]}`}>
                          {m.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-text-primary">{m.quantity}</td>
                      <td className="p-3 text-sm text-text-secondary">{m.reason || "-"}</td>
                      <td className="p-3 text-sm text-text-muted">{new Date(m.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}