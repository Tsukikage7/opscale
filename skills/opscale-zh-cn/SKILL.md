---
name: opscale-zh-cn
description: 当用户需要基于 PostgreSQL、MySQL/MariaDB、SQLite 或 SQL Server 做只读运营数据分析时使用，包括用户、订单、收入、资源、漏斗、留存、退款和内部指标。
---

# Opscale 中文 Skill

Opscale 是 SQL 数据库只读运营分析的标准入口。CLI 负责执行查询；本 Skill 负责约束 AI 如何查看 schema、生成安全 SQL、运行查询并解释结果。

## 什么时候使用

- 用户用自然语言询问 SQL 运营数据：用户、订单、订阅、收入、退款、资源、漏斗、留存、内部指标。
- 用户说出产品或项目名称，并询问运营数据、业务指标、数据库指标或内部报表。
- 不用于 Redis、MongoDB、Elasticsearch、纯日志分析、管理/写入操作或普通应用调试，除非用户明确要求用 Opscale 查看 SQL 数据。

## 前置条件

- `OPSCALE_DSN` 必须指向只读数据库账号。
- 支持的 DSN：`postgres://`、`postgresql://`、`pg://`、`pgsql://`、`mysql://`、`mariadb://`、`maria://`、`sqlite://`、`sqlite3://`、`file://`、`sqlserver://`、`mssql://`、`ms://`。
- 可选配置：`OPSCALE_SCHEMAS`、`OPSCALE_MAX_ROWS`、`OPSCALE_TIMEOUT_MS`。
- 如果缺少 `OPSCALE_DSN`，让用户在本地配置。不要要求用户把生产数据库凭据粘贴到对话里。

## 命令选择

优先使用已安装的 CLI：

```bash
opscale drivers
opscale schema
opscale describe <table>
opscale run --sql "<select query>"
```

如果没有全局安装 `opscale`，使用已发布的 npm 包：

```bash
npx opscale@latest drivers
npx opscale@latest schema
npx opscale@latest describe <table>
npx opscale@latest run --sql "<select query>"
```

如果两者都可用，优先使用 `opscale`。普通用户流程不要使用仓库内本地开发命令。

## 必须遵循的流程

1. 复述指标、过滤条件和时间范围。缺少条件时，只在用户明显期望默认值的情况下选择保守默认值，并说明假设。
2. 写 SQL 前先查看 schema，除非当前对话里已经查看过相关 schema。
3. 对可能参与 join 的表先使用 `opscale describe <table>`。
4. 生成只读 `SELECT` 或 `WITH` SQL，显式列名、聚焦过滤条件，并限制结果规模。
5. 通过 `opscale run --sql` 执行。不要绕过 Opscale 使用 `psql`、`mysql`、`sqlite3`、`redis-cli`、应用 ORM 脚本或直接驱动代码，除非用户明确要求。
6. 用用户的语言回答：先给结论，再给 SQL 和业务假设。

## 项目示例

用户应在 shell 或 secrets 管理器里配置只读 DSN：

```bash
export OPSCALE_DSN='postgres://readonly_user:password@host:5432/app_production?sslmode=require'
export OPSCALE_SCHEMAS='public'
export OPSCALE_MAX_ROWS='100'
```

然后可以这样问：

```text
使用 opscale skill 查一下最近 7 天每天的付费订单数和退款金额。
```

AI 必须先查看真实 schema，再通过 Opscale 执行只读 SQL。

## 失败处理

- 缺少 `OPSCALE_DSN`：说明需要的 DSN 格式，让用户本地配置。
- 不支持的 DSN：列出当前支持的数据库类型并停止。
- CLI 不可用：使用 `npx opscale@latest ...`，或让用户安装已发布包。
- schema 为空或范围过大：检查 `OPSCALE_SCHEMAS`，再按已知表名描述候选表。
- SQL 报错：根据错误和 schema 输出修正查询，不要猜测 schema 中不存在的列。
- 指标语义模糊：可先查看附近项目文档/代码；仍不清楚时，只问一个简短澄清问题。

## 输出格式

返回：

- 直接结论和关键数字。
- 时间范围、过滤条件和行数。
- 实际使用的 SQL。
- 假设或注意事项，尤其是金额单位、状态含义、软删除字段和时间字段选择。
- 只有在能明显提升可信度时，才建议下一步查询。

## 查询规则

- 以动态 schema introspection 作为表和列的事实来源。
- 使用显式列名，避免 `select *`。
- 默认先聚合，再列原始记录。
- 控制结果规模，加入明确过滤条件和时间范围。
- 金额单位、状态含义、首选时间字段应视为业务假设，除非已从 schema 或项目文档验证。
- 永远不要执行写操作。CLI 只接受 `SELECT` 和 `WITH`，但仍不要生成写 SQL。

多表指标、漏斗/留存问题、业务定义不清时，读取 `references/query-workflow.md`。
