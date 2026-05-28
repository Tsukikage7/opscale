import assert from "node:assert/strict";
import test from "node:test";

import { loadConfig, loadDriverConfig } from "../src/config.js";

test("loadDriverConfig does not require a DSN", () => {
  assert.deepEqual(loadDriverConfig({}), {
    driver: "node-packages",
    timeoutMs: 10000,
  });
});

test("loadConfig requires OPSCALE_DSN for query commands", () => {
  assert.throws(() => loadConfig({}), /OPSCALE_DSN is required/);
});

test("loadConfig reads generic Opscale variables", () => {
  assert.deepEqual(
    loadConfig({
      OPSCALE_DSN: "sqlite:///tmp/app.db",
      OPSCALE_SCHEMAS: "main,analytics",
      OPSCALE_MAX_ROWS: "50",
      OPSCALE_TIMEOUT_MS: "3000",
    }),
    {
      dsn: "sqlite:///tmp/app.db",
      driver: "node-packages",
      maxRows: 50,
      timeoutMs: 3000,
      schemas: ["main", "analytics"],
    },
  );
});
