/**
 * FIC: Secure environment bootstrap for REST API initialization.
 * Loads and configures all environment settings after validation.
 * 
 * FIC: Bootstrap de entorno seguro para inicialización REST API.
 * Carga y configura todos los ajustes de entorno después de la validación.
 * 
 * Constraint: This module MUST be imported after envValidator.ts
 * to ensure all required environment variables have been validated.
 * This module should be imported once at application startup,
 * typically from main.ts or index.ts.
 * 
 * Restricción: Este módulo DEBE importarse después de envValidator.ts
 * para asegurar que todas las variables de entorno requeridas hayan sido validadas.
 * Este módulo debe importarse una sola vez al inicio de la aplicación,
 * típicamente desde main.ts o index.ts.
 */

/**
 * FIC: Canonical environment configuration object.
 * All environment settings are accessed through this singleton.
 * 
 * FIC: Objeto de configuración de entorno canónico.
 * Todos los ajustes de entorno se acceden a través de este singleton.
 */
export interface EnvironmentConfig {
  // FIC: Node environment
  // FIC: Entorno de Node
  nodeEnv: "development" | "production" | "staging" | "test";
  isDevelopment: boolean;
  isProduction: boolean;

  // FIC: Server configuration
  // FIC: Configuración del servidor
  port: number;
  host: string;

  // FIC: Supabase configuration
  // FIC: Configuración de Supabase
  supabase: {
    url: string;
    serviceKey: string;
  };

  // FIC: JWT configuration
  // FIC: Configuración de JWT
  jwt: {
    secret: string;
    expiresIn: string;
  };

  // FIC: MongoDB configuration (optional)
  // FIC: Configuración de MongoDB (opcional)
  mongodb?: {
    uri: string;
    enabled: boolean;
  };

  // FIC: Logging configuration
  // FIC: Configuración de logging
  logging: {
    level: "debug" | "info" | "warn" | "error";
  };

  // FIC: Observability/tracing configuration
  // FIC: Configuración de observabilidad/tracing
  tracing: {
    enabled: boolean;
  };

  // FIC: Broker integration configuration (optional)
  // FIC: Configuración de integración de broker (opcional)
  brokers: {
    ibkr?: {
      accountId: string;
      enabled: boolean;
    };
    alpaca?: {
      apiKey: string;
      enabled: boolean;
    };
  };
}

/**
 * FIC: Global configuration singleton instance.
 * FIC: Instancia singleton de configuración global.
 */
let configInstance: EnvironmentConfig | null = null;

/**
 * FIC: Initialize the environment configuration from process.env.
 * Should be called once at application startup.
 * 
 * FIC: Inicializar la configuración de entorno desde process.env.
 * Debe ser llamado una sola vez al inicio de la aplicación.
 * 
 * Throws an error if required environment variables are missing.
 * This should be called immediately after envValidator.validateAndExitOnError().
 */
export function initializeEnvironment(): EnvironmentConfig {
  if (configInstance) {
    console.warn("Environment already initialized. Entorno ya inicializado. Returning cached instance.");
    return configInstance;
  }

  const nodeEnv = (process.env.NODE_ENV || "development") as
    | "development"
    | "production"
    | "staging"
    | "test";

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  // FIC: Build configuration object
  const config: EnvironmentConfig = {
    // Node environment
    nodeEnv,
    isDevelopment: nodeEnv === "development",
    isProduction: nodeEnv === "production",

    // Server
    port: parseInt(process.env.PORT || "3000", 10),
    host: process.env.HOST || "0.0.0.0",

    // Supabase
    supabase: {
      url: supabaseUrl!,
      serviceKey: supabaseServiceKey!,
    },

    // JWT
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    },

    // MongoDB (optional)
    ...(process.env.MONGODB_URI && {
      mongodb: {
        uri: process.env.MONGODB_URI,
        enabled: true,
      },
    }),

    // Logging
    logging: {
      level: (process.env.LOG_LEVEL || "info") as "debug" | "info" | "warn" | "error",
    },

    // Tracing
    tracing: {
      enabled: process.env.TRACE_ENABLED === "true",
    },

    // Brokers
    brokers: {
      ...(process.env.IBKR_ACCOUNT_ID && {
        ibkr: {
          accountId: process.env.IBKR_ACCOUNT_ID,
          enabled: true,
        },
      }),
      ...(process.env.ALPACA_API_KEY && {
        alpaca: {
          apiKey: process.env.ALPACA_API_KEY,
          enabled: true,
        },
      }),
    },
  };

  // FIC: Cache and return
  configInstance = config;

  // FIC: Log initialization
  if (config.isDevelopment) {
    console.debug(
      "[Environment] Configuration initialized for",
      config.nodeEnv,
      "mode on port",
      config.port
    );
  }

  return config;
}

/**
 * FIC: Get the current environment configuration.
 * Must be called after initializeEnvironment().
 * 
 * FIC: Obtener la configuración de entorno actual.
 * Debe ser llamado después de initializeEnvironment().
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  if (!configInstance) {
    throw new Error(
      "Environment not initialized. Call initializeEnvironment() first. " +
      "Entorno no inicializado. Llame a initializeEnvironment() primero."
    );
  }
  return configInstance;
}

/**
 * FIC: Reset configuration (useful for testing).
 * FIC: Restablecer configuración (útil para testing).
 */
export function resetEnvironment(): void {
  configInstance = null;
}

/**
 * FIC: Pretty-print current configuration (sanitized for logging).
 * FIC: Impresión formateada de configuración actual (saneada para logging).
 */
export function printEnvironmentConfig(): string {
  const config = getEnvironmentConfig();
  return `
Environment Configuration / Configuración del Entorno:
  Node Environment: ${config.nodeEnv}
  Port: ${config.port}
  Supabase URL: ${config.supabase.url}
  JWT Secret: ${config.jwt.secret.substring(0, 10)}...
  Logging Level: ${config.logging.level}
  Tracing Enabled: ${config.tracing.enabled}
  MongoDB Enabled: ${config.mongodb?.enabled || false}
  IBKR Enabled: ${config.brokers.ibkr?.enabled || false}
  Alpaca Enabled: ${config.brokers.alpaca?.enabled || false}
`;
}

export default getEnvironmentConfig;
