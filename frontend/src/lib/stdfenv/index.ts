/**
 * @uuid         LIB-CFG-001
 * @author       IzanamiiDevv
 * @time         2026-07-06
 * @dependsOn    none
 *
 * @description
 * Frontend environment access layer. Reads variables written under the
 * FENV_ prefix, coerces them to the requested primitive type, falls back
 * to a caller-supplied placeholder when missing, and tracks every
 * requested parameter so the full env contract can be introspected later.
 *
 * @whereToUse
 * Import in React frontend code (components, hooks, client-side config)
 * anywhere a runtime-configurable value is needed instead of a hardcoded
 * literal.
 *
 * @whenToUse
 * Use whenever frontend code needs to read a configuration value that may
 * come from the environment (feature flags, public API base URLs, client
 * timeouts, etc). Do not use for secrets that must never reach the client
 * bundle — this module is frontend-scoped and any FENV_ value should be
 * treated as public.
 */

import type { EnvPrimitive, EnvValueType, ExpectedEnvEntry } from "./types"

const PREFIX = "FENV_"

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
 * @uuid         LIB-CFG-001:get
 * @author       IzanamiiDevv
 * @time         2026-07-06
 * @dependsOn    none
 *
 * @description
 * Reads a single frontend environment parameter. Looks up FENV_<parameter>
 * in process.env, coerces it to match the placeholder's type, and falls
 * back to the placeholder if the key is absent or empty. Every call
 * registers the parameter in the expected-env registry, regardless of
 * whether it was found.
 */

/**
 * @uniqueid LIB-CFG-001:get
 *
 * Gets a typed frontend env value, registering it as expected.
 *
 * @param parameter   - The env parameter name, without the FENV_ prefix.
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
 * @uuid         LIB-CFG-001:list
 * @author       IzanamiiDevv
 * @time         2026-07-06
 * @dependsOn    none
 *
 * @description
 * Scans process.env and returns every key currently defined under the
 * FENV_ prefix. Reflects what is actually present in the .env file at
 * runtime, not what the code expects.
 */

/**
 * @uniqueid LIB-CFG-001:list
 *
 * Lists all FENV_-prefixed keys currently defined in process.env.
 *
 * @returns Array of full keys, e.g. ["FENV_API_BASE_URL", "FENV_TIMEOUT"]
 */
export function list(): string[] {
  return Object.keys(process.env).filter((k) => k.startsWith(PREFIX))
}

/**
 * @uuid         LIB-CFG-001:expected
 * @author       IzanamiiDevv
 * @time         2026-07-06
 * @dependsOn    LIB-CFG-001:get
 *
 * @description
 * Returns every parameter that has been requested via env.get() so far
 * during this process's lifetime, along with its placeholder, inferred
 * type, and whether it resolved from the environment or the fallback.
 * Diffing this against env.list() surfaces parameters the code expects
 * but that are missing from .env.
 */

/**
 * @uniqueid LIB-CFG-001:expected
 *
 * Lists all parameters requested via env.get(), i.e. the expected env
 * contract of the running app.
 *
 * @returns Array of ExpectedEnvEntry describing each requested parameter.
 */
export function expected(): ExpectedEnvEntry[] {
  return Array.from(expectedRegistry.values())
}

export const env = { get, list, expected }
