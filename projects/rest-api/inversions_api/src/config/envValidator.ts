/**
 * FIC: Environment variable validator for REST API configuration.
 * Ensures all required environment variables are present and valid before startup.
 * 
 * FIC: Validador de variables de entorno para configuración REST API.
 * Asegura que todas las variables de entorno requeridas estén presentes y sean válidas antes del inicio.
 * 
 * Constraint: This module MUST be imported and executed before any other modules
 * that depend on environment configuration. Execution should happen at the very
 * beginning of the application bootstrap sequence.
 * 
 * Restricción: Este módulo DEBE ser importado y ejecutado antes que cualquier otro módulo
 * que dependa de configuración de entorno. La ejecución debe ocurrir en el inicio
 * de la secuencia de bootstrap de la aplicación.
 */

/**
 * FIC: Environment variable requirements and validation rules.
 * FIC: Requisitos de variables de entorno y reglas de validación.
 */
interface EnvironmentRequirement {
  /**
   * FIC: Variable name (e.g., "SUPABASE_URL")
   * FIC: Nombre de variable (p.ej., "SUPABASE_URL")
   */
  name: string;

  /**
   * FIC: Whether this variable is required (true) or optional (false)
   * FIC: Si esta variable es requerida (true) u opcional (false)
   */
  required: boolean;

  /**
   * FIC: Validation regex or function for the value
   * FIC: Regex de validación o función para el valor
   */
  validator?: RegExp | ((value: string) => boolean);

  /**
   * FIC: Human-readable description of expected format
   * FIC: Descripción legible del formato esperado
   */
  description: string;

  /**
   * FIC: Example value for documentation
   * FIC: Valor de ejemplo para documentación
   */
  example: string;
}

/**
 * FIC: Canonical list of required and optional environment variables.
 * FIC: Lista canónica de variables de entorno requeridas y opcionales.
 */
const ENVIRONMENT_REQUIREMENTS: EnvironmentRequirement[] = [
  // FIC: Supabase configuration (Required)
  {
    name: "SUPABASE_URL",
    required: true,
    validator: /^https:\/\/.+\.supabase\.co$/,
    description: "Supabase project URL (must be HTTPS)",
    example: "https://project-id.supabase.co",
  },
  {
    name: "SUPABASE_SERVICE_KEY",
    required: true,
    validator: (value) => value.length > 32,
    description: "Supabase service role API key (long string)",
    example: "eyJhbGc...[long base64 encoded JWT]",
  },

  // FIC: JWT configuration (Required)
  {
    name: "JWT_SECRET",
    required: true,
    validator: (value) => value.length > 32,
    description: "Secret key for JWT signing and verification",
    example: "your-super-secret-key-at-least-32-characters",
  },

  // FIC: Node environment (Optional, defaults to "development")
  {
    name: "NODE_ENV",
    required: false,
    validator: /^(development|production|staging|test)$/,
    description: "Node environment (development, production, staging, test)",
    example: "production",
  },

  // FIC: Server port (Optional, defaults to 3000)
  {
    name: "PORT",
    required: false,
    validator: (value) => {
      const port = parseInt(value, 10);
      return port > 0 && port < 65536;
    },
    description: "Server port (1-65535)",
    example: "3000",
  },

  // FIC: MongoDB configuration (Optional, used for analytics/historical data)
  {
    name: "MONGODB_URI",
    required: false,
    validator: /^mongodb\+srv?:\/\/.+/,
    description: "MongoDB connection string (optional, for historical analytics)",
    example: "mongodb+srv://user:password@cluster.mongodb.net/dbname",
  },

  // FIC: Logging level (Optional, defaults to "info")
  {
    name: "LOG_LEVEL",
    required: false,
    validator: /^(debug|info|warn|error)$/,
    description: "Logging level (debug, info, warn, error)",
    example: "info",
  },

  // FIC: Observability/tracing (Optional)
  {
    name: "TRACE_ENABLED",
    required: false,
    validator: /^(true|false)$/,
    description: "Enable distributed tracing (true/false)",
    example: "true",
  },

  // FIC: Broker integration (Optional, but required for execution features)
  {
    name: "IBKR_ACCOUNT_ID",
    required: false,
    validator: (value) => value.length > 0,
    description: "Interactive Brokers account ID (required for IBKR execution)",
    example: "U12345678",
  },
  {
    name: "ALPACA_API_KEY",
    required: false,
    validator: (value) => value.length > 0,
    description: "Alpaca API key (required for Alpaca execution)",
    example: "PK_...",
  },
];

const ENVIRONMENT_ALIASES: Record<string, string[]> = {
  SUPABASE_URL: ["VITE_SUPABASE_URL"],
  SUPABASE_SERVICE_KEY: ["SUPABASE_SERVICE_ROLE_KEY"],
};

