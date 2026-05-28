# Query Workflow

Use this reference for multi-table metrics, funnel/retention questions, revenue/refund calculations, or ambiguous business definitions.

## Dynamic Schema First

Use `opscale schema` to inspect available schemas, tables, and columns. Use `opscale describe <table>` for every likely fact table and join table before writing the final SQL.

Dynamic schema is the source of truth because operational databases change. Do not rely on guessed table names, ORM conventions, or stale docs when the CLI can inspect the live schema.

## Semantic Layer

Database metadata does not explain business semantics. When answering metrics, explicitly state assumptions for:

- money units, such as cents or dollars
- status inclusion, such as paid/completed/refunded
- time field, such as created time, paid time, or completed time
- soft deletion fields
- join paths between users, orders, resources, and payments

If the user asks for a precise business metric and the schema is ambiguous, inspect nearby project code or ask one concise clarification.

## Metric Planning

Before writing SQL, identify:

| Decision | Examples |
| --- | --- |
| Grain | daily, weekly, per account, per plan |
| Population | all users, active users, paid orders, completed resources |
| Time field | `created_at`, `paid_at`, `refunded_at`, `completed_at` |
| Status filter | `paid`, `completed`, `active`, excluding `cancelled` |
| Money unit | cents, yuan, dollars, minor currency unit |
| Exclusions | soft-deleted rows, test accounts, internal users |

If the user says "recently" and no project convention exists, use the last 7 days and state the assumption.

## Execution Pattern

1. Run `opscale schema`.
2. Run `opscale describe <table>` for likely tables.
3. Draft SQL with explicit selected columns and aliases.
4. Use `WITH` CTEs for multi-step metrics instead of deeply nested expressions.
5. Run through `opscale run --sql`.
6. If the query fails, revise from the error and schema output.
7. Summarize the JSON result.
8. Show the SQL and assumptions.

## Query Shape

- Prefer aggregation before raw-row listing.
- Add a clear time range for operational metrics.
- Add `order by` for time series or ranked outputs.
- Keep results small enough to fit in the answer.
- Avoid `select *`.
- Avoid vendor-specific SQL unless the detected dialect requires it.

## Example Prompt

```text
Use the opscale skill to show paid orders, GMV, and refund amount by day for the last 7 days.
```

Expected behavior:

1. Confirm the requested grain is daily and the assumed range is the last 7 days.
2. Inspect schema for order, payment, refund, user, and subscription tables.
3. Verify likely status, amount, and timestamp columns.
4. Run one or more read-only aggregate queries.
5. Explain the result, SQL, and assumptions.

## Safety Baseline

The intended setup is a read-only database role. The CLI uses Node database drivers, applies a read-only SQL guard, and wraps results with a limit.

Do not bypass the CLI with `psql`, ad hoc database clients, or direct application credentials unless the user explicitly asks for that.
