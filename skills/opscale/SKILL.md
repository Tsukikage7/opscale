---
name: opscale
description: Use when answering operations or business data questions that require read-only SQL over PostgreSQL, MySQL/MariaDB, SQLite, or SQL Server, including users, orders, revenue, resources, funnels, retention, refunds, or internal KPIs.
---

# Opscale

Opscale is the required path for read-only operations analytics over SQL databases. The CLI is the execution backend; this skill controls how the agent inspects schema, writes safe SQL, runs the query, and explains the result.

Respond in the user's language. Use Chinese for Chinese requests and English for English requests.

## When to Use

- Use for natural-language questions over SQL operations data: users, orders, subscriptions, revenue, refunds, resources, funnels, retention, and internal KPIs.
- Use when the user says a product or project name and asks for operations data, business metrics, database metrics, or internal reports.
- Do not use for Redis, MongoDB, Elasticsearch, logs-only analysis, admin/write operations, or app debugging unless the user explicitly asks to inspect SQL data with Opscale.

## Preconditions

- `OPSCALE_DSN` must point to a read-only database account.
- Supported DSN families: `postgres://`, `postgresql://`, `pg://`, `pgsql://`, `mysql://`, `mariadb://`, `maria://`, `sqlite://`, `sqlite3://`, `file://`, `sqlserver://`, `mssql://`, `ms://`.
- Optional controls: `OPSCALE_SCHEMAS`, `OPSCALE_MAX_ROWS`, `OPSCALE_TIMEOUT_MS`.
- If the database is not configured, ask the user to run `opscale config init` or `npx opscale@latest config init` locally. Do not ask the user to paste production credentials into chat.

## Command Selection

Use the installed CLI when available:

```bash
opscale drivers
opscale schema
opscale describe <table>
opscale run --sql "<select query>"
```

If `opscale` is not installed globally, use the published npm package through `npx`:

```bash
npx opscale@latest drivers
npx opscale@latest config init
npx opscale@latest schema
npx opscale@latest describe <table>
npx opscale@latest run --sql "<select query>"
```

If both are available, use `opscale`. Do not use repo-local development commands for normal user workflows.

## Required Workflow

1. Restate the metric, filters, and time range. If any of them are missing, choose a conservative default only when the user clearly expects one, and state it.
2. Run schema introspection before writing SQL unless the relevant schema was already inspected in the current turn.
3. Use `opscale describe <table>` for likely tables before joining them.
4. Draft a read-only `SELECT` or `WITH` query with explicit columns, focused filters, and a bounded result set.
5. Run the query through `opscale run --sql`. Do not bypass Opscale with `psql`, `mysql`, `sqlite3`, `redis-cli`, app ORM scripts, or direct driver code unless the user explicitly asks.
6. Answer in the user's language with the result first, then the SQL and assumptions.

## Project Example

For a product database, the user should configure a read-only DSN in their shell or secret manager:

```bash
export OPSCALE_DSN='postgres://readonly_user:password@host:5432/app_production?sslmode=require'
export OPSCALE_SCHEMAS='public'
export OPSCALE_MAX_ROWS='100'
```

Then they can ask:

```text
Use the opscale skill to show paid order count and refund amount by day for the last 7 days.
```

The agent must inspect the live schema first, then run read-only SQL through Opscale.

## Skill Installation

Install the skill from the GitHub repository with the generic Skills installer:

```bash
npx opscale@latest install --agent codex
npx opscale@latest install --agent claude-code
npx opscale@latest install --agent cursor
```

Use one command for the agent the user actually uses. For project-local installation, add `--project`.

## Failure Handling

- Missing database config: ask the user to run `npx opscale@latest config init` locally.
- Unsupported DSN: list supported database families and stop.
- CLI unavailable: use `npx opscale@latest ...` or ask the user to install the published package.
- Empty or too broad schema output: check `OPSCALE_SCHEMAS`, then describe likely tables by name if known.
- SQL error: use the error and schema output to revise the query. Do not guess columns that schema inspection did not show.
- Ambiguous metric semantics: inspect nearby project docs/code if available; otherwise ask one concise clarification.

## Output Contract

Return:

- Direct answer and key numbers.
- Time range, filters, and row count.
- SQL used.
- Assumptions or caveats, especially money units, status meanings, soft deletes, and chosen time fields.
- Suggested follow-up query only when it materially improves confidence.

## Query Rules

- Use dynamic schema introspection as the source of truth for tables and columns.
- Prefer explicit column names over `select *`.
- Default to aggregation before listing raw records.
- Keep result sets small; add focused filters and time ranges.
- Treat amount units, status meanings, and preferred time fields as business assumptions unless verified from schema or project docs.
- Never run write operations. The CLI only accepts `SELECT` and `WITH`, but still avoid producing write SQL.

For multi-table metrics, funnel/retention questions, or ambiguous business definitions, read `references/query-workflow.md`.
