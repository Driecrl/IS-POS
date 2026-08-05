# Pavillion Module Declaration — AI Reference Prompt

> **For AI assistants.** This document teaches you how to declare a module that is compatible with the **Pavillion package manager** (`pavillion.bat`). Read this fully before generating any module.

---

## What a "Module" Is

A Pavillion module is a self-contained, installable unit of code. It lives across one or more of these three scopes inside a project:

| Scope | Folder | What goes here |
|---|---|---|
| `lib` | `frontend/src/lib/<ModuleName>/` | Side-effectful libraries (auth, API clients, DB, email…) |
| `utils` | `frontend/src/utils/<ModuleName>/` | Pure stateless helper functions (string, date, number…) |
| `components` | `frontend/src/components/<ModuleName>/` | Reusable React UI components |

The **manifest** (`pavillion.module.json`) lives separately at:

```
frontend/src/module/<ModuleName>/pavillion.module.json
```

It is the **only** thing inside `module/`. Never put source code there.

---

## Before Generating a Module — Ask the User

Before writing any code, if the user hasn't already provided all of the following, ask them to fill in:

```
Module Name:      (use "_" instead of spaces, lowercase — e.g. std_benv)
ModuleID/Artifact: (CATEGORY-SCOPE-NUMBER, e.g. LIB-CFG-002)
Author:
Version:
Uses:              (lib / utils / components — one or more)
```

Only proceed to generate scopes once these five fields are known. The user may still supply source code or a description per scope alongside this.

---

## How a User Declares a Module to You

A user will describe a module like this:

```
Module Name: std_benv
ModuleID/Artifact: LIB-CFG-002
Author: IzanamiiDevv
Version: 1
Uses: lib
Depends on: (none / or list other module_names)

Lib: <source code or description>
Utils: <source code or description>
Components: <source code or description>
```

They may provide one scope, two, or all three. Generate **only the scopes they specify**.

---

## Files You Must Generate per Scope

### `lib/<ModuleName>/` and `utils/<ModuleName>/`

```
README.md
types.ts
index.ts
```

### `components/<ModuleName>/`

```
README.md
types.ts
style.css
index.tsx        ← TSX, not TS
```

### `module/<ModuleName>/` (always, regardless of scopes)

```
pavillion.module.json
```

---

## 1. `pavillion.module.json` — The Manifest

This is what `pavillion install` reads. **Every field is required.**

```json
{
  "module_name": "Example Module",
  "author": ["IzanamiiDevv"],
  "module_id": "LIB-EXM-001",
  "version": 1,
  "depends_on": [],
  "uses": ["lib", "utils"]
}
```

| Field | Type | Rules |
|---|---|---|
| `module_name` | `string` | Human-readable display name. Must match how other modules reference it in `depends_on`. |
| `author` | `string[]` | GitHub handles or full names in an array. |
| `module_id` | `string` | Unique ID in `CATEGORY-SCOPE-NUMBER` format. This is the module's single **Artifact** — see section below. |
| `version` | `number` | Integer. Starts at `1`. Increment on breaking changes. |
| `depends_on` | `string[]` | Array of `module_name` values of required modules. Empty array if none. |
| `uses` | `string[]` | Which scopes this module provides. Values: `"lib"`, `"utils"`, `"components"`. |

> `pavillion status` reads `depends_on` to detect missing modules.
> `pavillion status module` reads `uses` to verify files exist on disk.

---

## 2. The Artifact ID Convention

Each module gets **exactly one** unique ID, called the **Artifact**, in this format:

```
<CATEGORY>-<SCOPE>-<NUMBER>
```

This is a **module-level** ID only — it is not regenerated per function. It is set once, in `pavillion.module.json` as `module_id`, and reused as the `@uuid` in every file header inside that module.

| Category | Prefix | Example |
|---|---|---|
| Utility | `UTL` | `UTL-STR-001` |
| Library | `LIB` | `LIB-AUTH-005` |
| Component | `CMP` | `CMP-BTN-001` |

**Scope** is a short lowercase keyword matching the module's domain (see scope tables below).
**Number** is zero-padded to 3 digits and increments per module within the scope (not per function).

### Identifying individual functions

When a module exports more than one function, identify each one by appending `:<functionName>` to the Artifact:

```
<Artifact>:<functionName>
```

For example, if the Artifact is `LIB-CFG-002`:

- `LIB-CFG-002:get`
- `LIB-CFG-002:list`
- `LIB-CFG-002:expected`

