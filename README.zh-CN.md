# Opscale

[![npm version](https://img.shields.io/npm/v/opscale.svg)](https://www.npmjs.com/package/opscale)
[![CI](https://github.com/Tsukikage7/opscale/actions/workflows/ci.yml/badge.svg)](https://github.com/Tsukikage7/opscale/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node.js 22.13+](https://img.shields.io/badge/node-%3E%3D22.13-43853d.svg)](https://nodejs.org/)

中文 | [English](./README.md)

Opscale 是一个面向 AI Agent 的 CLI 和 Skill，用来从 SQL 数据库里回答运营数据问题。

它适合产品经理、运营和业务团队问这类问题：

```text
最近 7 天每天有多少付费订单？
上个月哪个地域的 VPS 卖得最好？
每个套餐的收入是多少？
退款最近有没有异常？
```

Opscale 会让 AI 先看真实数据库表结构，再通过本机 CLI 执行只读 SQL，最后把结果、SQL 和业务假设一起返回。

## 为什么用 Opscale？

- 面向 AI Agent：适配 Codex、Claude Code、Cursor 和兼容的 AI 工具。
- 先看真实 schema：AI 不靠猜表名和字段名回答问题。
- 凭证留在本机：通过 `opscale config init` 保存数据库配置，不需要把密码发给 AI。
- 只读保护：`opscale run` 只接受 `SELECT` 和 `WITH`。
- 一个 npm 包：只安装 `opscale`，数据库驱动已经内置。

## 快速开始

### 给 AI Agent

如果你是 AI 助手，帮用户安装 Opscale 时，用统一安装入口。

Codex：

```bash
npx opscale@latest install --agent codex
```

Claude Code / Cursor：

```bash
npx opscale@latest install --agent claude-code
npx opscale@latest install --agent cursor
```

然后让用户在本机终端配置数据库：

```bash
npx opscale@latest config init
```

不要要求用户把数据库账号密码粘贴到聊天里。

### 给用户自己使用

不想全局安装时，直接用：

```bash
npx opscale@latest install --agent codex
npx opscale@latest drivers
npx opscale@latest config init
npx opscale@latest schema
```

也可以全局安装：

```bash
npm install -g opscale
opscale install --agent codex
opscale drivers
opscale config init
opscale schema
```

## 配置数据库

请使用只读数据库账号。

```bash
npx opscale@latest config init
```

命令会在本机提示填写：

```text
Database DSN
Schemas
Max rows
Timeout ms
```

配置会保存到本机：

```text
~/.opscale/config.json
```

查看脱敏后的配置：

```bash
npx opscale@latest config show
```

确认可以读取表结构：

```bash
npx opscale@latest schema
```

高级用户也可以用环境变量，环境变量会覆盖本地配置：

```bash
export OPSCALE_DSN='postgres://readonly_user:password@host:5432/database?sslmode=require'
export OPSCALE_SCHEMAS='public'
export OPSCALE_MAX_ROWS='100'
export OPSCALE_TIMEOUT_MS='10000'
```

## 提问方式

直接让 AI 问一个明确的业务问题：

```text
使用 Opscale 看一下最近 7 天每天的已支付订单数和收入。
```

AI 应该按这个流程执行：

1. 确认指标、筛选条件和时间范围。
2. 查看数据库表结构。
3. 对可能要用的表执行 describe。
4. 通过 `opscale run` 执行只读 SQL。
5. 返回结果、SQL 和业务假设。

## 支持的数据库

| 数据库 | DSN scheme | 状态 |
| --- | --- | --- |
| PostgreSQL | `postgres://`、`postgresql://`、`pg://`、`pgsql://` | 已支持 |
| MySQL / MariaDB | `mysql://`、`mariadb://`、`maria://` | 已支持 |
| SQLite | `sqlite://`、`sqlite3://`、`file://` | 已支持本地文件 |
| SQL Server | `sqlserver://`、`mssql://`、`ms://` | 已支持 |

暂不支持 Redis、MongoDB、Oracle、ClickHouse、DuckDB、Snowflake、BigQuery、Elasticsearch。

## 常用命令

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

## 安全边界

- 使用只读数据库账号。
- 不要把生产 DSN、数据库密码、客户数据粘贴到聊天、Issue、截图或日志里。
- AI 生成的 SQL 在敏感数据环境里执行前要先看一眼。
- 金额单位、订单状态、软删除、时间字段等业务口径，没验证前都只是业务假设。
- Opscale 的 SQL 保护是防御层，不替代数据库权限控制。

## 开发

需要 Node.js 22.13+ 和 pnpm 11。

```bash
pnpm install
pnpm run verify
```

仓库结构：

- `skills/opscale`：唯一 Skill，按用户语言输出。
- `packages/cli`：唯一 npm 包。SQL 保护和数据库驱动作为内部模块放在这个包里。

发布说明和维护者流程见 [docs/RELEASING.md](./docs/RELEASING.md)。
