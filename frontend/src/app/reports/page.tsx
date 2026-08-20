"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "#lib/auth";
import { getSalesReport, getBestSellers, getInventoryMovement } from "#lib/reports";
import type { SalesReport, BestSeller, InventoryMovementReport } from "#lib/reports/types";
import Navbar from "#components/navbar";

export default function ReportsPage() {
  const router = useRouter();
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [movement, setMovement] = useState<InventoryMovementReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    Promise.all([
      getSalesReport(session.token),
      getBestSellers(session.token),
      getInventoryMovement(session.token),
    ])
      .then(([salesData, bestSellersData, movementData]) => {
        setSales(salesData);
        setBestSellers(bestSellersData);
        setMovement(movementData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen">
      <Navbar activePath="/reports" />
      <main className="flex-1 bg-surface p-8">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">Reports</h1>

        {error && <div className="mb-4 rounded-lg bg-danger-bg p-3 text-danger-text">{error}</div>}

        {loading ? (
          <p className="text-text-muted">Loading...</p>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
                <p className="text-sm text-text-secondary">Total Sales</p>
                <p className="mt-1 text-3xl font-bold text-text-primary">₱{sales?.totalSales.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
                <p className="text-sm text-text-secondary">Total Discount</p>
                <p className="mt-1 text-3xl font-bold text-text-primary">₱{sales?.totalDiscount.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
                <p className="text-sm text-text-secondary">Total Orders</p>
                <p className="mt-1 text-3xl font-bold text-text-primary">{sales?.totalOrders}</p>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-text-primary">Best Sellers</h2>
              {bestSellers.length === 0 ? (
                <p className="text-text-muted">No sales data yet</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-sm text-text-secondary">
                      <th className="p-2">Product</th>
                      <th className="p-2">Qty Sold</th>
                      <th className="p-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bestSellers.map((p) => (
                      <tr key={p.productId} className="border-b border-surface-border">
                        <td className="p-2 text-text-primary">{p.name}</td>
                        <td className="p-2 text-text-primary">{p.quantitySold}</td>
                        <td className="p-2 text-text-primary">₱{p.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-text-primary">Inventory Movement</h2>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-text-secondary">Stock In</p>
                  <p className="text-xl font-bold text-success-text">{movement?.stockIn}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Stock Out</p>
                  <p className="text-xl font-bold text-orange-600">{movement?.stockOut}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Adjustments</p>
                  <p className="text-xl font-bold text-brand-700">{movement?.adjustments}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Total Movements</p>
                  <p className="text-xl font-bold text-text-primary">{movement?.totalMovements}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}