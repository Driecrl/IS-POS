export type EnvPrimitive = string | number | boolean

export type EnvValueType = "string" | "number" | "boolean"

export interface ExpectedEnvEntry<T extends EnvPrimitive = EnvPrimitive> {
  /** The parameter name as passed to env.get(), without the FENV_ prefix */
  parameter: string
  /** The fully-prefixed key as looked up in process.env, e.g. FENV_PORT */
  key: string
  /** The placeholder/default value provided at the call site */
  placeholder: T
  /** Inferred primitive type, derived from the placeholder's typeof */
  type: EnvValueType
  /** Whether the value ended up coming from process.env or from the placeholder */
  resolvedFrom: "env" | "placeholder"
}
