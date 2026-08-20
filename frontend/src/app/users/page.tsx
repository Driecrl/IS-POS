"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "#lib/auth";
import { getUsers, createUser } from "#lib/users";
import type { AppUser, RoleName } from "#lib/users/types";
import Navbar from "#components/navbar";

const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800",
  ADMIN: "bg-brand-100 text-brand-800",
  MANAGER: "bg-warning-bg text-warning-text",
  CASHIER: "bg-success-bg text-success-text",
};

export default function UsersPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleName, setRoleName] = useState<RoleName>("CASHIER");

  async function loadUsers(authToken: string) {
    try {
      const data = await getUsers(authToken);
      setUsers(data);
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
    loadUsers(session.token);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    setSubmitting(true);
    try {
      await createUser({ name, email, password, roleName }, token);
      setName("");
      setEmail("");
      setPassword("");
      setRoleName("CASHIER");
      await loadUsers(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Navbar activePath="/users" />
      <main className="flex-1 bg-surface p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Users</h1>
          <p className="text-sm text-text-secondary">{users.length} account{users.length !== 1 ? "s" : ""}</p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-danger-bg p-3 text-danger-text">{error}</div>}

        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-text-primary">Add New User</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[160px] flex-1">
              <label className="mb-1 block text-sm font-medium text-text-secondary">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Juan Dela Cruz"
                className="w-full rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-sm font-medium text-text-secondary">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="juan@store.com"
                className="w-full rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="min-w-[160px] flex-1">
              <label className="mb-1 block text-sm font-medium text-text-secondary">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-lg border border-surface-border px-3 py-2 pr-16 text-text-primary focus:border-brand-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">Role</label>
              <select
                value={roleName}
                onChange={(e) => setRoleName(e.target.value as RoleName)}
                className="rounded-lg border border-surface-border px-3 py-2 text-text-primary focus:border-brand-500 focus:outline-none"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="CASHIER">Cashier</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add User"}
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-sm">
          {loading ? (
            <p className="p-6 text-text-muted">Loading...</p>
          ) : users.length === 0 ? (
            <p className="p-6 text-text-muted">No users yet</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-surface text-sm text-text-secondary">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-surface-border">
                    <td className="p-3 font-medium text-text-primary">{u.name}</td>
                    <td className="p-3 text-text-secondary">{u.email}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${ROLE_STYLES[u.role ?? ""] ?? "bg-surface text-text-secondary"}`}>
                        {u.role ?? "—"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${u.isActive ? "bg-success-bg text-success-text" : "bg-surface text-text-muted"}`}>
                        {u.isActive ? "Active" : "Inactive"}
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