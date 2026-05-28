# SQLite Quickstart

This example creates a local SQLite database file and queries it through the
Opscale CLI.

From the repository root:

```bash
pnpm install
pnpm run build
node examples/sqlite-quickstart/create-db.mjs /tmp/opscale-example.db
OPSCALE_DSN="file:///tmp/opscale-example.db" node packages/cli/dist/src/index.js schema
OPSCALE_DSN="file:///tmp/opscale-example.db" node packages/cli/dist/src/index.js run --sql "select status, count(*) as count from orders group by status"
```

Expected query result shape:

```json
{
  "columns": ["status", "count"],
  "rows": [
    { "status": "paid", "count": 2 },
    { "status": "refunded", "count": 1 }
  ],
  "driver": "sql.js"
}
```

The database file is local. No external SQL client is required.
