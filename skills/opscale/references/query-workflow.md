# Query Workflow

Use this reference for multi-table metrics, funnel/retention questions, revenue/refund calculations, cohort analysis, or ambiguous business definitions.

## Schema First

Run `opscale schema` before drafting SQL unless the relevant schema was already inspected in the current turn. Use `opscale describe <table>` for likely fact tables, dimension tables, and join tables.

Live schema is the source of truth because operational databases drift. Do not rely on guessed table names, ORM conventions, or stale README examples when the CLI can inspect the database.

## Metric Plan

Before writing SQL, identify:

| Decision | Examples |
| --- | --- |
| Grain | daily, weekly, per user, per account, per product, per category, per channel |
| Population | all users, active users, paid orders, paid customers, first-time buyers |
| Time field | `created_at`, `paid_at`, `refunded_at`, `completed_at` |
| Status filter | `paid`, `completed`, `active`, excluding `cancelled` |
| Money unit | cents, yuan, dollars, minor currency unit |
| Timezone | UTC, local business timezone, database timezone |
| Exclusions | soft-deleted rows, test accounts, internal users |
| Join path | users to orders, orders to payments, orders to items, items to products |

If a business definition is unclear, inspect project docs or code when available. Otherwise ask one concise clarification.

## Query Shape

- Prefer aggregation before raw-row listing.
- Use `WITH` CTEs for multi-step metrics.
- Select explicit columns and stable aliases.
- Add a time range for operational metrics.
- Add `order by` for time series and ranked outputs.
- Keep results small enough to fit in the answer.
- Avoid `select *`.
- Avoid vendor-specific SQL unless the detected dialect requires it.

## Execution Pattern

1. Inspect schema.
2. Describe likely tables.
3. Draft the read-only query.
4. Run through `opscale run --sql`.
5. Revise from errors and schema output if needed.
6. Summarize the result in business language.
7. Show SQL and assumptions.

## Example

User request:

```text
Use Opscale to show paid orders, revenue, and refunds by day for the last 7 days.
```

Expected behavior:

1. Confirm daily grain and last 7 days.
2. Inspect schema for order, payment, refund, user, and subscription tables.
3. Verify likely status, amount, and timestamp columns.
4. Run one or more read-only aggregate queries.
5. Explain the result, SQL, and assumptions.

## Safety Baseline

The intended setup is a read-only database role. The CLI uses Node database drivers, applies a read-only SQL guard, and wraps results with a limit.

Do not bypass the CLI with ad hoc database clients or direct application credentials unless the user explicitly asks for that.
