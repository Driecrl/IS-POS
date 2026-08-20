"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "#lib/auth";
import { getProducts, createProduct, updateProduct, getCategories } from "#lib/products";
import type { Product, Category } from "#lib/products/types";
import Navbar from "#components/navbar";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  async function loadData() {
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
      if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
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
    loadData();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createProduct({ name, sku, price: Number(price), categoryId });
      setName("");
      setSku("");
      setPrice("");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setEditName(product.name);
    setEditSku(product.sku);
    setEditPrice(String(product.price));
    setEditCategoryId(product.category?.id ?? categories[0]?.id ?? "");
    setEditError("");
  }

  function closeEditModal() {
    setEditingProduct(null);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;
    setEditError("");
    setEditSubmitting(true);
    try {
      await updateProduct(editingProduct.id, {
        name: editName,
        sku: editSku,
        price: Number(editPrice),
        categoryId: editCategoryId,
      });
      closeEditModal();
      await loadData();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Navbar activePath="/products" />
      <main className="flex-1 bg-surface p-8">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">Products</h1>

        {error && <div className="mb-4 rounded-lg bg-danger-bg p-3 text-danger-text">{error}</div>}

        <form onSubmit={handleCreate} className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
          <div>
            <label className="mb-1 block text-sm text-text-secondary">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">SKU</label>
            <input value={sku} onChange={(e) => setSku(e.target.value)} required className="rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">Price</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-28 rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={submitting} className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50">
            {submitting ? "Adding..." : "Add Product"}
          </button>
        </form>

        {loading ? (
          <p className="text-text-muted">Loading...</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border bg-surface text-left text-sm text-text-secondary">
                  <th className="p-3">Name</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-surface-border">
                    <td className="p-3 text-text-primary">{p.name}</td>
                    <td className="p-3 text-text-secondary">{p.sku}</td>
                    <td className="p-3 text-text-secondary">{p.category?.name}</td>
                    <td className="p-3 font-medium text-text-primary">₱{p.price}</td>
                    <td className="p-3 text-text-primary">{p.stockLevel?.quantity ?? "-"}</td>
                    <td className="p-3 text-text-secondary">{p.status}</td>
                    <td className="p-3">
                      <button
                        onClick={() => openEditModal(p)}
                        className="rounded-lg bg-brand-600 px-3 py-1 text-sm text-white hover:bg-brand-700"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl border border-surface-border bg-surface-card p-6 shadow-lg">
              <h2 className="mb-1 text-lg font-bold text-text-primary">Edit Product</h2>
              <p className="mb-4 text-sm text-text-secondary">{editingProduct.name}</p>

              {editError && <div className="mb-4 rounded-lg bg-danger-bg p-3 text-sm text-danger-text">{editError}</div>}

              <form onSubmit={handleEditSubmit}>
                <div className="mb-3">
                  <label className="mb-1 block text-sm text-text-secondary">Name</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1 block text-sm text-text-secondary">SKU</label>
                  <input
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    required
                    className="w-full rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1 block text-sm text-text-secondary">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                    className="w-full rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="mb-5">
                  <label className="mb-1 block text-sm text-text-secondary">Category</label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 rounded-lg border border-surface-border py-2.5 font-medium text-text-secondary hover:bg-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="flex-1 rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {editSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}