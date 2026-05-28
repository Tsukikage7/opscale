# Query Workflow

## Dynamic Schema First

Use `opscale schema` to inspect available schemas, tables, and columns. Use `opscale describe <table>` when a table is likely relevant.

Dynamic schema is the default because operational databases change. Hard-coded table lists become stale quickly.

## Semantic Layer

Database metadata does not explain business semantics. When answering metrics, explicitly state assumptions for:

- money units, such as cents or dollars
- status inclusion, such as paid/completed/refunded
- time field, such as created time, paid time, or completed time
- soft deletion fields
- join paths between users, orders, resources, and payments

If the user asks for a precise business metric and the schema is ambiguous, inspect nearby project code or ask one concise clarification.

## Execution Pattern

1. Inspect schema.
2. Draft SQL.
3. Run through `opscale run --sql`.
4. Summarize the JSON result.
5. Show the SQL and any assumptions.

## Safety Baseline

The intended setup is a read-only database role. The CLI uses Node database drivers, applies a read-only SQL guard, and wraps results with a limit.

Do not bypass the CLI with `psql`, ad hoc database clients, or direct application credentials unless the user explicitly asks for that.
