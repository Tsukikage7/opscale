# Opscale

[![npm version](https://img.shields.io/npm/v/opscale.svg)](https://www.npmjs.com/package/opscale)
[![CI](https://github.com/Tsukikage7/opscale/actions/workflows/ci.yml/badge.svg)](https://github.com/Tsukikage7/opscale/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node.js 22.13+](https://img.shields.io/badge/node-%3E%3D22.13-43853d.svg)](https://nodejs.org/)

[中文版](./README.zh-CN.md) | English

Opscale lets product and operations teams ask business questions in plain language.

Your AI agent inspects the real database schema, runs read-only SQL locally through Opscale, and returns the numbers, SQL, and assumptions you can verify.

Ask questions like:

```text
How did revenue, paid orders, and refunds change over the last 7 days?
Which products, categories, or channels contributed the most revenue this month?
Where did users drop off in the signup-to-payment funnel?
Which customer cohorts are retaining or purchasing again?
Did any refund, cancellation, or failed-payment metric spike recently?
```

## Why Opscale?

- Built for AI agents: works with Codex, Claude Code, Cursor, and compatible AI tools.
- Business-first workflow: maps broad operations questions into metrics, time ranges, filters, and groupings.
- Real schema first: the agent checks live tables and columns before writing SQL.
- Local credentials: database DSNs stay on your machine through `opscale config init`.
- Read-only by default: `opscale run` accepts only `SELECT` and `WITH`.
- One npm package: install and run `opscale`; SQL drivers are included.

## Quick Start

Ask your AI assistant, or run this in your terminal:

```bash
npx opscale@latest install
```

Opscale will:

1. install the AI Skill for your agent;
2. ask you to enter a read-only database DSN locally;
3. verify database drivers and schema access;
4. show the first question you can ask.

Only enter the database DSN in your local terminal. Do not paste DSNs, passwords, tokens, or production credentials into AI chat.

Then ask:

```text
Use Opscale to show revenue, paid orders, and refunds by day for the last 7 days.
```

### Agent Skills

Opscale uses the Skills installer to detect the current AI tool automatically. Use `--agent` only when you need to override detection:

| User's tool | Command |
| --- | --- |
| Codex | `npx opscale@latest install --agent codex` |
| Claude Code | `npx opscale@latest install --agent claude-code` |
| Cursor | `npx opscale@latest install --agent cursor` |

For a project-local Skill install:

```bash
npx opscale@latest install --project
```

### Manual Setup

Use the lower-level commands when you want to control each step:

```bash
npx opscale@latest install --skip-config
npx opscale@latest config init
npx opscale@latest drivers
npx opscale@latest schema
```

Or install globally:

```bash
npm install -g opscale
opscale install
```

## What You Can Ask

Opscale is intentionally generic. It works with common product, operations, revenue, and customer data models.

| Scenario | Example questions |
| --- | --- |
| Business trend | How did revenue, paid orders, active users, or refunds change recently? |
| Product or offer performance | Which products, plans, categories, content items, or offers are driving results? |
| Funnel | Where do users drop off between signup, activation, checkout, payment, or renewal? |
| Retention | Which cohorts are coming back, purchasing again, or becoming inactive? |
| Channel performance | Which channels, campaigns, sources, or partners bring the best users or revenue? |
| Risk and exceptions | Did refunds, cancellations, failed payments, fraud flags, or support-related metrics spike? |

Opscale does not require your tables to use these exact names. The AI agent must inspect your real schema and map these business concepts to available tables and columns.

## Configure A Database

The install command runs this step for you. Use it directly only when you want to reconfigure the database.

Use a read-only database account. This is required for production data.

```bash
npx opscale@latest config init
```

The command prompts for:

```text
Database DSN
Schemas
Max rows
Timeout ms
```

The config is saved locally:

```text
~/.opscale/config.json
```

Check the saved config with the password redacted:

```bash
npx opscale@latest config show
```

Verify schema access:

```bash
npx opscale@latest schema
```

Environment variables are also supported and override the saved config:

```bash
export OPSCALE_DSN='postgres://readonly_user:password@host:5432/database?sslmode=require'
export OPSCALE_SCHEMAS='public'
export OPSCALE_MAX_ROWS='100'
export OPSCALE_TIMEOUT_MS='10000'
```

## How The Agent Should Work

Ask the AI agent a business question:

```text
Use Opscale to show paid orders and revenue by day for the last 7 days.
```

The agent should:

1. classify the question, such as trend, funnel, retention, cohort, ranking, or anomaly;
2. confirm the metric, filters, time range, and grouping;
3. inspect the database schema;
4. describe likely fact and dimension tables before joining them;
5. run read-only SQL through `opscale run`;
6. return the answer first, then evidence, SQL, assumptions, and caveats.

When the result is meant for product, operations, or leadership stakeholders, ask the agent to create a standalone HTML report:

```text
Use Opscale to analyze revenue, orders, and refunds for the last 7 days, then create an HTML report for operations.
```

The HTML report should put the conclusion, metric cards, charts, evidence table, smart analysis, scope, and caveats first. SQL should go in a collapsed technical appendix.

For quick chat answers, use this shape:

```text
Answer
- Key numbers and changes
- Notable spikes, drops, or ranking changes

Scope
- Time range, filters, grouping, row count

SQL
- Query used

Assumptions
- Money unit, status meaning, timezone, soft deletes, and missing definitions
```

## Supported Databases

| Database | DSN schemes | Status |
| --- | --- | --- |
| PostgreSQL | `postgres://`, `postgresql://`, `pg://`, `pgsql://` | Supported |
| MySQL / MariaDB | `mysql://`, `mariadb://`, `maria://` | Supported |
| SQLite | `sqlite://`, `sqlite3://`, `file://` | Supported for local files |
| SQL Server | `sqlserver://`, `mssql://`, `ms://` | Supported |

Not currently supported: Redis, MongoDB, Oracle, ClickHouse, DuckDB, Snowflake, BigQuery, Elasticsearch.

## Commands

```bash
opscale install
opscale install --project
opscale install --skip-config
opscale install --skip-skill
opscale doctor
opscale drivers
opscale config init
opscale config show
opscale config path
opscale schema
opscale describe orders
opscale run --sql "select status, count(*) from orders group by status"
```

## Security

- Use a read-only database role.
- Keep production DSNs out of chat, issues, screenshots, and logs.
- Review AI-generated SQL before running it against sensitive or regulated data.
- Keep results aggregated by default. Avoid exposing personally identifiable information unless explicitly needed and appropriate.
- Treat money units, status meanings, soft deletes, and time fields as business assumptions unless verified.
- Opscale's SQL guardrails are defense in depth, not a replacement for database permissions.

## Development

Requires Node.js 22.13+ and pnpm 11.

```bash
pnpm install
pnpm run verify
```

Repository layout:

- `skills/opscale`: the single Opscale Skill; it answers in the user's language.
- `skills/opscale/references`: reusable workflow, metric guidance, and HTML report guidance for product and operations analysis.
- `packages/cli`: the only npm package. SQL guardrails and database drivers live inside this package as internal modules.

Release notes and maintainer workflow are in [docs/RELEASING.md](./docs/RELEASING.md).