There is only ever **one Artifact per module** — every function reference is that same Artifact with a `:functionName` suffix, never a new incrementing number.

---

## 3. Scope Reference

### `utils` scopes (pure stateless helpers)

| Scope | ID Prefix | Domain |
|---|---|---|
| `string` | `UTL-STR` | String formatting, normalization, parsing |
| `date` | `UTL-DATE` | Date formatting, calculation, timezone |
| `number` | `UTL-NUM` | Numeric formatting, rounding, math |
| `array` | `UTL-ARR` | Array manipulation, deduplication, sorting |
| `object` | `UTL-OBJ` | Object merging, deep cloning, key transforms |
| `validation` | `UTL-VAL` | Input validation (email, phone, URL…) |
| `color` | `UTL-CLR` | Color conversion, contrast, palette |
| `storage` | `UTL-STG` | LocalStorage / SessionStorage wrappers |
| `env` | `UTL-ENV` | Environment variable access and validation |
| `file` | `UTL-FILE` | File size, extension, MIME type helpers |

### `lib` scopes (side-effectful libraries)

| Scope | ID Prefix | Domain |
|---|---|---|
| `auth` | `LIB-AUTH` | Session management, token handling, guards |
| `api` | `LIB-API` | HTTP client wrappers for REST / GraphQL |
| `db` | `LIB-DB` | Database query builders, ORM helpers |
| `cache` | `LIB-CACHE` | In-memory and Redis cache, TTL handling |
| `email` | `LIB-EMAIL` | Transactional email via SMTP or SDK |
| `storage` | `LIB-STG` | Cloud file storage: upload, download, signed URLs |
| `logger` | `LIB-LOG` | Structured logging, log levels, transports |
| `config` | `LIB-CFG` | App config loading, validation, typed access |
| `payment` | `LIB-PAY` | Payment gateway integrations |
| `ws` | `LIB-WS` | WebSocket connection, event subscriptions |
| `queue` | `LIB-QUE` | Background job queue, worker dispatch |
| `search` | `LIB-SRC` | Search index management and query execution |

### `components` scopes (React UI)

| Scope | ID Prefix | Domain |
|---|---|---|
| `button` | `CMP-BTN` | Button variants |
| `input` | `CMP-INP` | Form inputs |
| `modal` | `CMP-MOD` | Modals, drawers, overlay panels |
| `table` | `CMP-TBL` | Data tables with sorting / pagination |
| `card` | `CMP-CRD` | Card layout components |
| `nav` | `CMP-NAV` | Navbar, sidebar, breadcrumbs, tabs |
| `form` | `CMP-FRM` | Form wrappers, field groups, error displays |
| `feedback` | `CMP-FBK` | Toast, alert, badge, progress bar |
| `layout` | `CMP-LAY` | Containers, grids, stacks, dividers |
| `chart` | `CMP-CHT` | Data visualization components |

---

## 4. `index.ts` / `index.tsx` — Global Module Header

Every `index.ts` and `index.tsx` (and `style.css`) must start with a **Global Module Header**. Note `@uuid` is always the module's single Artifact, and `Date` replaces the old time field:

```ts
/**
 * @uuid         LIB-AUTH-001
 * @author       Rafael Luis J. Oli
 * @date         2026/06/28
 * @dependsOn    none
 *
 * @description
 * One to three sentences explaining what this module does.
 *
 * @whereToUse
 * Which folder, feature, or layer should import this module.
 *
 * @whenToUse
 * The conditions or scenarios that should trigger use of this module.
 */
```

Then each **exported function** gets a **Function Header** directly above it, using `<Artifact>:<functionName>` for `@uuid`:

```ts
/**
 * @uuid         LIB-AUTH-001:exampleFn
 * @author       Rafael Luis J. Oli
 * @date         2026/06/28
 * @dependsOn    none
 *
 * @description
 * One to two sentences. What the function does and what it returns.
 */
export function exampleFn(): void {
  // implementation
}
```

Plus JSDoc tags on each export:

```ts
/**
 * @uniqueid LIB-AUTH-001:exampleFn
 *
 * Sends a GET request to the specified endpoint.
 *
 * @param endpoint - The relative API path.
 * @returns The parsed JSON response.
 * @throws {ApiError} When the server returns a non-2xx status.
 */
```

> For **components**, JSDoc is only required on complex internal helper functions, not on the React component itself.

---

## 5. `types.ts`

All shared TypeScript interfaces, types, and enums go here. **Never export types from `index.ts`.**

