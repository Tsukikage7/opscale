# Opscale 中文说明

Opscale 是一个面向 SQL 数据库的 AI 辅助运营分析工具。它提供 CLI、SQL 只读保护、按方言生成的 schema introspection SQL，以及基于 Node.js 常规数据库包实现的驱动层。

English README: [README.md](./README.md)

## 当前真实支持的数据库

下面这些数据库已经接入默认驱动，能够被 `opscale run`、`opscale schema`、`opscale describe` 实际执行查询。

| 数据库 | DSN scheme | Node 包 | 状态 |
| --- | --- | --- | --- |
| PostgreSQL | `postgres://`、`postgresql://`、`pg://`、`pgsql://` | `pg` | 已支持 |
| MySQL / MariaDB | `mysql://`、`mariadb://`、`maria://` | `mysql2` | 已支持 |
| SQLite | `sqlite://`、`sqlite3://`、`file://` | `sql.js` | 已支持本地 SQLite 文件 |
| SQL Server | `sqlserver://`、`mssql://`、`ms://` | `mssql` | 已支持 |

当前不支持：Redis、MongoDB、Oracle、ClickHouse、DuckDB、Snowflake、BigQuery、Elasticsearch，以及其他非 SQL 或尚未实现的数据源。

## 快速开始

```bash
pnpm install
pnpm run build
node packages/cli/dist/src/index.js drivers
```

使用数据库：

```bash
export OPSCALE_DSN='postgres://readonly_user:password@host:5432/database?sslmode=require'
node packages/cli/dist/src/index.js schema
node packages/cli/dist/src/index.js run --sql "select count(*) from users"
```

SQLite 本地示例见 [examples/sqlite-quickstart](./examples/sqlite-quickstart)。

## 包结构

- `packages/core`：SQL 只读保护、方言识别、schema introspection SQL 和驱动接口。
- `packages/drivers`：基于 `pg`、`mysql2`、`sql.js`、`mssql` 等 Node 包实现的数据库驱动。
- `packages/cli`：`opscale` 命令行入口。
- `skills/opscale`：给 Codex 使用的自然语言运营分析 Skill。

## 安全边界

- `OPSCALE_DSN` 应使用只读数据库账号。
- `opscale run` 只接受 `SELECT` 和 `WITH` 查询。
- Opscale 会给查询结果包一层行数限制。
- 收入状态、金额单位、软删除字段、首选时间字段等业务语义不应该写死在通用 core 里，应放在具体项目文档或 Skill references 中。

## 路线图

详见 [docs/ROADMAP.md](./docs/ROADMAP.md)。
