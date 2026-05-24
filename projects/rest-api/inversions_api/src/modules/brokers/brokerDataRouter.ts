// FIC: Broker data router for domain-based data source selection
// FIC: Router de datos de broker para selección de fuente por dominio

import { createClient } from "@supabase/supabase-js";

interface Logger {
  info: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  error: (message: string, error?: unknown) => void;
}

const defaultLogger: Logger = {
  info: (message, meta) => console.info(message, meta),
  warn: (message, meta) => console.warn(message, meta),
  error: (message, error) => console.error(message, error)
};

interface DataSourceConfig {
  instruments?: string; // broker key
  ohlc?: string;
  indicators?: string;
  streaming?: string;
  fallback?: string;
}

interface RoutingContext {
  mode: "online" | "offline";
  operationalMode: "demo" | "real";
  activeAccount?: string;
}

// FIC: Router determines which broker provides data for each domain (EN)
// FIC: Router determina qué broker proporciona datos para cada dominio (ES)
export class BrokerDataRouter {
  private logger: Logger;
  private supabaseClient: ReturnType<typeof createClient>;
  private brokerCapabilities: Map<string, any> = new Map();

  constructor(supabaseClient: ReturnType<typeof createClient>, logger: Logger = defaultLogger) {
    this.supabaseClient = supabaseClient;
    this.logger = logger;
  }

  // FIC: Load broker capabilities from catalog (EN)
  // FIC: Cargar capacidades de broker desde catálogo (ES)
  async loadBrokerCapabilities(): Promise<void> {
    try {
      const { data, error } = await this.supabaseClient
        .from("broker_configurations")
        .select("id, broker_type, capabilities")
        .eq("is_active", true);

      if (error) {
        this.logger.error("Failed to load broker capabilities", error);
        return;
      }

      (data as Array<{ broker_type: string; capabilities: unknown }> | null)?.forEach((broker) => {
        this.brokerCapabilities.set(broker.broker_type, broker.capabilities);
      });

      this.logger.info("Broker capabilities loaded", {
        brokerCount: data?.length || 0,
      });
    } catch (err) {
      this.logger.error("Exception loading broker capabilities", err as Error);
    }
  }

  // FIC: Route instrument catalog request to appropriate broker (EN)
  // FIC: Enrutar solicitud de catálogo de instrumentos al broker apropiado (ES)
  async routeInstruments(
    context: RoutingContext,
    category: string
  ): Promise<string> {
    if (context.mode === "offline") {
      return "local";
    }

    // FIC: Check broker priority and capabilities for instruments (EN)
    // FIC: Verificar prioridad y capacidades de broker para instrumentos (ES)
    const { data: accounts, error } = await this.supabaseClient
      .from("broker_accounts")
      .select("broker_id, broker_configurations(broker_type, priority, capabilities)")
      .eq("mode", context.operationalMode)
      .eq("is_active", true)
      .order("priority", { ascending: true })
      .limit(1);

    if (error || !accounts?.length) {
      this.logger.warn("No active broker accounts for instruments", { error });
      return "local";
    }

    const brokerType = (accounts[0] as any).broker_configurations.broker_type;
    const capabilities = (accounts[0] as any).broker_configurations.capabilities;

    if (capabilities?.symbols) {
      return brokerType;
    }

    return "local";
  }

  // FIC: Route OHLC data request to broker with best historical support (EN)
  // FIC: Enrutar solicitud OHLC al broker con mejor soporte histórico (ES)
  async routeOHLC(
    context: RoutingContext,
    granularities: string[]
  ): Promise<string> {
    if (context.mode === "offline") {
      return "local";
    }

    // FIC: Select broker that supports all requested granularities (EN)
    // FIC: Seleccionar broker que soporta todas las granularidades solicitadas (ES)
    const { data: accounts } = await this.supabaseClient
      .from("broker_accounts")
      .select("broker_id, broker_configurations(broker_type, priority, capabilities)")
      .eq("mode", context.operationalMode)
      .eq("is_active", true)
      .order("priority", { ascending: true });

    if (!accounts?.length) {
      return "local";
    }

    for (const account of accounts) {
      const brokerType = (account as any).broker_configurations.broker_type;
      const capabilities = (account as any).broker_configurations.capabilities;

      if (
        capabilities?.ohlc &&
        capabilities?.historical &&
        granularities.every((g) =>
          capabilities.granularities?.includes(g)
        )
      ) {
        return brokerType;
      }
    }

    // FIC: Fallback to local if no perfect match (EN)
    // FIC: Retroceso a local si no hay coincidencia perfecta (ES)
    return "local";
  }

  // FIC: Route technical indicators request (EN)
  // FIC: Enrutar solicitud de indicadores técnicos (ES)
  async routeIndicators(context: RoutingContext): Promise<string> {
    if (context.mode === "offline") {
      return "local";
    }

    const { data: accounts } = await this.supabaseClient
      .from("broker_accounts")
      .select("broker_id, broker_configurations(broker_type, priority, capabilities)")
      .eq("mode", context.operationalMode)
      .eq("is_active", true)
      .order("priority", { ascending: true })
      .limit(1);

    if (!accounts?.length) {
      return "local";
    }

    const brokerType = (accounts[0] as any).broker_configurations.broker_type;
    const capabilities = (accounts[0] as any).broker_configurations.capabilities;

    // FIC: Prefer local computation over expensive broker APIs (EN)
    // FIC: Preferir cálculo local sobre APIs costosas de broker (ES)
    if (capabilities?.indicators) {
      return brokerType;
    }

    return "local";
  }

  // FIC: Route real-time streaming data (EN)
  // FIC: Enrutar datos de streaming en tiempo real (ES)
  async routeStreaming(context: RoutingContext): Promise<string> {
    if (context.mode === "offline") {
      return "local";
    }

    const { data: accounts } = await this.supabaseClient
      .from("broker_accounts")
      .select("broker_id, broker_configurations(broker_type, priority, capabilities)")
      .eq("mode", context.operationalMode)
      .eq("is_active", true)
      .order("priority", { ascending: true })
      .limit(1);

    if (!accounts?.length) {
      return "local";
    }

    const brokerType = (accounts[0] as any).broker_configurations.broker_type;
    const capabilities = (accounts[0] as any).broker_configurations.capabilities;

    if (capabilities?.real_time) {
      return brokerType;
    }

    return "local";
  }

  // FIC: Get complete routing configuration for dashboard (EN)
  // FIC: Obtener configuración de routing completa para dashboard (ES)
  async getRoutingConfig(context: RoutingContext): Promise<DataSourceConfig> {
    const [instruments, ohlc, indicators, streaming] = await Promise.all([
      this.routeInstruments(context, "all"),
      this.routeOHLC(context, ["1d"]),
      this.routeIndicators(context),
      this.routeStreaming(context),
    ]);

    return {
      instruments,
      ohlc,
      indicators,
      streaming,
      fallback: "local",
    };
  }
}
