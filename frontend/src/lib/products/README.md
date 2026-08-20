# Products API

## Information

Author:     Drie
Unique ID:  LIB-API-002
Scope:      api

## Description

Fetches and creates products via the backend. Also exposes getCategories
since product creation needs a category to link to.

## How to Use

import { getProducts, createProduct, getCategories } from "#lib/products";