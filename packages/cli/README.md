# opscale

Command-line interface for Opscale.

`opscale` is the only npm package. It includes the CLI, SQL guardrails, and Node.js database drivers in one install.

AI agent skills are installed from the repository with the generic Skills installer:

```bash
opscale install --agent codex
```

Supported query drivers:

| Database | Node package |
| --- | --- |
| PostgreSQL | `pg` |
| MySQL / MariaDB | `mysql2` |
| SQLite | `sql.js` |
| SQL Server | `mssql` |

## Configuration

Recommended local setup:

```bash
opscale config init
opscale config show
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
opscale install --agent codex
opscale doctor
opscale drivers
opscale config init
opscale config show
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