```ts
// types.ts
export interface ExampleType {
  id: string
  value: string
}
```

---

## 6. `README.md` — Required Sections

Every module must have a README with these exact sections. `Time` is now a plain `Date` in `YYYY/MM/DD` format:

```markdown
# <Module Name>

## Information

Author:     <Full Name>
Time:       <YYYY/MM/DD>
Unique ID:  <Artifact, e.g. LIB-EXM-001>
Scope:      <scope keyword>

## Description

One to three sentences explaining what the module does.

## When to Use

Describe the scenarios where this module should be used.

## How to Use

import { exampleFn } from "@/lib/<ModuleName>";

exampleFn("hello"); // => "Hello"

## Exported APIs

### functionName

UUID:       LIB-EXM-001:functionName
DependsOn:  none

### anotherFunction

UUID:       LIB-EXM-001:anotherFunction
DependsOn:  LIB-EXM-001:functionName   # functionName — used internally

## Notes

Optional. Known limitations, deprecation notices, etc.
```

### `DependsOn` Rules

| Situation | Value |
|---|---|
| No dependency | `none` |
| One dependency | `<Artifact:function>   # short description` |
| Multiple | One `DependsOn:` line per Artifact:function reference |
| External npm package | `none  # external: <package-name>` |

> `DependsOn` in the README references **Artifact:function identifiers**, not folder paths or bare function names.

---

## 7. Full Generation Example

**User input:**

```
Module Name: std_benv
ModuleID/Artifact: LIB-CFG-002
Author: IzanamiiDevv
Version: 1
Uses: lib
Depends on: (none)

Lib: Backend env access layer — get, list, expected (BENV_ prefix)
```

**You generate:**

---

### `module/StdBEnv/pavillion.module.json`

```json
{
  "module_name": "Std BEnv",
  "author": ["IzanamiiDevv"],
  "module_id": "LIB-CFG-002",
  "version": 1,
  "depends_on": [],
  "uses": ["lib"]
}
```

---

### `lib/StdBEnv/types.ts`

```ts
export type EnvPrimitive = string | number | boolean

export type EnvValueType = "string" | "number" | "boolean"

export interface ExpectedEnvEntry {
  parameter: string
  key: string
  placeholder: EnvPrimitive
  type: EnvValueType
  resolvedFrom: "env" | "placeholder"
}
```

---

### `lib/StdBEnv/index.ts`

```ts
/**
 * @uuid         LIB-CFG-002
 * @author       IzanamiiDevv
 * @date         2026/07/06
 * @dependsOn    none
 *
 * @description
 * Backend (Next.js server-side) environment access layer. Reads variables
 * written under the BENV_ prefix, coerces them to the requested primitive
 * type, falls back to a caller-supplied placeholder when missing, and
 * tracks every requested parameter so the full env contract can be
 * introspected later.
 *
 * @whereToUse
 * Import in Next.js server code only — API routes, route handlers, server
 * actions, middleware, and other code that never ships to the client
 * bundle.
 *
 * @whenToUse
 * Use whenever server code needs to read a configuration value or secret
 * from the environment (DB connection strings, API keys, port numbers,
 * internal service URLs, etc). Never import this module from client
 * components — BENV_ values are expected to include secrets.
 */

import type { EnvPrimitive, EnvValueType, ExpectedEnvEntry } from "./types"

const PREFIX = "BENV_"

const expectedRegistry = new Map<string, ExpectedEnvEntry>()

function inferType(placeholder: EnvPrimitive): EnvValueType {
  return typeof placeholder as EnvValueType
}

function coerce<T extends EnvPrimitive>(raw: string, placeholder: T): T {
  if (typeof placeholder === "number") return Number(raw) as T
  if (typeof placeholder === "boolean") return (raw.toLowerCase() === "true") as unknown as T
  return raw as unknown as T
}

/**
 * @uuid         LIB-CFG-002:get
 * @author       IzanamiiDevv
 * @date         2026/07/06
 * @dependsOn    none
 *
 * @description
 * Reads a single backend environment parameter. Looks up BENV_<parameter>
 * in process.env, coerces it to match the placeholder's type, and falls
 * back to the placeholder if the key is absent or empty. Every call
 * registers the parameter in the expected-env registry, regardless of
 * whether it was found.
 */

/**
 * @uniqueid LIB-CFG-002:get
 *
 * Gets a typed backend env value, registering it as expected.
 *
 * @param parameter   - The env parameter name, without the BENV_ prefix.
 * @param placeholder - The fallback value; its type determines coercion.
 * @returns The resolved value, either from process.env or the placeholder.
 */
export function get<T extends EnvPrimitive>(parameter: string, placeholder: T): T {
  const key = `${PREFIX}${parameter}`
  const raw = process.env[key]
  const found = raw !== undefined && raw !== ""
  const value = found ? coerce(raw as string, placeholder) : placeholder

  expectedRegistry.set(parameter, {
    parameter,
    key,
    placeholder,
    type: inferType(placeholder),
    resolvedFrom: found ? "env" : "placeholder",
  })

  return value
}

/**
 * @uuid         LIB-CFG-002:list
 * @author       IzanamiiDevv
 * @date         2026/07/06
 * @dependsOn    none
 *
 * @description
 * Scans process.env and returns every key currently defined under the
 * BENV_ prefix. Reflects what is actually present in the .env file at
 * runtime, not what the code expects.
 */

/**
 * @uniqueid LIB-CFG-002:list
 *
 * Lists all BENV_-prefixed keys currently defined in process.env.
 *
 * @returns Array of full keys, e.g. ["BENV_DATABASE_URL", "BENV_PORT"]
 */
export function list(): string[] {
  return Object.keys(process.env).filter((k) => k.startsWith(PREFIX))
}

/**
 * @uuid         LIB-CFG-002:expected
 * @author       IzanamiiDevv
 * @date         2026/07/06
 * @dependsOn    LIB-CFG-002:get
 *
 * @description
 * Returns every parameter that has been requested via env.get() so far
 * during this process's lifetime, along with its placeholder, inferred
 * type, and whether it resolved from the environment or the fallback.
 * Diffing this against env.list() surfaces parameters the code expects
 * but that are missing from .env.
 */

/**
 * @uniqueid LIB-CFG-002:expected
 *
 * Lists all parameters requested via env.get(), i.e. the expected env
 * contract of the running server.
 *
 * @returns Array of ExpectedEnvEntry describing each requested parameter.
 */
export function expected(): ExpectedEnvEntry[] {
  return Array.from(expectedRegistry.values())
}

export const env = { get, list, expected }
```

