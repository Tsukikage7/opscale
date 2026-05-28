# Opscale

[![npm version](https://img.shields.io/npm/v/opscale.svg)](https://www.npmjs.com/package/opscale)
[![CI](https://github.com/Tsukikage7/opscale/actions/workflows/ci.yml/badge.svg)](https://github.com/Tsukikage7/opscale/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node.js 22.13+](https://img.shields.io/badge/node-%3E%3D22.13-43853d.svg)](https://nodejs.org/)

[中文版](./README.zh-CN.md) | English

Opscale is an AI-native CLI and Skill for answering operations questions from SQL databases.

It helps product, operations, and business teams ask questions like:

```text
How many paid orders did we have each day over the last 7 days?
Which regions sold the most VPS plans last month?
What was revenue by plan?
Did refunds spike recently?
```

Opscale makes the AI agent inspect the real database schema first, run read-only SQL through a local CLI, and return the result with the SQL and assumptions.

## Why Opscale?

- Agent-native workflow: built for Codex, Claude Code, Cursor, and compatible AI tools.
- Real schema first: the agent inspects live tables and columns before writing SQL.
- Local credentials: database DSNs stay on the user's machine through `opscale config init`.
- Read-only guardrails: `opscale run` only accepts `SELECT` and `WITH`.
- One npm package: install and run `opscale`, with drivers included.

## Quick Start

### For AI Agents

If you are an AI assistant helping a user install Opscale, use the guided installer:

```bash
npx opscale@latest install --agent codex
```

Other supported agent targets:

```bash
npx opscale@latest install --agent claude-code
npx opscale@latest install --agent cursor
```

Then ask the user to configure the database locally:

```bash
npx opscale@latest config init
```

Do not ask the user to paste database credentials into chat.

### For Human Users

You can use Opscale without a global install:

```bash
npx opscale@latest install --agent codex
npx opscale@latest drivers
npx opscale@latest config init
npx opscale@latest schema
```

Or install the CLI globally:

```bash
npm install -g opscale
opscale install --agent codex
opscale drivers
opscale config init
opscale schema
```

## Configure A Database

Use a read-only database account.

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

## Ask A Question

Ask the AI agent a concrete business question:

```text
Use Opscale to show paid orders and revenue by day for the last 7 days.
```

The agent should:

1. confirm the metric, filters, and time range;
2. inspect the database schema;
3. describe likely tables before joining them;
4. run read-only SQL through `opscale run`;
5. answer with the result, SQL, and assumptions.

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
opscale install --agent codex
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
- Review AI-generated SQL before running it against sensitive data.
- Treat money units, order statuses, soft deletes, and time fields as business assumptions unless verified.
- Opscale's SQL guardrails are defense in depth, not a replacement for database permissions.

## Development

Requires Node.js 22.13+ and pnpm 11.

```bash
pnpm install
pnpm run verify
```

Repository layout:

- `skills/opscale`: the single Opscale Skill; it answers in the user's language.
- `packages/cli`: the only npm package. SQL guardrails and database drivers live inside this package as internal modules.

Release notes and maintainer workflow are in [docs/RELEASING.md](./docs/RELEASING.md).
