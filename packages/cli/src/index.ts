#!/usr/bin/env node

import { detectDialect, getDialectAdapter, normalizeReadOnlySql } from "opscale-core";
import { DefaultSqlDriver } from "opscale-drivers";

import { loadConfig, loadDriverConfig } from "./config.js";

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

function printUsage(): void {
  console.log(`Opscale: AI-assisted operations analytics over SQL databases.

Environment:
  OPSCALE_DSN             Database DSN, preferably for a readonly account
  OPSCALE_SCHEMAS         Comma-separated schemas to introspect, default: public
  OPSCALE_MAX_ROWS        Max rows returned by run/schema, default: 100
  OPSCALE_TIMEOUT_MS      Command timeout, default: 10000

Commands:
  doctor                  Check database driver availability
  schema [--table name]   Print dynamic table/column metadata as JSON
  describe <table>        Print one table's column metadata as JSON
  run --sql <select>      Execute a SELECT/WITH query through the configured driver

Examples:
  opscale schema
  opscale describe orders
  opscale run --sql "select status, count(*) from orders group by status"

AI AGENT SKILLS:
  Opscale pairs with AI agent skills that teach Codex, Claude Code, Cursor,
  and compatible tools how to inspect schema and run read-only SQL.

  Install the English skill:
    npx skills add Tsukikage7/opscale --skill opscale --agent codex --global --yes

  Install the Chinese skill:
    npx skills add Tsukikage7/opscale --skill opscale-zh-cn --agent codex --global --yes

  List available skills:
    npx skills add Tsukikage7/opscale --list
`);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`opscale: ${message}`);
  process.exitCode = 1;
});
