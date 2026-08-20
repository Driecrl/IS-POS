# Users API

## Information

Author:     Drie
Unique ID:  LIB-API-006
Scope:      api

## Description

Fetches and creates user accounts. Restricted to SUPER_ADMIN/ADMIN on
the backend. Takes an explicit token parameter, matching the pattern
used by lib/orders and lib/payments.

## How to Use

import { getUsers, createUser } from "#lib/users";

const users = await getUsers(token);
const newUser = await createUser({ name, email, password, roleName }, token);