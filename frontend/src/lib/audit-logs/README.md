# Audit Logs API

## Information

Author:     Drie
Unique ID:  LIB-API-007
Scope:      api

## Description

Fetches audit trail entries. Restricted to SUPER_ADMIN/ADMIN on the
backend.

## How to Use

import { getAuditLogs } from "#lib/audit-logs";

const logs = await getAuditLogs(token);