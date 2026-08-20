"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "#/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel - hidden on small screens */}
      <div className="relative hidden w-3/5 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 p-12 text-white lg:flex">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold backdrop-blur-sm">
            IP
          </div>
          <span className="text-lg font-semibold">Inventory POS</span>
        </div>

        <div className="relative z-10">
          <h1 className="mb-4 text-4xl font-bold leading-tight">
            Run your store<br />with confidence.
          </h1>
          <p className="mb-8 max-w-md text-brand-100">
            One system for inventory, sales, stock tracking, and reporting —
            built for small and growing businesses.
          </p>

          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm text-brand-50">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">✓</span>
              Real-time stock &amp; low-stock alerts
            </li>
            <li className="flex items-center gap-3 text-sm text-brand-50">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">✓</span>
              Fast POS with QR / barcode scanning
            </li>
            <li className="flex items-center gap-3 text-sm text-brand-50">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">✓</span>
              Sales reports &amp; full audit trail
            </li>
          </ul>
        </div>

        <p className="relative z-10 text-xs text-brand-200">
          © 2026 Inventory POS. All rights reserved.
        </p>
      </div>

      {/* Right login form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-surface p-6 lg:w-2/5">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo (shown when left panel is hidden) */}
          <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
              IP
            </div>
            <span className="text-lg font-semibold text-text-primary">Inventory POS</span>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-surface-border bg-surface-card p-8 shadow-lg"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Welcome back</h2>
              <p className="mt-1 text-sm text-text-secondary">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-danger-bg p-3 text-sm text-danger-text">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-text-secondary">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@store.com"
                className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-text-primary transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-text-secondary">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-surface-border px-3 py-2.5 pr-16 text-text-primary transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-secondary hover:text-brand-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white" />
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-text-muted lg:hidden">
            Inventory POS · Point of Sale &amp; Stock Management
          </p>
        </div>
      </div>
    </div>
  );
}