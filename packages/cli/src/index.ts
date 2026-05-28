#!/usr/bin/env node

import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

import { detectDialect, getDialectAdapter, normalizeReadOnlySql } from "./core/index.js";
import { DefaultSqlDriver } from "./drivers/index.js";
import { parseAgentTarget, runInstall } from "./install.js";

import { getConfigPath, loadConfig, loadDriverConfig, loadStoredConfig, redactDsn, saveStoredConfig } from "./config.js";

interface ParsedArgs {
  command?: string;
  flags: Map<string, string | boolean>;
  positional: string[];
}

async function main(argv: string[]): Promise<void> {
  const args = parseArgs(argv);

  switch (args.command) {
    case undefined:
    case "help":
    case "-h":
    case "--help":
      printUsage();
      return;
    case "doctor":
      await runDoctor();
      return;
    case "drivers":
      await runDrivers();
      return;
    case "install":
      await runOnboarding(args.flags);
      return;
    case "config":
      await runConfig(args.positional, args.flags);
      return;
    case "schema":
      await runSchema(getOptionalString(args.flags, "table"));
      return;
    case "describe":
      await runSchema(args.positional[0] ?? getOptionalString(args.flags, "table"));
      return;
    case "run":
      await runQuery(
        getRequiredString(args.flags, "sql"),
        getOptionalNumber(args.flags, "max-rows"),
      );
      return;
    default:
      throw new Error(`Unknown command: ${args.command}`);
  }
}

async function runDoctor(): Promise<void> {
  const config = loadDriverConfig();
  const driver = createDriver(config);
  const result = await driver.doctor();
  printJSON(result);
}

async function runDrivers(): Promise<void> {
  const config = loadDriverConfig();
  const driver = createDriver(config);
  printJSON(driver.drivers());
}

async function runOnboarding(flags: Map<string, string | boolean>): Promise<void> {
  const dryRun = flags.has("dry-run");
  const skipConfig = flags.has("skip-config");
  const skipVerify = flags.has("skip-verify");

  await runInstall({
    agent: parseAgentTarget(getOptionalString(flags, "agent")),
    global: !flags.has("project"),
    dryRun,
    skipSkill: flags.has("skip-skill"),
  });

  if (dryRun) {
    printOnboardingNextStep();
    return;
  }

  if (skipConfig) {
    console.log("Skipping database config.");
  } else if (hasConfiguredDsn()) {
    console.log("Using existing database config.");
  } else {
    console.log("Configure a local read-only database.");
    await runConfigInit(flags);
  }

  if (skipVerify) {
    console.log("Skipping verification.");
    printOnboardingNextStep();
    return;
  }

  console.log("Checking database drivers...");
  await runDrivers();
  console.log("Checking schema access...");
  await runSchema();
  printOnboardingNextStep();
}

async function runConfig(positional: string[], flags: Map<string, string | boolean>): Promise<void> {
  const subcommand = positional[0] ?? "help";
  switch (subcommand) {
    case "help":
    case "-h":
    case "--help":
      printConfigUsage();
      return;
    case "init":
      await runConfigInit(flags);
      return;
    case "show":
      printJSON({
        path: getConfigPath(),
        ...redactStoredConfig(loadStoredConfig()),
      });
      return;
    case "path":
      console.log(getConfigPath());
      return;
    default:
      throw new Error(`Unknown config command: ${subcommand}`);
  }
}

async function runConfigInit(flags: Map<string, string | boolean>): Promise<void> {
  const existing = loadStoredConfig();
  const dsn = getOptionalString(flags, "dsn") ?? await promptValue("Database DSN", "dsn", existing.dsn);
  if (!dsn.trim()) {
    throw new Error("Database DSN is required");
  }
  const schemas = getOptionalString(flags, "schemas") ?? await promptValue("Schemas", "schemas", existing.schemas?.join(",") ?? "public");
  const maxRows = getOptionalString(flags, "max-rows") ?? await promptValue("Max rows", "max-rows", String(existing.maxRows ?? 100));
  const timeoutMs = getOptionalString(flags, "timeout-ms") ?? await promptValue("Timeout ms", "timeout-ms", String(existing.timeoutMs ?? 10000));

  const path = saveStoredConfig({
    dsn: dsn.trim(),
    schemas: schemas.split(",").map((schema) => schema.trim()).filter(Boolean),
    maxRows: parsePositiveIntFromInput(maxRows, "max rows"),
    timeoutMs: parsePositiveIntFromInput(timeoutMs, "timeout ms"),
  });

  printJSON({
    path,
    dsn: redactDsn(dsn.trim()),
    schemas: schemas.split(",").map((schema) => schema.trim()).filter(Boolean),
  });
}

async function runSchema(table?: string): Promise<void> {
  const config = loadConfig();
  const dialect = detectDialect(config.dsn);
  const adapter = getDialectAdapter(dialect);
  const plan = adapter.schemaPlan({ schemas: config.schemas, table });
  const driver = createDriver(config);
  const result = await driver.query({
    dsn: config.dsn,
    sql: plan.sql,
    maxRows: config.maxRows,
    timeoutMs: config.timeoutMs,
  });
  printJSON({
    dialect,
    columns: result.rows,
    sql: result.sql,
  });
}

