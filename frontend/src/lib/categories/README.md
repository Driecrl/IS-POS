# Categories Module

## Information

Author:     Drie
Time:       2026/08/17
Unique ID:  LIB-API-005
Scope:      api

## Description

Client-side API library for Category CRUD operations. Wraps the backend
/categories endpoints.

## When to Use

Use in the Catalog page (Categories tab), and anywhere a category
dropdown is needed (e.g. the Products form).

## How to Use

import { getCategories, createCategory } from "@/lib/categories";

const categories = await getCategories(token);
await createCategory({ name: "Snacks" }, token);

## Exported APIs

### getCategories
UUID:       LIB-API-005:getCategories
DependsOn:  none

### createCategory
UUID:       LIB-API-005:createCategory
DependsOn:  none

### updateCategory
UUID:       LIB-API-005:updateCategory
DependsOn:  none

### deleteCategory
UUID:       LIB-API-005:deleteCategory
DependsOn:  none

## Notes

- All functions require a valid JWT token as the last argument.
- Create/update/delete require SUPER_ADMIN or ADMIN role.
- `createCategory` fails with a conflict error if the name already exists.