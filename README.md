# Opscale

AI-assisted operations analytics over SQL databases.

Opscale is a small toolkit for asking operational questions against business databases. It provides a CLI, SQL guardrails, dialect-aware schema introspection, and database drivers built on regular Node.js packages.

中文文档: [README.zh-CN.md](./README.zh-CN.md)

## Supported Databases

These are the databases currently supported for real query execution by `opscale run`, `opscale schema`, and `opscale describe`.

| Database | DSN schemes | Node package | Status |
| --- | --- | --- | --- |
| PostgreSQL | `postgres://`, `postgresql://`, `pg://`, `pgsql://` | `pg` | Supported |
| MySQL / MariaDB | `mysql://`, `mariadb://`, `maria://` | `mysql2` | Supported |
| SQLite | `sqlite://`, `sqlite3://`, `file://` | `sql.js` | Supported for local SQLite files |
| SQL Server | `sqlserver://`, `mssql://`, `ms://` | `mssql` | Supported |

Not currently supported: Redis, MongoDB, Oracle, ClickHouse, DuckDB, Snowflake, BigQuery, Elasticsearch, and other non-SQL or unimplemented stores.

## Packages

- `packages/core`: SQL guard, dialect detection, schema-introspection SQL, and driver interfaces.
- `packages/drivers`: database driver implementations backed by Node packages such as `pg`, `mysql2`, `sql.js`, and `mssql`.
- `packages/cli`: the `opscale` command-line interface.
- `skills/opscale`: Codex Skill instructions for natural-language operations analysis.

## Architecture

```text
Skill / agent / human
  -> opscale CLI
  -> @opscale/core
  -> @opscale/drivers
  -> pg / mysql2 / sql.js / mssql
  -> SQL database
```

Opscale controls query guardrails, dialect-specific schema introspection, result shape, and agent workflow. The default database layer uses Node packages directly, so users do not need to install an external SQL client binary before trying the CLI.

## Requirements

- Node.js 20+
- pnpm 11+

## Development

```bash
pnpm install
pnpm test
pnpm run typecheck
pnpm run build
```

Run the full local verification stack:

```bash
pnpm run verify
```

## CLI Configuration

```bash
export OPSCALE_DSN='postgres://readonly_user:password@host:5432/database?sslmode=require'
export OPSCALE_SCHEMAS='public'
export OPSCALE_MAX_ROWS='100'
export OPSCALE_TIMEOUT_MS='10000'
```

## Commands

```bash
pnpm run build
node packages/cli/dist/src/index.js doctor
node packages/cli/dist/src/index.js drivers
node packages/cli/dist/src/index.js schema
node packages/cli/dist/src/index.js describe orders
node packages/cli/dist/src/index.js run --sql "select status, count(*) from orders group by status"
```

When installed as a package:

```bash
opscale schema
opscale run --sql "select count(*) from users"
```

## Examples

- [SQLite quickstart](./examples/sqlite-quickstart)

## Safety Model

- Use a read-only database account for `OPSCALE_DSN`.
- `opscale run` accepts only `SELECT` and `WITH` SQL.
- Opscale wraps query results with a row limit.
- Business semantics such as revenue status, money units, soft deletes, and preferred time fields should live in project docs or Skill references, not in the generic core.

## Roadmap

See [docs/ROADMAP.md](./docs/ROADMAP.md).
