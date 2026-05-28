export interface Config {
  dsn: string;
  driver: "node-packages";
  maxRows: number;
  timeoutMs: number;
  schemas: string[];
}

export interface DriverConfig {
  driver: "node-packages";
  timeoutMs: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const dsn = env.OPSCALE_DSN?.trim();
  if (!dsn) {
    throw new Error("OPSCALE_DSN is required");
  }
  const driver = loadDriverConfig(env);

  return {
    dsn,
    driver: driver.driver,
    maxRows: parsePositiveInt(env.OPSCALE_MAX_ROWS, 100, "OPSCALE_MAX_ROWS"),
    timeoutMs: driver.timeoutMs,
    schemas: parseSchemas(env.OPSCALE_SCHEMAS),
  };
}

export function loadDriverConfig(env: NodeJS.ProcessEnv = process.env): DriverConfig {
  return {
    driver: "node-packages",
    timeoutMs: parsePositiveInt(env.OPSCALE_TIMEOUT_MS, 10_000, "OPSCALE_TIMEOUT_MS"),
  };
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
