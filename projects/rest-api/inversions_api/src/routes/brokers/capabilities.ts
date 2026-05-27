// FIC: Broker capabilities endpoint for dynamic timeframe selector.
// FIC: Endpoint de capacidades de broker para selector dinamico de temporalidad.

import { Router } from "express";
import { supabaseClient } from "../../database/supabase/client.js";

export const brokerCapabilitiesRouter = Router();

brokerCapabilitiesRouter.get("/capabilities", async (_req, res) => {
  const { data } = await supabaseClient
    .from("broker_configurations")
    .select("capabilities")
    .eq("is_active", true)
    .order("priority", { ascending: true });

  const granularities = new Set<string>();
  for (const row of data ?? []) {
    const values = (row as { capabilities?: { granularities?: string[] } }).capabilities?.granularities ?? [];
    for (const value of values) {
      granularities.add(value);
    }
  }

  if (granularities.size === 0) {
    ["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"].forEach((item) => granularities.add(item));
  }

  return res.status(200).json({
    granularities: Array.from(granularities)
  });
});
