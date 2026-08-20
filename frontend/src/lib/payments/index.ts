/**
 * @uuid         LIB-PAY-001
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    LIB-AUTH-001, LIB-API-004
 *
 * @description
 * Client-side API library for Payment/Transaction operations against the
 * backend /payments endpoint — completing payment on a PENDING order,
 * listing and viewing transactions, and voiding transactions.
 *
 * @whereToUse
 * Import in the POS page (to complete a sale after order creation) and
 * any transaction-history/order-detail views.
 *
 * @whenToUse
 * Use after `createOrder` produces a PENDING order, to record the actual
 * payment, compute change, and mark the order COMPLETED (which also
 * deducts stock on the backend).
 */

import type { Transaction, CompletePaymentPayload } from "./types";

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
 * @uuid         LIB-PAY-001:completePayment
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Records payment for a PENDING order. The backend validates the amount
 * paid, computes change, creates a Transaction, marks the Order
 * COMPLETED, and deducts stock for every line item — all atomically.
 */

/**
 * @uniqueid LIB-PAY-001:completePayment
 *
 * Completes payment for a pending order.
 *
 * @param payload - orderId, amountPaid, and paymentMethod.
 * @param token - Valid JWT access token.
 * @returns The created Transaction (includes computed change).
 */
export async function completePayment(payload: CompletePaymentPayload, token: string): Promise<Transaction> {
  const data = await request<{ transaction: Transaction }>("/payments", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.transaction;
}

/**
 * @uuid         LIB-PAY-001:listTransactions
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Fetches all payment transactions.
 */

/**
 * @uniqueid LIB-PAY-001:listTransactions
 *
 * Lists all transactions.
 *
 * @param token - Valid JWT access token.
 * @returns Array of Transaction records.
 */
export async function listTransactions(token: string): Promise<Transaction[]> {
  const data = await request<{ transactions: Transaction[] }>("/payments", token);
  return data.transactions;
}

/**
 * @uuid         LIB-PAY-001:getTransaction
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Fetches the transaction associated with a specific order.
 */

/**
 * @uniqueid LIB-PAY-001:getTransaction
 *
 * Retrieves the transaction for a given order.
 *
 * @param orderId - Order UUID.
 * @param token - Valid JWT access token.
 * @returns The matching Transaction.
 */
export async function getTransaction(orderId: string, token: string): Promise<Transaction> {
  const data = await request<{ transaction: Transaction }>(`/payments/${orderId}`, token);
  return data.transaction;
}

/**
 * @uuid         LIB-PAY-001:voidTransaction
 * @author       Drie
 * @date         2026/08/17
 * @dependsOn    none
 *
 * @description
 * Voids a completed transaction. Restricted to SUPER_ADMIN/ADMIN on the
 * backend.
 */

/**
 * @uniqueid LIB-PAY-001:voidTransaction
 *
 * Voids a transaction by order ID.
 *
 * @param orderId - Order UUID.
 * @param token - Valid JWT access token (must be SUPER_ADMIN or ADMIN).
 * @returns The updated Transaction (status FAILED or REFUNDED).
 */
export async function voidTransaction(orderId: string, token: string): Promise<Transaction> {
  const data = await request<{ transaction: Transaction }>(`/payments/${orderId}/void`, token, {
    method: "PUT",
  });
  return data.transaction;
}