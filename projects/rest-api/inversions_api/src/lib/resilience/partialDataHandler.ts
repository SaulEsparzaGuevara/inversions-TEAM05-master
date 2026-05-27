/**
 * ============================================================================
 * partialDataHandler.ts
 * ============================================================================
 *
 * FIC: T208: Partial Data Handler — merges partial objects with full defaults, replacing null/undefined.
 */

export function mergePartialWithDefaults<T extends Record<string, any>>(partial: Partial<T>, defaults: T): T {
  const out: any = { ...defaults };
  for (const k of Object.keys(partial)) {
    const v = (partial as any)[k];
    if (v === undefined || v === null) continue;
    out[k] = v;
  }
  return out as T;
}

export default { mergePartialWithDefaults };
