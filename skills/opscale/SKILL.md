---
name: opscale
description: Use when the user wants to analyze operations or business data from SQL databases with natural language, including users, orders, revenue, resources, funnels, retention, refunds, or internal metrics. Uses the Opscale CLI to dynamically inspect schema and run read-only SQL through Node database drivers.
---

# Opscale

Use this skill for internal operations analytics over SQL databases.

## Workflow

1. Understand the user's metric question and time range.
2. Inspect schema dynamically before writing SQL unless the needed schema is already known in the current turn.
3. Generate a read-only `SELECT` or `WITH` query.
4. Run the query through `opscale`; do not connect to the database directly.
5. Explain the result in the user's language.
6. Include the SQL used and metric caveats when the answer depends on business interpretation.

## Commands

From this project root:

```bash
pnpm run build
node packages/cli/dist/src/index.js schema
node packages/cli/dist/src/index.js describe <table>
node packages/cli/dist/src/index.js run --sql "<select query>"
```

If the CLI is installed as a package, use:

```bash
opscale schema
opscale describe <table>
opscale run --sql "<select query>"
```

Configuration is read from environment variables:

```bash
OPSCALE_DSN
OPSCALE_SCHEMAS
OPSCALE_MAX_ROWS
OPSCALE_TIMEOUT_MS
```

Supported SQL databases:

- PostgreSQL through `pg`
- MySQL/MariaDB through `mysql2`
- SQLite local files through `sql.js`
- SQL Server through `mssql`

## Query Rules

- Use dynamic schema introspection as the source of truth for tables and columns.
- Prefer explicit column names over `select *`.
- Default to aggregation before listing raw records.
- Keep result sets small; add focused filters and time ranges.
- Treat amount units, status meanings, and preferred time fields as business assumptions unless verified from schema or project docs.
- Never run write operations. The CLI only accepts `SELECT` and `WITH`, but still avoid producing write SQL.

For careful SQL planning, read `references/query-workflow.md`.
