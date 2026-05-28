import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export interface Config {
  dsn: string;
  driver: "node-packages";
  maxRows: number;
  timeoutMs: number;
  schemas: string[];
}

export interface StoredConfig {
  dsn?: string;
  schemas?: string[];
  maxRows?: number;
  timeoutMs?: number;
}

export interface DriverConfig {
  driver: "node-packages";
  timeoutMs: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const stored = loadStoredConfig(env);
  const dsn = env.OPSCALE_DSN?.trim() || stored.dsn?.trim();
  if (!dsn) {
    throw new Error("OPSCALE_DSN is required. Run `opscale config init` or set OPSCALE_DSN.");
  }
  const driver = loadDriverConfig(env);

  return {
    dsn,
    driver: driver.driver,
    maxRows: parsePositiveInt(env.OPSCALE_MAX_ROWS ?? numberToString(stored.maxRows), 100, "OPSCALE_MAX_ROWS"),
    timeoutMs: driver.timeoutMs,
    schemas: parseSchemas(env.OPSCALE_SCHEMAS ?? stored.schemas?.join(",")),
  };
}

export function loadDriverConfig(env: NodeJS.ProcessEnv = process.env): DriverConfig {
  const stored = loadStoredConfig(env);
  return {
    driver: "node-packages",
    timeoutMs: parsePositiveInt(env.OPSCALE_TIMEOUT_MS ?? numberToString(stored.timeoutMs), 10_000, "OPSCALE_TIMEOUT_MS"),
  };
}

export function getConfigPath(env: NodeJS.ProcessEnv = process.env): string {
  return env.OPSCALE_CONFIG?.trim() || join(homedir(), ".opscale", "config.json");
}

export function loadStoredConfig(env: NodeJS.ProcessEnv = process.env): StoredConfig {
  const path = getConfigPath(env);
  if (!existsSync(path)) {
    return {};
  }
  const parsed = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Invalid Opscale config file: ${path}`);
  }
  return parsed as StoredConfig;
}

export function saveStoredConfig(config: StoredConfig, env: NodeJS.ProcessEnv = process.env): string {
  const path = getConfigPath(env);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
  chmodSync(path, 0o600);
  return path;
}

export function redactDsn(dsn: string | undefined): string | undefined {
  if (!dsn) {
    return undefined;
  }
  return dsn.replace(/(:\/\/[^:/?#]+:)[^@/?#]+@/, "$1***@");
}

function parsePositiveInt(value: string | undefined, fallback: number, name: string): number {
  if (!value?.trim()) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

function parseSchemas(value: string | undefined): string[] {
  const schemas = (value ?? "public")
    .split(",")
    .map((schema) => schema.trim())
    .filter(Boolean);

  return schemas.length > 0 ? schemas : ["public"];
}

function numberToString(value: number | undefined): string | undefined {
  return value === undefined ? undefined : String(value);
}
