// FIC: Runtime mode routes to switch ONLINE/OFFLINE and DEMO/REAL modes.
// FIC: Rutas de modo runtime para conmutar ONLINE/OFFLINE y DEMO/REAL.

import { Router } from "express";
import { authContextMiddleware } from "../../middleware/authContext.js";
import { getRuntimeMode, setRuntimeMode } from "../../modules/runtime/runtimeModeStore.js";

export const runtimeModeRouter = Router();

runtimeModeRouter.use(authContextMiddleware);

runtimeModeRouter.get("/mode", (req, res) => {
  const userId = req.authContext?.userId;
  if (!userId) {
    return res.status(401).json({ code: "AUTH_CONTEXT_MISSING" });
  }

  return res.status(200).json(getRuntimeMode(userId));
});

runtimeModeRouter.post("/mode", (req, res) => {
  const userId = req.authContext?.userId;
  if (!userId) {
    return res.status(401).json({ code: "AUTH_CONTEXT_MISSING" });
  }

  const mode = req.body?.mode === "offline" ? "offline" : "online";
  const operationalMode = req.body?.operationalMode === "real" ? "real" : "demo";
  const current = setRuntimeMode(userId, mode, operationalMode);
  return res.status(200).json(current);
});
