# Opscale 中文说明

[![CI](https://github.com/Tsukikage7/opscale/actions/workflows/ci.yml/badge.svg)](https://github.com/Tsukikage7/opscale/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node.js 22.13+](https://img.shields.io/badge/node-%3E%3D22.13-43853d.svg)](https://nodejs.org/)

Opscale 让产品经理、运营和业务团队可以直接问数据库里的运营问题，例如：

```text
最近 7 天每天有多少付费订单？
上个月每个套餐的收入是多少？
退款金额最近有没有异常？
新用户从注册到付费的转化率是多少？
```

你不需要让 AI 临时猜表结构、手写数据库连接脚本，Opscale 会要求 AI 先看真实 schema，再通过只读 SQL 查询，并把 SQL 和业务假设一起说明。

English README: [README.md](./README.md)

## 给 AI 的安装命令

如果你希望 AI 帮你安装，直接对 AI 说：

```text
帮我安装 Opscale。安装后，查运营数据时都通过 Opscale 的只读流程执行。
```

AI 应该执行：

```bash
npx skills add Tsukikage7/opscale --skill opscale --agent codex --global --yes
```

其他 AI 工具：

```bash
npx skills add Tsukikage7/opscale --skill opscale --agent claude-code --global --yes
npx skills add Tsukikage7/opscale --skill opscale --agent cursor --global --yes
```

如果只想安装到当前项目，去掉 `--global`。

Opscale 只有一个 Skill。用户用中文问，AI 就用中文回答；用户用英文问，AI 就用英文回答。

## 安装 CLI

Opscale Skill 会调用 `opscale` CLI 来查数据库。不想全局安装时，直接用：

```bash
npx opscale@latest drivers
npx opscale@latest config init
```

也可以全局安装：

```bash
npm install -g opscale
opscale drivers
opscale config init
```

## 连接数据库

请使用只读数据库账号。不要把生产数据库密码粘贴到聊天里。

推荐做法是让用户在自己的终端里运行：

```bash
npx opscale@latest config init
```

它会在本机提示你填写：

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

这个文件只在你的机器上。AI 不需要看到数据库密码。

你可以查看脱敏后的配置：

```bash
npx opscale@latest config show
```

然后让 AI 确认能看到数据库结构：

```bash
npx opscale@latest schema
```

高级用户也可以继续用环境变量，环境变量会覆盖本地配置：

```bash
export OPSCALE_DSN='postgres://readonly_user:password@host:5432/database?sslmode=require'
export OPSCALE_SCHEMAS='public'
export OPSCALE_MAX_ROWS='100'
export OPSCALE_TIMEOUT_MS='10000'
```

## 怎么使用

直接用自然语言问：

```text
使用 opscale skill 看一下最近 7 天每天的已支付订单数。
```

AI 会按这个流程执行：

1. 确认你要看的指标和时间范围。
2. 查看数据库表结构。
3. 生成只读 SQL。
4. 执行查询。
5. 返回结果、SQL 和可能的业务假设。

如果 AI 发现还没有配置数据库，它应该让你在本地运行：

```bash
npx opscale@latest config init
```

而不是让你把数据库账号密码发给 AI。

## 能查哪些数据库

| 数据库 | DSN scheme | 状态 |
| --- | --- | --- |
| PostgreSQL | `postgres://`、`postgresql://`、`pg://`、`pgsql://` | 已支持 |
| MySQL / MariaDB | `mysql://`、`mariadb://`、`maria://` | 已支持 |
| SQLite | `sqlite://`、`sqlite3://`、`file://` | 已支持本地文件 |
| SQL Server | `sqlserver://`、`mssql://`、`ms://` | 已支持 |

暂不支持 Redis、MongoDB、Oracle、ClickHouse、DuckDB、Snowflake、BigQuery、Elasticsearch。

## 安全边界

- 使用只读数据库账号。
- `opscale run` 只接受 `SELECT` 和 `WITH` 查询。
- 查询结果默认限制返回行数。
- 金额单位、订单状态、软删除、时间字段等业务口径，需要由你的项目文档或 AI 查询过程确认。

## 给开发者

需要 Node.js 22.13+ 和 pnpm 11。

```bash
pnpm install
pnpm run verify
```

仓库结构：

- `skills/opscale`：唯一 Skill，按用户语言输出。
- `packages/cli`：唯一 npm 包。SQL 保护和数据库驱动作为内部模块放在这个包里。

## 发布

本仓库使用 Changesets。`main` 分支通过 GitHub Actions 发布。维护者流程见 [docs/RELEASING.md](./docs/RELEASING.md)。

```bash
pnpm run verify
pnpm changeset version
git add .
git commit -m "chore: prepare release"
git push origin main
```

npm 发布由 GitHub Actions release workflow 执行，需要先在仓库 secrets 配置 `NPM_TOKEN`。
