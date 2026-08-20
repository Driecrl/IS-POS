/**
 * @uuid         LIB-API-004
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    LIB-AUTH-001
 *
 * @description
 * Client-side API library for Order operations against the backend
 * /orders endpoint — creating orders from a cart, listing and viewing
 * orders, and voiding orders.
 *
 * @whereToUse
 * Import in the POS page and any order-history/order-detail views.
 *
 * @whenToUse
 * Use when submitting a completed cart as a new order, listing past
 * orders, viewing a single order's detail, or voiding an order.
 */

import type { Order, CreateOrderPayload } from "./types";

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
 * @uuid         LIB-API-004:createOrder
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Submits a cart (list of productId/quantity pairs) plus an optional
 * discount as a new order. The backend computes line totals and the
 * order total server-side; the resulting order is created with status
 * PENDING, awaiting payment.
 */

/**
 * @uniqueid LIB-API-004:createOrder
 *
 * Creates a new PENDING order from cart items.
 *
 * @param payload - Cart items and optional discount.
 * @param token - Valid JWT access token.
 * @returns The created Order (status PENDING).
 */
export async function createOrder(payload: CreateOrderPayload, token: string): Promise<Order> {
  const data = await request<{ order: Order }>("/orders", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.order;
}

/**
 * @uuid         LIB-API-004:listOrders
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Fetches all orders, including their items and cashier info.
 */

/**
 * @uniqueid LIB-API-004:listOrders
 *
 * Lists all orders.
 *
 * @param token - Valid JWT access token.
 * @returns Array of Order records.
 */
export async function listOrders(token: string): Promise<Order[]> {
  const data = await request<{ orders: Order[] }>("/orders", token);
  return data.orders;
}

/**
 * @uuid         LIB-API-004:getOrder
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Fetches a single order by ID, including its items and cashier info.
 */

/**
 * @uniqueid LIB-API-004:getOrder
 *
 * Retrieves one order by ID.
 *
 * @param id - Order UUID.
 * @param token - Valid JWT access token.
 * @returns The matching Order.
 */
export async function getOrder(id: string, token: string): Promise<Order> {
  const data = await request<{ order: Order }>(`/orders/${id}`, token);
  return data.order;
}

/**
 * @uuid         LIB-API-004:voidOrder
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Cancels a PENDING order, setting its status to CANCELLED. Restricted
 * to SUPER_ADMIN/ADMIN on the backend.
 */

/**
 * @uniqueid LIB-API-004:voidOrder
 *
 * Voids (cancels) an order.
 *
 * @param id - Order UUID.
 * @param token - Valid JWT access token (must be SUPER_ADMIN or ADMIN).
 * @returns The updated Order (status CANCELLED).
 */
export async function voidOrder(id: string, token: string): Promise<Order> {
  const data = await request<{ order: Order }>(`/orders/${id}/void`, token, {
    method: "PUT",
  });
  return data.order;
}