async function runQuery(sql: string, maxRows?: number): Promise<void> {
  const config = loadConfig();
  const normalized = normalizeReadOnlySql(sql);
  const driver = createDriver(config);
  const result = await driver.query({
    dsn: config.dsn,
    sql: normalized,
    maxRows: Math.min(maxRows ?? config.maxRows, config.maxRows),
    timeoutMs: config.timeoutMs,
  });
  printJSON(result);
}

function createDriver(_config: ReturnType<typeof loadConfig> | ReturnType<typeof loadDriverConfig>): DefaultSqlDriver {
  return new DefaultSqlDriver();
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;
  const flags = new Map<string, string | boolean>();
  const positional: string[] = [];

  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg.startsWith("--")) {
      const raw = arg.slice(2);
      const [key, inlineValue] = raw.split("=", 2);
      if (inlineValue !== undefined) {
        flags.set(key, inlineValue);
        continue;
      }
      const next = rest[i + 1];
      if (next && !next.startsWith("--")) {
        flags.set(key, next);
        i += 1;
      } else {
        flags.set(key, true);
      }
      continue;
    }
    positional.push(arg);
  }

  return { command, flags, positional };
}

function getRequiredString(flags: Map<string, string | boolean>, name: string): string {
  const value = flags.get(name);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`--${name} is required`);
  }
  return value;
}

function getOptionalString(flags: Map<string, string | boolean>, name: string): string | undefined {
  const value = flags.get(name);
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getOptionalNumber(flags: Map<string, string | boolean>, name: string): number | undefined {
  const value = flags.get(name);
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`--${name} must be a positive integer`);
  }
  return parsed;
}

function printJSON(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

async function promptValue(label: string, flag: string, current: string | undefined): Promise<string> {
  if (!input.isTTY) {
    throw new Error(`--${flag} is required in non-interactive mode`);
  }
  const rl = createInterface({ input, output });
  try {
    const suffix = current ? ` [${redactDsn(current)}]` : "";
    const answer = await rl.question(`${label}${suffix}: `);
    return answer.trim() || current || "";
  } finally {
    rl.close();
  }
}

function redactStoredConfig(config: ReturnType<typeof loadStoredConfig>): object {
  return {
    ...config,
    dsn: redactDsn(config.dsn),
  };
}

function parsePositiveIntFromInput(value: string, label: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
  return parsed;
}

function hasConfiguredDsn(): boolean {
  return Boolean(process.env.OPSCALE_DSN?.trim() || loadStoredConfig().dsn?.trim());
}

function printOnboardingNextStep(): void {
  console.log(`
Done.

Now ask your AI agent:
  Use Opscale to show revenue, paid orders, and refunds by day for the last 7 days.
`);
}

function printUsage(): void {
  console.log(`Opscale: read-only product and operations analytics for AI agents.

Environment:
  OPSCALE_DSN             Database DSN, preferably for a readonly account
  OPSCALE_SCHEMAS         Comma-separated schemas to introspect, default: public
  OPSCALE_MAX_ROWS        Max rows returned by run/schema, default: 100
  OPSCALE_TIMEOUT_MS      Command timeout, default: 10000

Commands:
  install                 Install the Skill, configure a database, and verify setup
  doctor                  Check database driver availability
  schema [--table name]   Print dynamic table/column metadata as JSON
  describe <table>        Print one table's column metadata as JSON
  run --sql <select>      Execute a SELECT/WITH query through the configured driver
  config init             Save a local database config
  config show             Show local config with secrets redacted
  config path             Print local config file path

Examples:
  opscale install
  opscale install --project
  opscale config init
  opscale schema
  opscale describe orders
  opscale run --sql "select status, count(*) as orders from orders group by status"

AI AGENT SKILLS:
  Quick start:
    npx opscale@latest install

  The install command:
    1. installs the Opscale Skill using automatic AI tool detection;
    2. asks the user to enter a read-only database DSN locally;
    3. verifies drivers and schema access;
    4. prints the first business question to ask.

  Advanced:
    opscale install --agent cursor
    opscale install --project
    opscale install --skip-config
    opscale install --skip-skill

  List available skills:
    npx skills add Tsukikage7/opscale --list
`);
}

function printConfigUsage(): void {
  console.log(`Opscale config commands.

Config file:
  ${getConfigPath()}

Commands:
  config init             Prompt for a local database DSN and save it
  config show             Show saved config with password redacted
  config path             Print config file path

Non-interactive example:
  opscale config init --dsn "postgres://readonly:password@host:5432/db" --schemas public --max-rows 100 --timeout-ms 10000

Environment variables still override saved config:
  OPSCALE_DSN, OPSCALE_SCHEMAS, OPSCALE_MAX_ROWS, OPSCALE_TIMEOUT_MS
`);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`opscale: ${message}`);
  process.exitCode = 1;
});
