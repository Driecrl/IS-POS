# Stock Module

## Information

Author:     Drie
Time:       2026/08/17
Unique ID:  LIB-API-003
Scope:      api

## Description

Client-side API library for Stock operations. Wraps the backend /stock
endpoints for reading stock levels, recording stock-in/stock-out, manual
adjustments, low-stock alerts, and movement history.

## When to Use

Use in the Stock management page, and anywhere that needs to display or
mutate stock quantities.

## How to Use

import { listStockLevels, stockIn, adjustStock } from "@/lib/stock";

const levels = await listStockLevels(token);
await stockIn({ productId, quantity: 50, reason: "New delivery" }, token);
await adjustStock({ productId, quantity: -2, reason: "Damaged goods" }, token);

## Exported APIs

### listStockLevels
UUID:       LIB-API-003:listStockLevels
DependsOn:  none

### getLowStock
UUID:       LIB-API-003:getLowStock
DependsOn:  none

### stockIn
UUID:       LIB-API-003:stockIn
DependsOn:  none

### stockOut
UUID:       LIB-API-003:stockOut
DependsOn:  none

### adjustStock
UUID:       LIB-API-003:adjustStock
DependsOn:  none

### listStockHistory
UUID:       LIB-API-003:listStockHistory
DependsOn:  none

## Notes

- All functions require a valid JWT token as the last argument.
- `stockIn`/`stockOut` require a positive `quantity` — sign is implied by the endpoint.
- `adjustStock` accepts a signed `quantity` (positive to add, negative to subtract) and always requires a `reason`.
- Requires SUPER_ADMIN, ADMIN, or MANAGER role for all mutating endpoints (in/out/adjust); read endpoints allow any authenticated role.