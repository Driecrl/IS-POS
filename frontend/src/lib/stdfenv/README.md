# Std FEnv

## Information

Author:     IzanamiiDevv
Time:       2026-07-06
Unique ID:  LIB-CFG-001
Scope:      config

## Description

Frontend environment access layer. Reads variables written under the
FENV_ prefix, coerces them to the requested primitive type, falls back to
a caller-supplied placeholder when missing, and tracks every requested
parameter for later introspection.

## When to Use

Use in React frontend code whenever a value should be configurable at
runtime instead of hardcoded — public API base URLs, feature flags,
client-side timeouts, etc. Do not store secrets under FENV_; anything
read here should be treated as public, since frontend bundles are
inherently exposed to the client.

## How to Use

```ts
import { env } from "@/lib/StdFEnv";

const apiBaseUrl = env.get<string>("API_BASE_URL", "http://localhost:3000");
const timeoutMs = env.get<number>("TIMEOUT_MS", 5000);
const betaFlag = env.get<boolean>("BETA_FEATURES", false);

// What's actually defined in .env right now:
env.list();      // => ["FENV_API_BASE_URL", "FENV_TIMEOUT_MS"]

// What the app expects, whether present or not:
env.expected();  // => [{ parameter: "API_BASE_URL", key: "FENV_API_BASE_URL", ... }, ...]
```

## Exported APIs

### get

UUID:       LIB-CFG-001:get
DependsOn:  none

### list

UUID:       LIB-CFG-001:list
DependsOn:  none

### expected

UUID:       LIB-CFG-001:expected
DependsOn:  LIB-CFG-001:get

## Notes

- Env keys are always looked up as `FENV_<parameter>` — pass the parameter
  name without the prefix.
- The expected-env registry is in-memory and per-process; it only reflects
  parameters that have actually been requested via `get()` since the
  process started (e.g. after the relevant module has been imported and
  its code path executed at least once).
- Boolean coercion treats the string `"true"` (case-insensitive) as `true`
  and everything else as `false`.
- Empty-string env values are treated the same as missing — the
  placeholder is used and the entry is marked `resolvedFrom: "placeholder"`.
