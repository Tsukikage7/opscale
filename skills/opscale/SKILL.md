---
name: opscale
description: Use when a user asks for product, operations, revenue, user, order, channel, funnel, retention, cohort, refund, campaign, or KPI analysis that should be answered from a SQL database through local read-only queries.
---

# Opscale

Opscale is the standard workflow for answering product and operations questions from SQL databases. Use it to translate business questions into clear metric plans, inspect live schema, run read-only SQL through the `opscale` CLI, and report decision-ready results with SQL and assumptions.

Respond in the user's language. Use Chinese for Chinese requests and English for English requests.

## Scope

Use this skill when the user asks for metrics or analysis from SQL-backed product data, including:

- users, accounts, orders, payments, products, plans, categories, content, carts, coupons, campaigns, subscriptions, renewals, refunds, cancellations, channels, sources, funnels, retention, cohorts, revenue, conversion, support signals, risk signals, and internal KPIs;
- questions phrased with a product or project name, such as "check this project's operations data";
- follow-up questions that depend on previously inspected SQL schema or query results.

Do not use this skill for Redis, MongoDB, Elasticsearch, log-only analysis, write/admin actions, production debugging, or application behavior debugging unless the user explicitly asks to answer from SQL data with Opscale.

## Operating Principles

- Treat live schema as the source of truth. Do not guess table or column names.
- Keep database credentials local. Never ask the user to paste DSNs, passwords, tokens, or production credentials into chat.
- Run only through Opscale unless the user explicitly asks for another database client.
- Prefer small aggregate queries over raw row dumps.
- Convert vague operations questions into a concrete metric plan before querying.
- State business assumptions when schema cannot prove them.
- Put the answer first, then scope, evidence, SQL, assumptions, and caveats.
- Keep language business-friendly. Avoid making the user read SQL before the conclusion.

## Setup Workflow

If the user asks how to install or set up Opscale, use this sequence.

1. Run the onboarding command. It installs the Skill with automatic AI tool detection, asks the user to enter a read-only database DSN locally when needed, verifies drivers, and checks schema access:

   ```bash
   npx opscale@latest install
   ```

2. If the user wants manual control, use the lower-level commands:

   ```bash
   npx opscale@latest install --skip-config
   npx opscale@latest config init
   npx opscale@latest drivers
   npx opscale@latest schema
   ```

Use `opscale` instead of `npx opscale@latest` only when the CLI is already installed globally. For project-local Skill installation, add `--project` to `opscale install`. Use `--agent codex`, `--agent claude-code`, or `--agent cursor` only when automatic detection is not appropriate.

## Query Workflow

For a business question, follow this sequence.

1. Classify the business intent:

   | Intent | Typical user wording |
   | --- | --- |
   | Trend | "how is it doing", "recently", "last week", "daily" |
   | Ranking | "best", "top", "which product/channel/category" |
   | Funnel | "where do users drop off", "conversion", "from signup to payment" |
   | Retention | "come back", "repeat", "cohort", "churn", "inactive" |
   | Revenue | "revenue", "paid orders", "AOV", "net", "refunds" |
   | Channel or campaign | "source", "utm", "campaign", "partner", "ad" |
   | Exception | "spike", "abnormal", "failed", "cancelled", "refund rate" |

2. Restate the metric plan: metric, population, filters, time range, grouping, and likely comparison period. If the user says "recently" and no project convention exists, use the last 7 days and say so.
3. Run schema introspection before writing SQL:

   ```bash
   opscale schema
   ```

   If `opscale` is unavailable, use:

   ```bash
   npx opscale@latest schema
   ```

4. Describe likely fact and dimension tables before joining them:

   ```bash
   opscale describe <table>
   ```

5. Draft a read-only `SELECT` or `WITH` query with explicit columns, clear aliases, focused filters, and a bounded result set.
6. Run the query:

   ```bash
   opscale run --sql "<select query>"
   ```

7. If the query fails, revise using the error and schema output. Do not invent columns.
8. Answer with results first, followed by scope, SQL, assumptions, and caveats.

For multi-table metrics, funnel/retention questions, revenue/refund calculations, or ambiguous business definitions, read:

- `references/query-workflow.md`
- `references/operations-metrics.md`

## Output Contract

Return in this order:

1. **Answer**: direct answer, key numbers, changes, ranking, spikes, or drops.
2. **Scope**: time range, filters, grouping, and row count.
3. **Evidence**: compact table or bullets with the most relevant results.
4. **SQL**: query used.
5. **Assumptions and caveats**: money units, status meanings, soft deletes, timezone, chosen time fields, missing business definitions.
6. **Next check**: only when it materially improves confidence.

Avoid returning large raw JSON blobs unless the user asks for raw output.

## Failure Handling

- Missing config: ask the user to run `npx opscale@latest config init` locally. Do not ask for credentials in chat.
- Unsupported database: list supported SQL families and stop. Supported DSN families are PostgreSQL, MySQL/MariaDB, SQLite, and SQL Server.
- CLI unavailable: use `npx opscale@latest ...`.
- Empty schema: ask the user to check configured schemas with `opscale config show`, then rerun `opscale schema`.
- Ambiguous business definition: inspect nearby project docs or code if available; otherwise ask one concise clarification.
- SQL error: use the error and schema output to revise once or twice. If the schema still does not support the metric, say so plainly.
- Sensitive request: keep results aggregated and avoid exposing personally identifiable information unless the user explicitly asks and the context is appropriate.
- No obvious tables: say which business concept could not be mapped to schema, then propose the closest verifiable metric.

## Safety Rules

- Never generate or run write SQL: no `insert`, `update`, `delete`, `drop`, `alter`, `truncate`, `create`, `grant`, `revoke`, `merge`, or stored procedure calls.
- Never bypass Opscale with `psql`, `mysql`, `sqlite3`, `sqlcmd`, app ORM scripts, or direct driver code unless the user explicitly asks.
- Never print a full DSN or password.
- Do not treat Opscale's SQL guard as the only protection. The database account should be read-only.
