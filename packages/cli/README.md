# @opscale/cli

Command-line interface for Opscale.

The CLI is intentionally thin. It parses user commands, loads configuration, delegates SQL guardrails and dialect decisions to `@opscale/core`, and queries databases through `@opscale/drivers`.

Supported query drivers:

| Database | Node package |
| --- | --- |
| PostgreSQL | `pg` |
| MySQL / MariaDB | `mysql2` |
| SQLite | `sql.js` |
| SQL Server | `mssql` |

## Configuration

```bash
export OPSCALE_DSN='postgres://readonly_user:password@localhost:5432/app?sslmode=disable'
export OPSCALE_SCHEMAS='public'
export OPSCALE_MAX_ROWS='100'
export OPSCALE_TIMEOUT_MS='10000'
```

## Commands

```bash
opscale doctor
opscale drivers
opscale schema
opscale describe orders
opscale run --sql "select status, count(*) from orders group by status"
```

During development:

```bash
pnpm --filter @opscale/cli build
node packages/cli/dist/src/index.js schema
```

## Notes

- Use a read-only database account for `OPSCALE_DSN`.
- `opscale run` accepts only `SELECT` and `WITH` SQL.
- `opscale schema` uses dialect-specific introspection SQL.
- `opscale run` currently supports PostgreSQL, MySQL/MariaDB, SQLite, and SQL Server through Node packages.

## 中文说明

这个包是 Opscale 的命令行入口。CLI 本身保持轻量，只负责解析命令、读取环境变量配置，并把 SQL 保护、方言判断和数据库查询交给 `@opscale/core` 与 `@opscale/drivers`。

当前真实支持的查询驱动：

| 数据库 | Node 包 |
| --- | --- |
| PostgreSQL | `pg` |
| MySQL / MariaDB | `mysql2` |
| SQLite | `sql.js` |
| SQL Server | `mssql` |

不支持 Redis、MongoDB、Oracle、ClickHouse、DuckDB、Snowflake、BigQuery、Elasticsearch 等未实现数据源。
