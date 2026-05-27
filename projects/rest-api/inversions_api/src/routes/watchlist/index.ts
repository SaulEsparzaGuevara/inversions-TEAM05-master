// FIC: Watchlist CRUD routes for user-specific market instruments.
// FIC: Rutas CRUD de watchlist para instrumentos de mercado por usuario.

import { Router } from "express";
import { authContextMiddleware } from "../../middleware/authContext.js";
import { WatchlistService } from "../../modules/watchlist/watchlistService.js";

const service = new WatchlistService();

export const watchlistRouter = Router();

watchlistRouter.use(authContextMiddleware);

watchlistRouter.get("/", async (req, res) => {
  const userId = req.authContext?.userId;
  if (!userId) {
    return res.status(401).json({ code: "AUTH_CONTEXT_MISSING" });
  }

  const items = await service.listByUser(userId);
  return res.status(200).json({ items });
});

watchlistRouter.post("/", async (req, res) => {
  const userId = req.authContext?.userId;
  if (!userId) {
    return res.status(401).json({ code: "AUTH_CONTEXT_MISSING" });
  }

  const symbol = String(req.body?.symbol ?? "").trim();
  const category = String(req.body?.category ?? "").trim();

  if (!symbol || !category) {
    return res.status(400).json({ code: "WATCHLIST_INVALID_INPUT" });
  }

  const item = await service.add({ user_id: userId, symbol, category });
  return res.status(201).json(item);
});

watchlistRouter.delete("/:itemId", async (req, res) => {
  const userId = req.authContext?.userId;
  if (!userId) {
    return res.status(401).json({ code: "AUTH_CONTEXT_MISSING" });
  }

  const removed = await service.remove(userId, req.params.itemId);
  if (!removed) {
    return res.status(404).json({ code: "WATCHLIST_ITEM_NOT_FOUND" });
  }

  return res.status(200).json({ success: true });
});
