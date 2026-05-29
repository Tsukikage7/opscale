# Opscale

[![npm version](https://img.shields.io/npm/v/opscale.svg)](https://www.npmjs.com/package/opscale)
[![CI](https://github.com/Tsukikage7/opscale/actions/workflows/ci.yml/badge.svg)](https://github.com/Tsukikage7/opscale/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node.js 22.13+](https://img.shields.io/badge/node-%3E%3D22.13-43853d.svg)](https://nodejs.org/)

中文 | [English](./README.md)

Opscale 让产品和运营直接用自然语言查询业务数据。

AI 会先读取真实数据库结构，再通过本机 Opscale 执行只读 SQL，最后返回指标、SQL 和业务假设，方便复核。

你可以这样问：

```text
最近 7 天收入、付费订单和退款有什么变化？
这个月哪些商品、类目或渠道贡献了最多收入？
用户从注册到支付，主要流失在哪一步？
哪些用户 cohort 的留存或复购表现更好？
退款、取消、支付失败最近有没有异常升高？
```

## 为什么用 Opscale？

- 面向 AI Agent：适配 Codex、Claude Code、Cursor 和兼容 AI 工具。
- 先理解业务问题：把运营问题拆成指标、时间范围、筛选条件和分组。
- 先看真实 schema：AI 不靠猜表名和字段名回答问题。
- 凭证留在本机：通过 `opscale config init` 保存数据库配置，不需要把密码发给 AI。
- 默认只读：`opscale run` 只接受 `SELECT` 和 `WITH`。
- 一个 npm 包：只安装 `opscale`，SQL 驱动已经内置。

## 快速开始

你可以直接让 AI 助手执行，或者自己在终端运行：

```bash
npx opscale@latest install
```

Opscale 会：

1. 给当前 AI 工具安装 Skill；
2. 引导你在本机输入只读数据库 DSN；
3. 检查数据库驱动和 schema 访问；
4. 给出第一个可以问的问题。

数据库 DSN 只在本机终端里输入。不要把 DSN、密码、token 或生产数据库凭证粘贴到 AI 聊天里。

然后对 AI 说：

```text
使用 Opscale 看一下最近 7 天每天的收入、已支付订单数和退款金额。
```

### AI Skill 安装

Opscale 默认交给 Skills installer 自动识别当前 AI 工具。只有需要覆盖自动识别时，才使用 `--agent`：

| 用户工具 | 命令 |
| --- | --- |
| Codex | `npx opscale@latest install --agent codex` |
| Claude Code | `npx opscale@latest install --agent claude-code` |
| Cursor | `npx opscale@latest install --agent cursor` |

如果只想安装到当前项目：

```bash
npx opscale@latest install --project
```

### 手动分步安装

如果你想自己控制每一步，可以用底层命令：

```bash
npx opscale@latest install --skip-config
npx opscale@latest config init
npx opscale@latest drivers
npx opscale@latest schema
```

也可以全局安装：

```bash
npm install -g opscale
opscale install
```

## 可以问什么

Opscale 是通用运营查询工具，不绑定某一个业务领域。只要数据在 SQL 数据库里，AI 就应该先看真实 schema，再把业务概念映射到实际表和字段。

| 场景 | 示例问题 |
| --- | --- |
| 业务趋势 | 最近收入、付费订单、活跃用户、退款有什么变化？ |
| 产品或供给表现 | 哪些商品、计划、类目、内容、权益或报价贡献更高？ |
| 转化漏斗 | 用户从注册、激活、下单、支付到续费，主要流失在哪一步？ |
| 留存和复购 | 哪些 cohort 会回来、复购或变成沉默用户？ |
| 渠道表现 | 哪些渠道、活动、来源或合作方带来的用户和收入更好？ |
| 风险和异常 | 退款、取消、支付失败、风控标记、客服相关指标有没有突然升高？ |

## 配置数据库

`install` 命令会自动执行这一步。只有需要重新配置数据库时，才需要单独运行。

请使用只读数据库账号。生产数据场景下这是必须的。

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

## AI 应该怎么执行

直接让 AI 问一个明确的业务问题：

```text
使用 Opscale 看一下最近 7 天每天的已支付订单数和收入。
```

AI 应该按这个流程执行：

1. 先判断问题类型，例如趋势、漏斗、留存、cohort、排行或异常。
2. 确认指标、筛选条件、时间范围和分组。
3. 查看数据库表结构。
4. 对可能要用的事实表和维度表执行 describe。
5. 通过 `opscale run` 执行只读 SQL。
6. 先返回结论，再给证据、SQL、业务假设和限制。

如果结果要给产品、运营或管理者看，推荐让 AI 生成一个独立 HTML 报告：

```text
使用 Opscale 分析最近 7 天的收入、订单和退款，并生成一个给运营看的 HTML 报告。
```

HTML 报告应该把结论、核心指标卡、图表、趋势表、智能分析、口径和风险放在前面，把 SQL 放到折叠的技术附录里。

聊天内的快速回答可以用这个结构：

```text
结论
- 关键数字和变化
- 明显升高、下降或排名变化

口径
- 时间范围、筛选条件、分组、返回行数

SQL
- 实际执行的查询

假设和风险
- 金额单位、状态含义、时区、软删除、缺失口径
```

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

## 安全边界

- 使用只读数据库账号。
- 不要把生产 DSN、数据库密码、客户数据粘贴到聊天、Issue、截图或日志里。
- 在敏感或受监管数据环境里，执行 AI 生成的 SQL 前要先看一眼。
- 默认返回聚合结果。除非明确需要且上下文合适，不要暴露个人身份信息。
- 金额单位、状态含义、软删除、时间字段等业务口径，没验证前都只是业务假设。
- Opscale 的 SQL 保护是防御层，不替代数据库权限控制。

## 开发

需要 Node.js 22.13+ 和 pnpm 11。

```bash
pnpm install
pnpm run verify
```

仓库结构：

- `skills/opscale`：唯一 Skill，按用户语言输出。
- `skills/opscale/references`：产品和运营分析的通用工作流、指标参考和 HTML 报告规范。
- `packages/cli`：唯一 npm 包。SQL 保护和数据库驱动作为内部模块放在这个包里。

发布说明和维护者流程见 [docs/RELEASING.md](./docs/RELEASING.md)。
