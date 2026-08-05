# Std BEnv

## Information

Author:     IzanamiiDevv
Time:       2026-07-06
Unique ID:  LIB-CFG-002
Scope:      config

## Description

Backend (Next.js server-side) environment access layer. Reads variables
written under the BENV_ prefix, coerces them to the requested primitive
type, falls back to a caller-supplied placeholder when missing, and
tracks every requested parameter for later introspection.

## When to Use

Use in Next.js server code only — API routes, route handlers, server
actions, middleware. This module is meant to hold secrets and
server-only config, so never import it from a client component.

## How to Use

```ts
import { env } from "@/lib/StdBEnv";

app.listen(env.get<number>("PORT", 2222));
const dbUrl = env.get<string>("DATABASE_URL", "postgres://localhost:5432/dev");
const strictMode = env.get<boolean>("STRICT_MODE", true);

// What's actually defined in .env right now:
env.list();      // => ["BENV_PORT", "BENV_DATABASE_URL"]

// What the app expects, whether present or not:
env.expected();  // => [{ parameter: "PORT", key: "BENV_PORT", ... }, ...]
```

## Exported APIs

### get

UUID:       LIB-CFG-002:get
DependsOn:  none

### list

UUID:       LIB-CFG-002:list
DependsOn:  none

### expected

UUID:       LIB-CFG-002:expected
DependsOn:  LIB-CFG-002:get

## Notes

- Env keys are always looked up as `BENV_<parameter>` — pass the parameter
  name without the prefix.
- The expected-env registry is in-memory and per-process; it only reflects
  parameters that have actually been requested via `get()` since the
  process started.
- Boolean coercion treats the string `"true"` (case-insensitive) as `true`
  and everything else as `false`.
- Empty-string env values are treated the same as missing — the
  placeholder is used and the entry is marked `resolvedFrom: "placeholder"`.
- Since this module lives under `lib/` (server-only by convention), it is
  safe to read secrets here that would never be safe under `StdFEnv`.
