import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { loadConfig, loadDriverConfig, redactDsn, saveStoredConfig } from "../src/config.js";

test("loadDriverConfig does not require a DSN", () => {
  assert.deepEqual(loadDriverConfig({}), {
    driver: "node-packages",
    timeoutMs: 10000,
  });
});

test("loadConfig requires OPSCALE_DSN or a saved config for query commands", () => {
  const root = mkdtempSync(join(tmpdir(), "opscale-config-"));
  try {
    assert.throws(() => loadConfig({ OPSCALE_CONFIG: join(root, "missing.json") }), /opscale config init/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
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

test("loadConfig reads saved local config", () => {
  const root = mkdtempSync(join(tmpdir(), "opscale-config-"));
  const env = { OPSCALE_CONFIG: join(root, "config.json") };
  try {
    saveStoredConfig({
      dsn: "postgres://readonly:secret@localhost:5432/app",
      schemas: ["public", "analytics"],
      maxRows: 25,
      timeoutMs: 5000,
    }, env);

    assert.deepEqual(loadConfig(env), {
      dsn: "postgres://readonly:secret@localhost:5432/app",
      driver: "node-packages",
      maxRows: 25,
      timeoutMs: 5000,
      schemas: ["public", "analytics"],
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("environment variables override saved local config", () => {
  const root = mkdtempSync(join(tmpdir(), "opscale-config-"));
  const env = { OPSCALE_CONFIG: join(root, "config.json") };
  try {
    saveStoredConfig({
      dsn: "postgres://readonly:secret@localhost:5432/app",
      schemas: ["public"],
      maxRows: 25,
      timeoutMs: 5000,
    }, env);

    assert.deepEqual(
      loadConfig({
        ...env,
        OPSCALE_DSN: "sqlite:///tmp/app.db",
        OPSCALE_SCHEMAS: "main",
        OPSCALE_MAX_ROWS: "10",
        OPSCALE_TIMEOUT_MS: "1000",
      }),
      {
        dsn: "sqlite:///tmp/app.db",
        driver: "node-packages",
        maxRows: 10,
        timeoutMs: 1000,
        schemas: ["main"],
      },
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("redactDsn hides passwords", () => {
  assert.equal(redactDsn("postgres://readonly:secret@localhost:5432/app"), "postgres://readonly:***@localhost:5432/app");
});
