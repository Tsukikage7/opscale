# opscale

Command-line interface for Opscale.

The CLI is intentionally thin. It parses user commands, loads configuration, delegates SQL guardrails and dialect decisions to `opscale-core`, and queries databases through `opscale-drivers`.

AI agent skills are installed from the repository with the generic Skills installer:

```bash
npx skills add Tsukikage7/opscale --skill opscale --agent codex --global --yes
npx skills add Tsukikage7/opscale --skill opscale-zh-cn --agent codex --global --yes
```

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
pnpm --filter opscale build
node packages/cli/dist/src/index.js schema
```

## Notes

- Use a read-only database account for `OPSCALE_DSN`.
- `opscale run` accepts only `SELECT` and `WITH` SQL.
- `opscale schema` uses dialect-specific introspection SQL.
- `opscale run` currently supports PostgreSQL, MySQL/MariaDB, SQLite, and SQL Server through Node packages.
