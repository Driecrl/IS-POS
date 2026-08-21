"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "#lib/auth";
import { apiFetch } from "#lib/api";
import { getInventoryMovement } from "#lib/reports";
import { getProducts } from "#lib/products";
import Navbar from "#components/navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const CATEGORY_COLORS = ["#0d9488", "#2dd4bf", "#f59e0b", "#8b5cf6", "#f87171", "#38bdf8"];

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [movementData, setMovementData] = useState<{ name: string; value: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    apiFetch("/reports/dashboard")
      .then((res: any) => setDashboard(res.dashboard))
      .catch((err) => setError(err.message));

    getInventoryMovement(session.token)
      .then((movement) => {
        setMovementData([
          { name: "Stock In", value: movement.stockIn },
          { name: "Stock Out", value: movement.stockOut },
          { name: "Adjustments", value: movement.adjustments },
        ]);
      })
      .catch((err) => setError(err.message));

    getProducts()
      .then((products) => {
        const counts: Record<string, number> = {};
        for (const p of products) {
          const catName = p.category?.name || "Uncategorized";
          counts[catName] = (counts[catName] || 0) + 1;
        }
        setCategoryData(Object.entries(counts).map(([name, value]) => ({ name, value })));
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="flex min-h-screen">
      <Navbar activePath="/dashboard" />
      <main className="flex-1 bg-surface p-8">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">Dashboard</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-danger-bg p-3 text-danger-text">{error}</div>
        )}

        {dashboard ? (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
                <p className="text-sm text-text-secondary">Today's Sales</p>
                <p className="mt-1 text-3xl font-bold text-text-primary">₱{dashboard.todaySales}</p>
              </div>
              <div className="rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
                <p className="text-sm text-text-secondary">Today's Orders</p>
                <p className="mt-1 text-3xl font-bold text-text-primary">{dashboard.todayOrderCount}</p>
              </div>
              <div className="rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
                <p className="text-sm text-text-secondary">Total Products</p>
                <p className="mt-1 text-3xl font-bold text-text-primary">{dashboard.totalProducts}</p>
              </div>
              <div className="rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
                <p className="text-sm text-text-secondary">Low Stock Items</p>
                <p className={`mt-1 text-3xl font-bold ${dashboard.lowStockCount > 0 ? "text-warning-text" : "text-text-primary"}`}>
                  {dashboard.lowStockCount}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
                <h2 className="mb-1 text-lg font-bold text-text-primary">Stock Movement</h2>
                <p className="mb-4 text-sm text-text-secondary">Inbound vs. outbound units</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={movementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{ borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}
                    />
                    <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
                <h2 className="mb-1 text-lg font-bold text-text-primary">Category Split</h2>
                <p className="mb-4 text-sm text-text-secondary">Share of active products</p>
                {categoryData.length === 0 ? (
                  <p className="text-text-muted">No products yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid #e2e8f0" }} />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span className="text-sm text-text-secondary">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-text-muted">Loading...</p>
        )}
      </main>
    </div>
  );
}