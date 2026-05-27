// FIC: In-memory runtime mode store for ONLINE/OFFLINE and DEMO/REAL per user.
// FIC: Almacen en memoria de modo runtime para ONLINE/OFFLINE y DEMO/REAL por usuario.

export type RuntimeMode = "online" | "offline";
export type OperationalMode = "demo" | "real";

export interface RuntimeModeState {
  mode: RuntimeMode;
  operationalMode: OperationalMode;
  updatedAt: string;
}

const userRuntimeMode = new Map<string, RuntimeModeState>();

export function getRuntimeMode(userId: string): RuntimeModeState {
  const existing = userRuntimeMode.get(userId);
  if (existing) {
    return existing;
  }

  const initial: RuntimeModeState = {
    mode: "online",
    operationalMode: "demo",
    updatedAt: new Date().toISOString()
  };
  userRuntimeMode.set(userId, initial);
  return initial;
}

export function setRuntimeMode(
  userId: string,
  mode: RuntimeMode,
  operationalMode: OperationalMode
): RuntimeModeState {
  const next: RuntimeModeState = {
    mode,
    operationalMode,
    updatedAt: new Date().toISOString()
  };

  userRuntimeMode.set(userId, next);
  return next;
}
