# opscale

Read-only operations analytics CLI and AI Skill installer for Opscale.

`opscale` is the only npm package. It installs the CLI, SQL guardrails, AI Skill installer, and Node.js database drivers in one package.

Use it when an AI agent needs to answer product, operations, revenue, funnel, retention, channel, or KPI questions from a SQL database without exposing credentials in chat.

AI agent skills are installed from the repository with the generic Skills installer:

```bash
opscale install
```

The install command installs the Skill, asks for a local read-only database DSN when needed, verifies drivers, and checks schema access.

Supported query drivers:

| Database | Node package |
| --- | --- |
| PostgreSQL | `pg` |
| MySQL / MariaDB | `mysql2` |
| SQLite | `sql.js` |
| SQL Server | `mssql` |

## Configuration

`opscale install` runs the recommended setup. Use these lower-level commands when you want to control each step:

```bash
opscale config init
opscale config show
opscale drivers
opscale schema
```

The config is saved to `~/.opscale/config.json` with file mode `0600`. Passwords
are redacted in `config show`.

Environment variables are also supported and override the saved config:

```bash
export OPSCALE_DSN='postgres://readonly_user:password@localhost:5432/app?sslmode=disable'
export OPSCALE_SCHEMAS='public'
export OPSCALE_MAX_ROWS='100'
export OPSCALE_TIMEOUT_MS='10000'
```

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

During development:

```bash
pnpm --filter opscale build
node packages/cli/dist/src/index.js schema
```

## Notes

- Use a read-only database account for `OPSCALE_DSN`.
- `opscale run` accepts only `SELECT` and `WITH` SQL.
- `opscale schema` uses dialect-specific introspection SQL.
- `opscale run` currently supports PostgreSQL, MySQL/MariaDB, SQLite, and SQL Server through Node packages.
- AI agents should answer with business results first, then scope, SQL, assumptions, and caveats.
