/**
 * @uuid         LIB-API-007
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    LIB-AUTH-001
 *
 * @description
 * Client-side API library for Reports & Analytics, wrapping the backend
 * /reports endpoints — sales summary, best-selling products, and
 * inventory movement totals.
 *
 * @whereToUse
 * Import in the Reports page.
 *
 * @whenToUse
 * Use when displaying business performance summaries for
 * SUPER_ADMIN/ADMIN/MANAGER roles.
 */

import type { SalesReport, BestSeller, InventoryMovementReport } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(endpoint: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

/**
 * @uuid         LIB-API-007:getSalesReport
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Fetches total sales, discount, and order count for completed orders.
 */

/**
 * @uniqueid LIB-API-007:getSalesReport
 *
 * Retrieves the sales summary report.
 *
 * @param token - Valid JWT access token.
 * @returns SalesReport totals.
 */
export async function getSalesReport(token: string): Promise<SalesReport> {
  const data = await request<{ report: SalesReport }>("/reports/sales", token);
  return data.report;
}

/**
 * @uuid         LIB-API-007:getBestSellers
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Fetches products ranked by quantity sold across all completed orders.
 */

/**
 * @uniqueid LIB-API-007:getBestSellers
 *
 * Retrieves the best-selling products ranking.
 *
 * @param token - Valid JWT access token.
 * @returns Array of BestSeller entries.
 */
export async function getBestSellers(token: string): Promise<BestSeller[]> {
  const data = await request<{ bestSellers: BestSeller[] }>("/reports/best-sellers", token);
  return data.bestSellers;
}

/**
 * @uuid         LIB-API-007:getInventoryMovement
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Fetches aggregate stock-in, stock-out, and adjustment totals across
 * all stock movement records.
 */

/**
 * @uniqueid LIB-API-007:getInventoryMovement
 *
 * Retrieves the inventory movement summary.
 *
 * @param token - Valid JWT access token.
 * @returns InventoryMovementReport totals.
 */
export async function getInventoryMovement(token: string): Promise<InventoryMovementReport> {
  const data = await request<{ report: InventoryMovementReport }>("/reports/inventory-movement", token);
  return data.report;
}