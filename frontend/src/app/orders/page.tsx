"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "#lib/auth";
import { listOrders, voidOrder } from "#lib/orders";
import type { Order } from "#lib/orders/types";
import Navbar from "#components/navbar";

const statusStyles: Record<string, string> = {
  PENDING: "bg-warning-bg text-warning-text",
  COMPLETED: "bg-success-bg text-success-text",
  CANCELLED: "bg-danger-bg text-danger-text",
  REFUNDED: "bg-surface-border text-text-secondary",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    setToken(session.token);
    setRole(session.user.role);
    loadOrders(session.token);
  }, []);

  async function loadOrders(authToken: string) {
    try {
      const data = await listOrders(authToken);
      setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVoid(id: string) {
    if (!token) return;
    if (!confirm("Void this order? This cannot be undone.")) return;
    setBusyId(id);
    try {
      await voidOrder(id, token);
      await loadOrders(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const canVoid = role === "SUPER_ADMIN" || role === "ADMIN";

  return (
    <div className="flex min-h-screen">
      <Navbar activePath="/orders" />
      <main className="flex-1 bg-surface p-8">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">Order History</h1>

        {error && <div className="mb-4 rounded-lg bg-danger-bg p-3 text-danger-text">{error}</div>}

        {loading ? (
          <p className="text-text-muted">Loading...</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border bg-surface text-left text-sm text-text-secondary">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Cashier</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <Fragment key={order.id}>
                    <tr
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      className="cursor-pointer border-b border-surface-border hover:bg-surface"
                    >
                      <td className="p-3 font-mono text-sm text-text-secondary">{order.id.slice(0, 8)}...</td>
                      <td className="p-3 text-text-primary">{order.cashier?.name || "-"}</td>
                      <td className="p-3 font-semibold text-text-primary">₱{Number(order.total).toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-text-muted">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        {canVoid && order.status === "PENDING" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVoid(order.id);
                            }}
                            disabled={busyId === order.id}
                            className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Void
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr className="border-b border-surface-border bg-surface">
                        <td colSpan={6} className="p-4">
                          <p className="mb-2 text-sm font-medium text-text-secondary">Items:</p>
                          <ul className="space-y-1 text-sm text-text-primary">
                            {order.orderItems.map((item) => (
                              <li key={item.id} className="flex justify-between">
                                <span>{item.product?.name || "Unknown product"} × {item.quantity}</span>
                                <span>₱{(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                          {Number(order.discount) > 0 && (
                            <p className="mt-2 text-sm text-text-muted">Discount: ₱{Number(order.discount).toFixed(2)}</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}