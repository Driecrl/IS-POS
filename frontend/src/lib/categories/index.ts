/**
 * @uuid         LIB-API-005
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    LIB-AUTH-001
 *
 * @description
 * Client-side API library for Category CRUD operations against the
 * backend /categories endpoint.
 *
 * @whereToUse
 * Import in the Catalog page (Categories tab) and anywhere that needs a
 * category dropdown (e.g. the Products form).
 *
 * @whenToUse
 * Use when listing, creating, updating, or deleting product categories.
 */

import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "./types";

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
 * @uuid         LIB-API-005:getCategories
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Fetches all categories.
 */

/**
 * @uniqueid LIB-API-005:getCategories
 *
 * Lists all categories.
 *
 * @param token - Valid JWT access token.
 * @returns Array of Category records.
 */
export async function getCategories(token: string): Promise<Category[]> {
  const data = await request<{ categories: Category[] }>("/categories", token);
  return data.categories;
}

/**
 * @uuid         LIB-API-005:createCategory
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Creates a new category. Rejected by the backend if the name already
 * exists.
 */

/**
 * @uniqueid LIB-API-005:createCategory
 *
 * Creates a new category.
 *
 * @param payload - name and optional description.
 * @param token - Valid JWT access token (must be SUPER_ADMIN or ADMIN).
 * @returns The created Category.
 */
export async function createCategory(payload: CreateCategoryPayload, token: string): Promise<Category> {
  const data = await request<{ category: Category }>("/categories", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.category;
}

/**
 * @uuid         LIB-API-005:updateCategory
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Updates an existing category's name and/or description.
 */

/**
 * @uniqueid LIB-API-005:updateCategory
 *
 * Updates a category.
 *
 * @param id - Category UUID.
 * @param payload - Fields to update.
 * @param token - Valid JWT access token (must be SUPER_ADMIN or ADMIN).
 * @returns The updated Category.
 */
export async function updateCategory(id: string, payload: UpdateCategoryPayload, token: string): Promise<Category> {
  const data = await request<{ category: Category }>(`/categories/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.category;
}

/**
 * @uuid         LIB-API-005:deleteCategory
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Permanently deletes a category.
 */

/**
 * @uniqueid LIB-API-005:deleteCategory
 *
 * Deletes a category.
 *
 * @param id - Category UUID.
 * @param token - Valid JWT access token (must be SUPER_ADMIN or ADMIN).
 * @returns void
 */
export async function deleteCategory(id: string, token: string): Promise<void> {
  await request<{ status: string }>(`/categories/${id}`, token, {
    method: "DELETE",
  });
}