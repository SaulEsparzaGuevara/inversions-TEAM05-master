import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { runtimeModeRouter } from "../../../src/routes/runtime/runtimeMode";

describe("runtime mode routes", () => {
  afterEach(() => {
    process.env.AUTH_BYPASS = "false";
  });

  it("switches ONLINE/OFFLINE and DEMO/REAL states", async () => {
    process.env.AUTH_BYPASS = "true";

    const app = express();
    app.use(express.json());
    app.use("/api/runtime", runtimeModeRouter);

    const initial = await request(app).get("/api/runtime/mode");
    expect(initial.status).toBe(200);
    expect(initial.body.mode).toBe("online");
    expect(initial.body.operationalMode).toBe("demo");

    const updated = await request(app)
      .post("/api/runtime/mode")
      .send({ mode: "offline", operationalMode: "real" });

    expect(updated.status).toBe(200);
    expect(updated.body.mode).toBe("offline");
    expect(updated.body.operationalMode).toBe("real");

    const fetched = await request(app).get("/api/runtime/mode");
    expect(fetched.status).toBe(200);
    expect(fetched.body.mode).toBe("offline");
    expect(fetched.body.operationalMode).toBe("real");
  });
});