function resolveEnvironmentValue(variableName: string): string | undefined {
  if (process.env[variableName]) {
    return process.env[variableName];
  }

  const aliases = ENVIRONMENT_ALIASES[variableName] || [];
  for (const alias of aliases) {
    if (process.env[alias]) {
      return process.env[alias];
    }
  }

  return undefined;
}

/**
 * FIC: Validation result with details about which variables passed/failed.
 * FIC: Resultado de validación con detalles sobre qué variables pasaron/fallaron.
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    variable: string;
    reason: string;
  }>;
  warnings: Array<{
    variable: string;
    reason: string;
  }>;
}

/**
 * FIC: Validates all environment variables against requirements.
 * Throws an error if required variables are missing or invalid.
 * 
 * FIC: Valida todas las variables de entorno contra requisitos.
 * Lanza un error si faltan variables requeridas o son inválidas.
 * 
 * Returns a result object with detailed validation information.
 * Puede ser utilizado para pre-startup diagnostics.
 */
export function validateEnvironment(): ValidationResult {
  const errors: Array<{ variable: string; reason: string }> = [];
  const warnings: Array<{ variable: string; reason: string }> = [];

  // FIC: Check each requirement
  for (const requirement of ENVIRONMENT_REQUIREMENTS) {
    const value = resolveEnvironmentValue(requirement.name);

    // FIC: Check if required variable is missing
    if (requirement.required && !value) {
      const aliasHint = (ENVIRONMENT_ALIASES[requirement.name] || []).length
        ? ` Also accepted aliases: ${(ENVIRONMENT_ALIASES[requirement.name] || []).join(", ")}. Alias aceptados: ${(ENVIRONMENT_ALIASES[requirement.name] || []).join(", ")}.`
        : "";
      errors.push({
        variable: requirement.name,
        reason: `Required environment variable is missing. Variable de entorno requerida falta. (${requirement.description})${aliasHint}`,
      });
      continue;
    }

    // FIC: Skip validation if optional and missing
    if (!requirement.required && !value) {
      continue;
    }

    // FIC: Validate the value if a validator is provided
    if (value && requirement.validator) {
      const isValid =
        requirement.validator instanceof RegExp
          ? requirement.validator.test(value)
          : requirement.validator(value);

      if (!isValid) {
        const msg = requirement.required ? "is invalid" : "appears invalid";
        errors.push({
          variable: requirement.name,
          reason: `Value ${msg} and does not match expected format. Valor ${msg === "is invalid" ? "es inválido" : "parece inválido"} y no coincide con el formato esperado. Expected: ${requirement.description}`,
        });
      }
    }
  }

  // FIC: Check for optional broker configuration
  const brokerVars = ["IBKR_ACCOUNT_ID", "ALPACA_API_KEY"];
  const anyBrokerConfigured = brokerVars.some((v) => process.env[v]);

  if (!anyBrokerConfigured) {
    warnings.push({
      variable: "BROKER_CONFIG",
      reason: "No broker configuration detected. Broker execution will be unavailable. No se detectó configuración de broker. La ejecución del broker no estará disponible.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * FIC: Pretty-print validation result for logging.
 * FIC: Impresión formateada de resultado de validación para logging.
 */
export function printValidationResult(result: ValidationResult): string {
  let output = "\n";

  if (result.isValid && result.warnings.length === 0) {
    output += "✓ Environment validation PASSED. Validación de entorno APROBADA.\n";
  } else if (!result.isValid) {
    output += "✗ Environment validation FAILED. Validación de entorno FALLÓ.\n\n";
    output += "Errors / Errores:\n";
    for (const err of result.errors) {
      output += `  - ${err.variable}: ${err.reason}\n`;
    }
  }

  if (result.warnings.length > 0) {
    output += "\nWarnings / Advertencias:\n";
    for (const warn of result.warnings) {
      output += `  - ${warn.variable}: ${warn.reason}\n`;
    }
  }

  return output;
}

/**
 * FIC: Main export: validate environment on import.
 * If validation fails, throw an error to prevent application startup.
 * 
 * FIC: Exportación principal: validar entorno al importar.
 * Si la validación falla, lanza un error para prevenir inicio de aplicación.
 * 
 * Usage:
 *   import './envValidator'; // Must be the first import in main.ts
 *   // OR
 *   const result = validateEnvironment();
 *   if (!result.isValid) throw new Error(...);
 */
export function validateAndExitOnError(): void {
  const result = validateEnvironment();

  console.log(printValidationResult(result));

  if (!result.isValid) {
    console.error("Failed to start server. Cannot proceed without required environment variables.");
    console.error("Falló al iniciar servidor. No se puede continuar sin variables de entorno requeridas.");
    process.exit(1);
  }
}

export default validateEnvironment;
