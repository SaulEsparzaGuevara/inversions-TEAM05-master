// FIC: Lightweight global store for dashboard signal selection and runtime modes.
// FIC: Store global ligero para seleccion de senales y modos runtime del dashboard.

import { useSyncExternalStore } from "react";

export interface SelectedInstrument {
  symbol: string;
  name?: string;
  category?: string;
}

export interface SelectedSignal {
  id?: string;
  signalId?: string;
  symbol?: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

type RuntimeMode = "online" | "offline";
type OperationalMode = "demo" | "real";

interface SignalStoreState {
  selectedInstrument?: SelectedInstrument;
  selectedSignal?: SelectedSignal;
  runtimeMode: RuntimeMode;
  operationalMode: OperationalMode;
}

type Listener = () => void;

const listeners = new Set<Listener>();

const initialRuntimeMode =
  (typeof window !== "undefined" &&
    (window.localStorage.getItem("inversions.runtime.mode") as RuntimeMode | null)) ||
  "online";

const initialOperationalMode =
  (typeof window !== "undefined" &&
    (window.localStorage.getItem("inversions.runtime.operational") as OperationalMode | null)) ||
  "demo";

const state: SignalStoreState = {
  selectedInstrument: undefined,
  selectedSignal: undefined,
  runtimeMode: initialRuntimeMode,
  operationalMode: initialOperationalMode
};

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): SignalStoreState {
  return state;
}

export function useSignalStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    ...snapshot,
    setSelectedInstrument: (instrument: SelectedInstrument) => {
      state.selectedInstrument = instrument;
      emit();
    },
    setSelectedSignal: (signal: SelectedSignal) => {
      state.selectedSignal = signal;
      emit();
    },
    setRuntimeMode: (mode: RuntimeMode) => {
      state.runtimeMode = mode;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("inversions.runtime.mode", mode);
      }
      emit();
    },
    setOperationalMode: (mode: OperationalMode) => {
      state.operationalMode = mode;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("inversions.runtime.operational", mode);
      }
      emit();
    }
  };
}
