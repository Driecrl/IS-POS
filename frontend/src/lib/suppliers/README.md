# Suppliers Module

## Information

Author:     Drie
Time:       2026/08/17
Unique ID:  LIB-API-006
Scope:      api

## Description

Client-side API library for Supplier CRUD operations. Wraps the backend
/suppliers endpoints.

## When to Use

Use in the Catalog page (Suppliers tab), and anywhere a supplier
dropdown is needed (e.g. the Products form).

## How to Use

import { getSuppliers, createSupplier } from "@/lib/suppliers";

const suppliers = await getSuppliers(token);
await createSupplier({ name: "ABC Trading", phone: "09171234567" }, token);

## Exported APIs

### getSuppliers
UUID:       LIB-API-006:getSuppliers
DependsOn:  none

### createSupplier
UUID:       LIB-API-006:createSupplier
DependsOn:  none

### updateSupplier
UUID:       LIB-API-006:updateSupplier
DependsOn:  none

### deleteSupplier
UUID:       LIB-API-006:deleteSupplier
DependsOn:  none

## Notes

- All functions require a valid JWT token as the last argument.
- Create/update/delete require SUPER_ADMIN or ADMIN role.