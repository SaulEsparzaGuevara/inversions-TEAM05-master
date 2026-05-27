export interface DependencySlo {
  name: "IBKR" | "ALPACA" | "MARKET_DATA" | "CLAUDE";
  availabilityTarget: number;
  timeoutMs: number;
  retries: number;
  degradedMode: string;
}

export const dependencySloPolicies: DependencySlo[] = [
  {
    name: "IBKR",
    availabilityTarget: 99.5,
    timeoutMs: 5000,
    retries: 2,
    degradedMode: "bloquear nuevas ejecuciones y conservar analisis"
  },
  {
    name: "ALPACA",
    availabilityTarget: 99.5,
    timeoutMs: 5000,
    retries: 2,
    degradedMode: "bloquear nuevas ejecuciones y conservar analisis"
  },
  {
    name: "MARKET_DATA",
    availabilityTarget: 99,
    timeoutMs: 2000,
    retries: 1,
    degradedMode: "marcar DATA_STALE y pausar nuevas senales"
  },
  {
    name: "CLAUDE",
    availabilityTarget: 99,
    timeoutMs: 8000,
    retries: 1,
    degradedMode: "fallback deterministico de explicabilidad"
  }
];
