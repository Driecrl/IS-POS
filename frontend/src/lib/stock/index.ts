/**
 * @uuid         LIB-API-003
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    LIB-AUTH-001
 *
 * @description
 * Client-side API library for Stock operations against the backend
 * /stock endpoint — reading stock levels, recording stock-in/stock-out,
 * manual adjustments, low-stock alerts, and movement history.
 *
 * @whereToUse
 * Import in the Stock management page, and anywhere that needs to
 * display or mutate stock quantities (e.g. low-stock widgets).
 *
 * @whenToUse
 * Use when listing current stock levels, recording new stock arrivals or
 * deductions, making manual adjustments, checking low-stock items, or
 * reviewing stock movement history.
 */

import type {
  StockLevelEntry,
  StockMovement,
  StockInOutPayload,
  StockAdjustPayload,
} from "./types";

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
 * @uuid         LIB-API-003:listStockLevels
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Fetches current stock levels for all products, including product and
 * category info.
 */

/**
 * @uniqueid LIB-API-003:listStockLevels
 *
 * Lists current stock levels for every product.
 *
 * @param token - Valid JWT access token.
 * @returns Array of StockLevelEntry records.
 */
export async function listStockLevels(token: string): Promise<StockLevelEntry[]> {
  const data = await request<{ stockLevels: StockLevelEntry[] }>("/stock/levels", token);
  return data.stockLevels;
}

/**
 * @uuid         LIB-API-003:getLowStock
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Fetches products whose stock quantity has fallen at or below their
 * low-stock threshold.
 */

/**
 * @uniqueid LIB-API-003:getLowStock
 *
 * Lists products currently at or below their low-stock threshold.
 *
 * @param token - Valid JWT access token.
 * @returns Array of StockLevelEntry records considered low stock.
 */
export async function getLowStock(token: string): Promise<StockLevelEntry[]> {
  const data = await request<{ stockLevels: StockLevelEntry[] }>("/stock/low-stock", token);
  return data.stockLevels;
}

/**
 * @uuid         LIB-API-003:stockIn
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Records incoming stock for a product, incrementing its quantity and
 * creating a STOCK_IN movement record.
 */

/**
 * @uniqueid LIB-API-003:stockIn
 *
 * Records a stock-in transaction.
 *
 * @param payload - productId, positive quantity, and optional reason.
 * @param token - Valid JWT access token.
 * @returns The created StockMovement.
 */
export async function stockIn(payload: StockInOutPayload, token: string): Promise<StockMovement> {
  const data = await request<{ movement: StockMovement }>("/stock/in", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.movement;
}

/**
 * @uuid         LIB-API-003:stockOut
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Records outgoing stock for a product (manual deduction outside of a
 * sale), decrementing its quantity and creating a STOCK_OUT movement
 * record.
 */

/**
 * @uniqueid LIB-API-003:stockOut
 *
 * Records a manual stock-out transaction.
 *
 * @param payload - productId, positive quantity, and optional reason.
 * @param token - Valid JWT access token.
 * @returns The created StockMovement.
 */
export async function stockOut(payload: StockInOutPayload, token: string): Promise<StockMovement> {
  const data = await request<{ movement: StockMovement }>("/stock/out", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.movement;
}

/**
 * @uuid         LIB-API-003:adjustStock
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Manually adjusts a product's stock quantity. Positive quantity
 * increases stock, negative quantity decreases it. A reason is required
 * by the backend and creates an ADJUSTMENT movement record.
 */

/**
 * @uniqueid LIB-API-003:adjustStock
 *
 * Manually adjusts stock quantity (positive or negative) with a
 * required reason.
 *
 * @param payload - productId, signed quantity delta, and reason.
 * @param token - Valid JWT access token.
 * @returns The created StockMovement.
 */
export async function adjustStock(payload: StockAdjustPayload, token: string): Promise<StockMovement> {
  const data = await request<{ movement: StockMovement }>("/stock/adjust", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.movement;
}

/**
 * @uuid         LIB-API-003:listStockHistory
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Fetches the stock movement history across all products.
 */

/**
 * @uniqueid LIB-API-003:listStockHistory
 *
 * Lists stock movement history.
 *
 * @param token - Valid JWT access token.
 * @returns Array of StockMovement records.
 */
export async function listStockHistory(token: string): Promise<StockMovement[]> {
  const data = await request<{ movements: StockMovement[] }>("/stock/history", token);
  return data.movements;
}