"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "#lib/auth";
import { getCategories, createCategory, updateCategory, deleteCategory } from "#lib/categories";
import type { Category } from "#lib/categories/types";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "#lib/suppliers";
import type { Supplier } from "#lib/suppliers/types";
import Navbar from "#components/navbar";

export default function CatalogPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<"categories" | "suppliers">("categories");
  const [error, setError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierName, setSupplierName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");

  // Edit Category modal state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");
  const [editCatError, setEditCatError] = useState("");
  const [editCatSubmitting, setEditCatSubmitting] = useState(false);

  // Edit Supplier modal state
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editSupName, setEditSupName] = useState("");
  const [editSupContact, setEditSupContact] = useState("");
  const [editSupPhone, setEditSupPhone] = useState("");
  const [editSupError, setEditSupError] = useState("");
  const [editSupSubmitting, setEditSupSubmitting] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    setToken(session.token);
    loadCategories(session.token);
    loadSuppliers(session.token);
  }, []);

  async function loadCategories(authToken: string) {
    try {
      const data = await getCategories(authToken);
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function loadSuppliers(authToken: string) {
    try {
      const data = await getSuppliers(authToken);
      setSuppliers(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !categoryName) return;
    setError("");
    try {
      await createCategory({ name: categoryName, description: categoryDesc || undefined }, token);
      setCategoryName("");
      setCategoryDesc("");
      loadCategories(token);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!token) return;
    setError("");
    try {
      await deleteCategory(id, token);
      loadCategories(token);
    } catch (err: any) {
      setError(err.message);
    }
  }

  function openEditCategory(cat: Category) {
    setEditingCategory(cat);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || "");
    setEditCatError("");
  }

  function closeEditCategory() {
    setEditingCategory(null);
  }

  async function handleEditCategorySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !editingCategory) return;
    setEditCatError("");
    setEditCatSubmitting(true);
    try {
      await updateCategory(
        editingCategory.id,
        { name: editCatName, description: editCatDesc || undefined },
        token
      );
      closeEditCategory();
      loadCategories(token);
    } catch (err: any) {
      setEditCatError(err.message);
    } finally {
      setEditCatSubmitting(false);
    }
  }

  async function handleAddSupplier(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !supplierName) return;
    setError("");
    try {
      await createSupplier(
        { name: supplierName, contactName: supplierContact || undefined, phone: supplierPhone || undefined },
        token
      );
      setSupplierName("");
      setSupplierContact("");
      setSupplierPhone("");
      loadSuppliers(token);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeleteSupplier(id: string) {
    if (!token) return;
    setError("");
    try {
      await deleteSupplier(id, token);
      loadSuppliers(token);
    } catch (err: any) {
      setError(err.message);
    }
  }

  function openEditSupplier(sup: Supplier) {
    setEditingSupplier(sup);
    setEditSupName(sup.name);
    setEditSupContact(sup.contactName || "");
    setEditSupPhone(sup.phone || "");
    setEditSupError("");
  }

  function closeEditSupplier() {
    setEditingSupplier(null);
  }

  async function handleEditSupplierSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !editingSupplier) return;
    setEditSupError("");
    setEditSupSubmitting(true);
    try {
      await updateSupplier(
        editingSupplier.id,
        { name: editSupName, contactName: editSupContact || undefined, phone: editSupPhone || undefined },
        token
      );
      closeEditSupplier();
      loadSuppliers(token);
    } catch (err: any) {
      setEditSupError(err.message);
    } finally {
      setEditSupSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Navbar activePath="/catalog" />
      <main className="flex-1 bg-surface p-8">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">Catalog</h1>

        {error && <div className="mb-4 rounded-lg bg-danger-bg p-3 text-danger-text">{error}</div>}

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setTab("categories")}
            className={`rounded-lg px-4 py-2 font-medium ${
              tab === "categories" ? "bg-brand-600 text-white" : "bg-surface-card text-text-secondary"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setTab("suppliers")}
            className={`rounded-lg px-4 py-2 font-medium ${
              tab === "suppliers" ? "bg-brand-600 text-white" : "bg-surface-card text-text-secondary"
            }`}
          >
            Suppliers
          </button>
        </div>

        {tab === "categories" && (
          <div>
            <form onSubmit={handleAddCategory} className="mb-4 flex gap-3 rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
              <input
                type="text"
                placeholder="Category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
                className="flex-1 rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={categoryDesc}
                onChange={(e) => setCategoryDesc(e.target.value)}
                className="flex-1 rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
              />
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">
                Add Category
              </button>
            </form>

            <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border bg-surface text-left text-sm text-text-secondary">
                    <th className="p-3">Name</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id} className="border-b border-surface-border">
                      <td className="p-3 text-text-primary">{c.name}</td>
                      <td className="p-3 text-text-secondary">{c.description || "-"}</td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => openEditCategory(c)}
                          className="rounded-lg bg-brand-600 px-3 py-1 text-sm text-white hover:bg-brand-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "suppliers" && (
          <div>
            <form onSubmit={handleAddSupplier} className="mb-4 flex gap-3 rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
              <input
                type="text"
                placeholder="Supplier name"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                required
                className="flex-1 rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Contact person (optional)"
                value={supplierContact}
                onChange={(e) => setSupplierContact(e.target.value)}
                className="flex-1 rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Phone (optional)"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                className="flex-1 rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
              />
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">
                Add Supplier
              </button>
            </form>

            <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border bg-surface text-left text-sm text-text-secondary">
                    <th className="p-3">Name</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id} className="border-b border-surface-border">
                      <td className="p-3 text-text-primary">{s.name}</td>
                      <td className="p-3 text-text-secondary">{s.contactName || "-"}</td>
                      <td className="p-3 text-text-secondary">{s.phone || "-"}</td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => openEditSupplier(s)}
                          className="rounded-lg bg-brand-600 px-3 py-1 text-sm text-white hover:bg-brand-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(s.id)}
                          className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl border border-surface-border bg-surface-card p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-bold text-text-primary">Edit Category</h2>

              {editCatError && <div className="mb-4 rounded-lg bg-danger-bg p-3 text-sm text-danger-text">{editCatError}</div>}

              <form onSubmit={handleEditCategorySubmit}>
                <div className="mb-3">
                  <label className="mb-1 block text-sm text-text-secondary">Name</label>
                  <input
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="mb-5">
                  <label className="mb-1 block text-sm text-text-secondary">Description</label>
                  <input
                    value={editCatDesc}
                    onChange={(e) => setEditCatDesc(e.target.value)}
                    className="w-full rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeEditCategory}
                    className="flex-1 rounded-lg border border-surface-border py-2.5 font-medium text-text-secondary hover:bg-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editCatSubmitting}
                    className="flex-1 rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {editCatSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Supplier Modal */}
        {editingSupplier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl border border-surface-border bg-surface-card p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-bold text-text-primary">Edit Supplier</h2>

              {editSupError && <div className="mb-4 rounded-lg bg-danger-bg p-3 text-sm text-danger-text">{editSupError}</div>}

              <form onSubmit={handleEditSupplierSubmit}>
                <div className="mb-3">
                  <label className="mb-1 block text-sm text-text-secondary">Name</label>
                  <input
                    value={editSupName}
                    onChange={(e) => setEditSupName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1 block text-sm text-text-secondary">Contact Person</label>
                  <input
                    value={editSupContact}
                    onChange={(e) => setEditSupContact(e.target.value)}
                    className="w-full rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="mb-5">
                  <label className="mb-1 block text-sm text-text-secondary">Phone</label>
                  <input
                    value={editSupPhone}
                    onChange={(e) => setEditSupPhone(e.target.value)}
                    className="w-full rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeEditSupplier}
                    className="flex-1 rounded-lg border border-surface-border py-2.5 font-medium text-text-secondary hover:bg-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSupSubmitting}
                    className="flex-1 rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {editSupSubmitting ? "Saving..." : "Save Changes"}
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