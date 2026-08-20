# Orders Module

## Information

Author:     Drie
Time:       2026/08/17
Unique ID:  LIB-API-004
Scope:      api

## Description

Client-side API library for Order operations. Wraps the backend /orders
endpoints for creating orders from a cart, listing/viewing orders, and
voiding them.

## When to Use

Use in the POS page when submitting a cart as a new order, and in any
order-history or order-detail views.

## How to Use

import { createOrder, listOrders } from "@/lib/orders";

const order = await createOrder({ items: [{ productId, quantity: 2 }], discount: 0 }, token);
const orders = await listOrders(token);

## Exported APIs

### createOrder
UUID:       LIB-API-004:createOrder
DependsOn:  none

### listOrders
UUID:       LIB-API-004:listOrders
DependsOn:  none

### getOrder
UUID:       LIB-API-004:getOrder
DependsOn:  none

### voidOrder
UUID:       LIB-API-004:voidOrder
DependsOn:  none

## Notes

- All functions require a valid JWT token as the last argument.
- `createOrder` produces a PENDING order — it does not deduct stock or
  complete payment. Use `lib/payments` `completePayment` next to finish
  the sale.
- `voidOrder` requires SUPER_ADMIN or ADMIN role.