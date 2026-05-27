import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../src/database/supabase/client", () => ({
  createAuthenticatedClient: vi.fn(() => ({
    from: () => ({
      select: () => ({
        order: async () => ({
          data: [
            {
              field_key: "symbol",
              label: "Symbol",
              data_type: "string",
              visible: true,
              order_index: 1,
              is_filterable: true,
              is_sortable: true,
              is_exportable: true
            },
            {
              field_key: "confidence",
              label: "Confidence",
              data_type: "number",
              visible: true,
              order_index: 2,
              is_filterable: true,
              is_sortable: true,
              is_exportable: true
            }
          ],
          error: null
        })
      })
    })
  }))
}));

import confluenceViewPresetsRouter from "../../../src/routes/dashboard/confluenceViewPresets";

describe("confluence dynamic columns", () => {
  it("returns metadata-driven columns without runtime errors", async () => {
    process.env.AUTH_BYPASS = "true";

    const app = express();
    app.use(express.json());
    app.use("/api/dashboard", confluenceViewPresetsRouter);

    const response = await request(app).get("/api/dashboard/confluence-columns");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.columns)).toBe(true);
    expect(response.body.columns[0].field_key).toBe("symbol");
  });
});
