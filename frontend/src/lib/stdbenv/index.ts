/**
 * @uuid         LIB-CFG-002
 * @author       IzanamiiDevv
 * @time         2026-07-06
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
 * @time         2026-07-06
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
 * @time         2026-07-06
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
 * @time         2026-07-06
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
