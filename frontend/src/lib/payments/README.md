# Payments Module

## Information

Author:     Drie
Time:       2026/08/17
Unique ID:  LIB-PAY-001
Scope:      payment

## Description

Client-side API library for Payment/Transaction operations. Wraps the
backend /payments endpoints for completing payment on a pending order,
listing/viewing transactions, and voiding them.

## When to Use

Use in the POS page after `createOrder` (from `lib/orders`) produces a
PENDING order, to record actual payment and finalize the sale.

## How to Use

import { completePayment } from "@/lib/payments";

const transaction = await completePayment(
  { orderId, amountPaid: 300, paymentMethod: "CASH" },
  token
);
// transaction.change is computed server-side

## Exported APIs

### completePayment
UUID:       LIB-PAY-001:completePayment
DependsOn:  none

### listTransactions
UUID:       LIB-PAY-001:listTransactions
DependsOn:  none

### getTransaction
UUID:       LIB-PAY-001:getTransaction
DependsOn:  none

### voidTransaction
UUID:       LIB-PAY-001:voidTransaction
DependsOn:  none

## Notes

- All functions require a valid JWT token as the last argument.
- `completePayment` triggers stock deduction on the backend — call it
  only once the cashier has confirmed the amount tendered.
- `voidTransaction` requires SUPER_ADMIN or ADMIN role.