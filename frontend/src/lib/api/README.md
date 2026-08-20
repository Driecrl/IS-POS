# API Client

## Information

Author:     Drie
Time:       2026/08/15
Unique ID:  LIB-API-001
Scope:      api

## Description

Shared HTTP client for the Express backend. Automatically attaches the
JWT token from the stored session. Auto-logs-out on 401 responses.

## How to Use

import { apiFetch } from "@/lib/api";

const data = await apiFetch("/products");
const created = await apiFetch("/products", { method: "POST", body: JSON.stringify(payload) });

## Exported APIs

### apiFetch

UUID:       LIB-API-001:apiFetch
DependsOn:  LIB-AUTH-001:getSession