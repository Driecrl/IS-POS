"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "#lib/auth";
import { listStockLevels, stockIn, stockOut } from "#lib/stock";
import type { StockLevelEntry } from "#lib/stock/types";
import Navbar from "#components/navbar";

export default function StockPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<StockLevelEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [modal, setModal] = useState<{ productId: string; mode: "in" | "out" } | null>(null);
  const [quantity, setQuantity] = useState("");

  async function loadData(authToken: string) {
    try {
      const data = await listStockLevels(authToken);
      setLevels(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    setToken(session.token);
    loadData(session.token);
  }, []);

  function openModal(productId: string, mode: "in" | "out") {
    setQuantity("");
    setModal({ productId, mode });
  }

  function closeModal() {
    setModal(null);
    setQuantity("");
  }

  async function handleConfirm() {
    if (!token || !modal) return;
    const qty = Number(quantity);
    if (!qty || qty <= 0) return;

    setBusyId(modal.productId);
    try {
      if (modal.mode === "in") {
        await stockIn({ productId: modal.productId, quantity: qty, reason: "Manual stock-in via UI" }, token);
      } else {
        await stockOut({ productId: modal.productId, quantity: qty, reason: "Manual stock-out via UI" }, token);
      }
      await loadData(token);
      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const modalProduct = levels.find((l) => l.productId === modal?.productId);

  return (
    <div className="flex min-h-screen">
      <Navbar activePath="/stock" />
      <main className="flex-1 bg-surface p-8">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">Stock Levels</h1>

        {error && <div className="mb-4 rounded-lg bg-danger-bg p-3 text-danger-text">{error}</div>}

        {loading ? (
          <p className="text-text-muted">Loading...</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border bg-surface text-left text-sm text-text-secondary">
                  <th className="p-3">Product</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Low Stock At</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((s) => (
                  <tr key={s.id} className={`border-b border-surface-border ${s.quantity <= s.lowStockThreshold ? "bg-danger-bg/40" : ""}`}>
                    <td className="p-3 text-text-primary">{s.product.name}</td>
                    <td className="p-3 text-text-secondary">{s.product.sku}</td>
                    <td className="p-3 font-bold text-text-primary">{s.quantity}</td>
                    <td className="p-3 text-text-secondary">{s.lowStockThreshold}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        disabled={busyId === s.productId}
                        onClick={() => openModal(s.productId, "in")}
                        className="rounded-lg bg-brand-600 px-3 py-1 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
                      >
                        Stock In
                      </button>
                      <button
                        disabled={busyId === s.productId}
                        onClick={() => openModal(s.productId, "out")}
                        className="rounded-lg bg-orange-600 px-3 py-1 text-sm text-white hover:bg-orange-700 disabled:opacity-50"
                      >
                        Stock Out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl border border-surface-border bg-surface-card p-6 shadow-lg">
              <h2 className="mb-1 text-lg font-bold text-text-primary">
                {modal.mode === "in" ? "Stock In" : "Stock Out"}
              </h2>
              <p className="mb-4 text-sm text-text-secondary">
                {modalProduct?.product.name} — {modal.mode === "in" ? "add units to" : "remove units from"} stock
              </p>

              <label className="mb-1 block text-sm font-medium text-text-secondary">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                autoFocus
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                className="mb-5 w-full rounded-lg border border-surface-border px-4 py-2.5 text-text-primary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                placeholder="0"
              />

              <div className="flex gap-2">
                <button
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-surface-border py-2.5 font-medium text-text-secondary hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!quantity || Number(quantity) <= 0 || busyId === modal.productId}
                  className={`flex-1 rounded-lg py-2.5 font-medium text-white disabled:opacity-50 ${
                    modal.mode === "in" ? "bg-brand-600 hover:bg-brand-700" : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {busyId === modal.productId ? "Saving..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}