# Opscale

[![CI](https://github.com/Tsukikage7/opscale/actions/workflows/ci.yml/badge.svg)](https://github.com/Tsukikage7/opscale/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node.js 22.13+](https://img.shields.io/badge/node-%3E%3D22.13-43853d.svg)](https://nodejs.org/)

Opscale helps product, operations, and business teams ask questions about SQL data in plain language:

```text
How many paid orders did we have each day over the last 7 days?
What was revenue by plan last month?
Did refunds spike recently?
What is the signup-to-paid conversion rate?
```

Instead of letting an AI assistant guess tables or write one-off database scripts, Opscale makes the agent inspect the real schema first, run read-only SQL through a CLI, and report the SQL and assumptions with the answer.

中文文档: [README.zh-CN.md](./README.zh-CN.md)

## Install With AI

Tell your AI assistant:

```text
Install the Opscale skill. After that, use Opscale's read-only workflow for operations data questions.
```

The assistant should run:

```bash
npx skills add Tsukikage7/opscale --skill opscale --agent codex --global --yes
```

Other AI tools:

```bash
npx skills add Tsukikage7/opscale --skill opscale --agent claude-code --global --yes
npx skills add Tsukikage7/opscale --skill opscale --agent cursor --global --yes
```

Chinese skill:

```bash
npx skills add Tsukikage7/opscale --skill opscale-zh-cn --agent codex --global --yes
```

For project-local installation, omit `--global`.

## Install The CLI

The skill calls the `opscale` CLI to query databases. Without a global install:

```bash
npx opscale@latest drivers
npx opscale@latest schema
```

Or install it globally:

```bash
npm install -g opscale
opscale drivers
opscale schema
```

## Connect A Database

Use a read-only database account. Do not paste production credentials into chat;
configure them in your local shell or secret manager.

```bash
export OPSCALE_DSN='postgres://readonly_user:password@host:5432/database?sslmode=require'
export OPSCALE_SCHEMAS='public'
export OPSCALE_MAX_ROWS='100'
export OPSCALE_TIMEOUT_MS='10000'
```

Then verify schema access:

```bash
npx opscale@latest schema
```

## Use It

Ask a concrete business question:

```text
Use the opscale skill to show daily paid order counts for the last 7 days.
```

The agent will:

1. confirm the metric and time range;
2. inspect database schema;
3. write read-only SQL;
4. run the query;
5. return the result, SQL, and assumptions.

## Supported Databases

| Database | DSN schemes | Status |
| --- | --- | --- |
| PostgreSQL | `postgres://`, `postgresql://`, `pg://`, `pgsql://` | Supported |
| MySQL / MariaDB | `mysql://`, `mariadb://`, `maria://` | Supported |
| SQLite | `sqlite://`, `sqlite3://`, `file://` | Supported for local files |
| SQL Server | `sqlserver://`, `mssql://`, `ms://` | Supported |

Not currently supported: Redis, MongoDB, Oracle, ClickHouse, DuckDB, Snowflake,
BigQuery, Elasticsearch.

## Safety

- Use a read-only database account.
- `opscale run` accepts only `SELECT` and `WITH` queries.
- Query results are row-limited.
- Business definitions such as money units, order statuses, soft deletes, and time fields must be confirmed from your project context.

## For Developers

Requires Node.js 22.13+ and pnpm 11.

```bash
pnpm install
pnpm run verify
```

Repository layout:

- `skills/opscale`: English skill.
- `skills/opscale-zh-cn`: Chinese skill.
- `packages/cli`: command-line tool.
- `packages/core`: SQL guardrails and dialect logic.
- `packages/drivers`: database drivers.

## Release

This repository uses Changesets. The current release prepares `0.1.0`.

```bash
pnpm run verify
pnpm changeset version
git add .
git commit -m "chore: prepare initial release"
git push origin main
```

npm publishing is handled by the GitHub Actions release workflow after `NPM_TOKEN`
is configured in repository secrets.
