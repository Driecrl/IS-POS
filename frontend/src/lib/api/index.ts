/**
 * @uuid         LIB-API-001
 * @author       Drie
 * @date         2026/08/15
 * @dependsOn    LIB-AUTH-001
 *
 * @description
 * Shared HTTP client for talking to the Express backend. Automatically
 * attaches the JWT token from the stored session to every request.
 *
 * @whereToUse
 * Any lib module that needs to call a backend endpoint (products, stock,
 * orders, etc).
 *
 * @whenToUse
 * Whenever fetching or mutating data on the backend.
 */

import { getSession, logout } from "../auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * @uniqueid LIB-API-001:apiFetch
 *
 * Makes an authenticated request to the backend, attaching the stored
 * JWT token if present. Throws on non-2xx responses.
 *
 * @param path - The API path, e.g. "/products".
 * @param options - Standard fetch options.
 * @returns The parsed JSON response.
 */
export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (session?.token) {
    headers["Authorization"] = `Bearer ${session.token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    logout();
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}