---

### `lib/StdBEnv/README.md`

```markdown
# Std BEnv

## Information

Author:     IzanamiiDevv
Time:       2026/07/06
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

import { env } from "@/lib/StdBEnv";

app.listen(env.get<number>("PORT", 2222));
const dbUrl = env.get<string>("DATABASE_URL", "postgres://localhost:5432/dev");
const strictMode = env.get<boolean>("STRICT_MODE", true);

// What's actually defined in .env right now:
env.list();      // => ["BENV_PORT", "BENV_DATABASE_URL"]

// What the app expects, whether present or not:
env.expected();  // => [{ parameter: "PORT", key: "BENV_PORT", ... }, ...]

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
```

---

## 8. Quick Checklist Before Submitting

- [ ] Asked the user for Module Name, ModuleID/Artifact, Author, Version, and Uses before generating (if not already given)
- [ ] Module Name uses `_` instead of spaces and is lowercase (e.g. `std_benv`)
- [ ] `pavillion.module.json` is inside `frontend/src/module/<ModuleName>/` only
- [ ] Source scopes live under `frontend/src/lib/`, `frontend/src/utils/`, `frontend/src/components/` — **not** `frontend/src/app/...`
- [ ] `uses` array lists every scope that has source files
- [ ] `depends_on` uses `module_name` values, not IDs or paths
- [ ] Every module has exactly **one** Artifact (`module_id` / `@uuid`) — never a new incrementing ID per function
- [ ] Every function is identified as `<Artifact>:<functionName>` wherever a per-function reference is needed
- [ ] Every `index.ts`/`index.tsx`/`style.css` has a **Global Module Header** with `@uuid` (Artifact) and `@date` (`YYYY/MM/DD`) — no `@time`
- [ ] Every exported function has a **Function Header** (`@uuid` as `Artifact:functionName`) + **JSDoc block** (`@uniqueid` as `Artifact:functionName`)
- [ ] `types.ts` has all interfaces — none exported from `index.ts`
- [ ] README has all 6 required sections
- [ ] Every export in README has a `UUID:` (`Artifact:functionName`) and `DependsOn:` line
- [ ] `DependsOn` uses `Artifact:functionName` references, not names or paths
- [ ] `module_id` format is `CATEGORY-SCOPE-NUMBER` (zero-padded)
- [ ] `style.css` exists only for `components` scopes

---

*Pavillion AI Reference · Internal Use Only*