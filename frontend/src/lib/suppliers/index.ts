/**
 * @uuid         LIB-API-006
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    LIB-AUTH-001
 *
 * @description
 * Client-side API library for Supplier CRUD operations against the
 * backend /suppliers endpoint.
 *
 * @whereToUse
 * Import in the Catalog page (Suppliers tab) and anywhere that needs a
 * supplier dropdown (e.g. the Products form).
 *
 * @whenToUse
 * Use when listing, creating, updating, or deleting suppliers.
 */

import type { Supplier, CreateSupplierPayload, UpdateSupplierPayload } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

/**
 * @uuid         LIB-API-006:getSuppliers
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Fetches all suppliers.
 */

/**
 * @uniqueid LIB-API-006:getSuppliers
 *
 * Lists all suppliers.
 *
 * @param token - Valid JWT access token.
 * @returns Array of Supplier records.
 */
export async function getSuppliers(token: string): Promise<Supplier[]> {
  const data = await request<{ suppliers: Supplier[] }>("/suppliers", token);
  return data.suppliers;
}

/**
 * @uuid         LIB-API-006:createSupplier
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Creates a new supplier.
 */

/**
 * @uniqueid LIB-API-006:createSupplier
 *
 * Creates a new supplier.
 *
 * @param payload - name and optional contact details.
 * @param token - Valid JWT access token (must be SUPER_ADMIN or ADMIN).
 * @returns The created Supplier.
 */
export async function createSupplier(payload: CreateSupplierPayload, token: string): Promise<Supplier> {
  const data = await request<{ supplier: Supplier }>("/suppliers", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.supplier;
}

/**
 * @uuid         LIB-API-006:updateSupplier
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Updates an existing supplier's details.
 */

/**
 * @uniqueid LIB-API-006:updateSupplier
 *
 * Updates a supplier.
 *
 * @param id - Supplier UUID.
 * @param payload - Fields to update.
 * @param token - Valid JWT access token (must be SUPER_ADMIN or ADMIN).
 * @returns The updated Supplier.
 */
export async function updateSupplier(id: string, payload: UpdateSupplierPayload, token: string): Promise<Supplier> {
  const data = await request<{ supplier: Supplier }>(`/suppliers/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.supplier;
}

/**
 * @uuid         LIB-API-006:deleteSupplier
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Permanently deletes a supplier.
 */

/**
 * @uniqueid LIB-API-006:deleteSupplier
 *
 * Deletes a supplier.
 *
 * @param id - Supplier UUID.
 * @param token - Valid JWT access token (must be SUPER_ADMIN or ADMIN).
 * @returns void
 */
export async function deleteSupplier(id: string, token: string): Promise<void> {
  await request<{ status: string }>(`/suppliers/${id}`, token, {
    method: "DELETE",
  });
}