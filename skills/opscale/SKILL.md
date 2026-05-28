---
name: opscale
description: Use when a user asks for product, operations, revenue, order, customer, channel, funnel, retention, refund, or KPI analysis that should be answered from a SQL database through read-only queries.
---

# Opscale

Opscale is the standard workflow for answering business and operations questions from SQL databases. Use it to inspect live schema, run read-only SQL through the `opscale` CLI, and report results with the SQL and assumptions.

Respond in the user's language. Use Chinese for Chinese requests and English for English requests.

## Scope

Use this skill when the user asks for metrics or analysis from SQL-backed product data, including:

- users, orders, payments, products, categories, carts, coupons, campaigns, subscriptions, refunds, channels, funnels, retention, cohorts, revenue, conversion, and internal KPIs;
- questions phrased with a product or project name, such as "check this project's operations data";
- follow-up questions that depend on previously inspected SQL schema or query results.

Do not use this skill for Redis, MongoDB, Elasticsearch, log-only analysis, write/admin actions, production debugging, or application behavior debugging unless the user explicitly asks to answer from SQL data with Opscale.

## Operating Principles

- Treat live schema as the source of truth. Do not guess table or column names.
- Keep database credentials local. Never ask the user to paste DSNs, passwords, tokens, or production credentials into chat.
- Run only through Opscale unless the user explicitly asks for another database client.
- Prefer small aggregate queries over raw row dumps.
- State business assumptions when schema cannot prove them.
- Put the answer first, then evidence, SQL, and caveats.

## Setup Workflow

If the user asks how to install or set up Opscale, use this sequence.

1. Identify the user's AI agent target:

   | User tool | Agent target |
   | --- | --- |
   | Codex | `codex` |
   | Claude Code | `claude-code` |
   | Cursor | `cursor` |

2. Install the Skill for that agent:

   ```bash
   npx opscale@latest install --agent codex
   ```

3. Ask the user to configure a read-only database locally:

   ```bash
   npx opscale@latest config init
   ```

4. Verify the local setup:

   ```bash
   npx opscale@latest drivers
   npx opscale@latest schema
   ```

Use `opscale` instead of `npx opscale@latest` only when the CLI is already installed globally. For project-local Skill installation, add `--project` to `opscale install`.

## Query Workflow

For a business question, follow this sequence.

1. Restate the requested metric, filters, time range, and grouping. If the user says "recently" and no project convention exists, use the last 7 days and say so.
2. Run schema introspection before writing SQL:

   ```bash
   opscale schema
   ```

   If `opscale` is unavailable, use:

   ```bash
   npx opscale@latest schema
   ```

3. Describe likely fact and join tables before joining them:

   ```bash
   opscale describe <table>
   ```

4. Draft a read-only `SELECT` or `WITH` query with explicit columns, clear aliases, focused filters, and a bounded result set.
5. Run the query:

   ```bash
   opscale run --sql "<select query>"
   ```

6. If the query fails, revise using the error and schema output. Do not invent columns.
7. Answer with results first, followed by SQL and assumptions.

For multi-table metrics, funnel/retention questions, revenue/refund calculations, or ambiguous business definitions, read `references/query-workflow.md`.

## Output Contract

Return:

- direct answer and key numbers;
- time range, filters, grouping, and row count;
- SQL used;
- assumptions and caveats, especially money units, status meanings, soft deletes, timezone, and chosen time fields;
- suggested follow-up only when it materially improves confidence.

Avoid returning large raw JSON blobs unless the user asks for raw output.

## Failure Handling

- Missing config: ask the user to run `npx opscale@latest config init` locally. Do not ask for credentials in chat.
- Unsupported database: list supported SQL families and stop. Supported DSN families are PostgreSQL, MySQL/MariaDB, SQLite, and SQL Server.
- CLI unavailable: use `npx opscale@latest ...`.
- Empty schema: ask the user to check configured schemas with `opscale config show`, then rerun `opscale schema`.
- Ambiguous business definition: inspect nearby project docs or code if available; otherwise ask one concise clarification.
- SQL error: use the error and schema output to revise once or twice. If the schema still does not support the metric, say so plainly.
- Sensitive request: keep results aggregated and avoid exposing personally identifiable information unless the user explicitly asks and the context is appropriate.

## Safety Rules

- Never generate or run write SQL: no `insert`, `update`, `delete`, `drop`, `alter`, `truncate`, `create`, `grant`, `revoke`, `merge`, or stored procedure calls.
- Never bypass Opscale with `psql`, `mysql`, `sqlite3`, `sqlcmd`, app ORM scripts, or direct driver code unless the user explicitly asks.
- Never print a full DSN or password.
- Do not treat Opscale's SQL guard as the only protection. The database account should be read-only.
