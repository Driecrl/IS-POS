# Reports Module

## Information

Author:     Drie
Time:       2026/08/17
Unique ID:  LIB-API-007
Scope:      api

## Description

Client-side API library for Reports & Analytics. Wraps the backend
/reports endpoints for sales summary, best-selling products, and
inventory movement totals.

## When to Use

Use in the Reports page for SUPER_ADMIN/ADMIN/MANAGER dashboards.

## How to Use

import { getSalesReport, getBestSellers, getInventoryMovement } from "@/lib/reports";

const sales = await getSalesReport(token);
const bestSellers = await getBestSellers(token);
const movement = await getInventoryMovement(token);

## Exported APIs

### getSalesReport
UUID:       LIB-API-007:getSalesReport
DependsOn:  none

### getBestSellers
UUID:       LIB-API-007:getBestSellers
DependsOn:  none

### getInventoryMovement
UUID:       LIB-API-007:getInventoryMovement
DependsOn:  none

## Notes

- All functions require a valid JWT token as the last argument.
- All three endpoints allow SUPER_ADMIN, ADMIN, and MANAGER roles.