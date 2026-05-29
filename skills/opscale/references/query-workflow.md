# Query Workflow

Use this reference for multi-table metrics, funnel/retention questions, revenue/refund calculations, cohort analysis, rankings, anomaly checks, or ambiguous business definitions.

## Schema First

Run `opscale schema` before drafting SQL unless the relevant schema was already inspected in the current turn. Use `opscale describe <table>` for likely fact tables, dimension tables, and join tables.

Live schema is the source of truth because operational databases drift. Do not rely on guessed table names, ORM conventions, or stale README examples when the CLI can inspect the database.

## Metric Plan

Before writing SQL, identify:

| Decision | Examples |
| --- | --- |
| Intent | trend, ranking, funnel, retention, cohort, anomaly, revenue, channel performance |
| Grain | daily, weekly, monthly, per user, per account, per product, per category, per channel |
| Population | all users, active users, paid orders, paid customers, first-time buyers, returning users |
| Time field | `created_at`, `paid_at`, `refunded_at`, `completed_at`, `cancelled_at`, `last_seen_at` |
| Status filter | `paid`, `completed`, `active`, excluding `cancelled`, `failed`, `test`, or `deleted` |
| Money unit | cents, yuan, dollars, minor currency unit |
| Timezone | UTC, local business timezone, database timezone |
| Exclusions | soft-deleted rows, test accounts, internal users |
| Join path | users to events, users to orders, orders to payments, orders to items, items to products, campaigns to users |
| Comparison | previous period, same weekday last week, same period last month, baseline average |

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
- Prefer one query per question, but split into multiple focused queries when different fact tables define different metrics.
- For ratios, return numerator and denominator as well as the percentage.
- For anomaly checks, compare current period against a reasonable baseline instead of reporting only one period.

## Execution Pattern

1. Inspect schema.
2. Describe likely tables.
3. Draft the read-only query.
4. Run through `opscale run --sql`.
5. Revise from errors and schema output if needed.
6. Summarize the result in business language.
7. Show scope, SQL, and assumptions.
8. If the result is for product or operations stakeholders, create a standalone HTML report with charts and smart analysis using `html-report.md`.

## Common Analysis Patterns

### Trend

Use for "how is it doing", "recently", "daily", "weekly", or "compare".

- Pick a stable time field.
- Group by date or week.
- Include previous-period comparison when the user asks whether it improved or worsened.
- Return both counts and monetary totals when revenue is involved.

### Ranking

Use for "top", "best", "worst", "which product/channel/category".

- Group by the requested dimension.
- Include volume and rate metrics together where possible.
- Avoid ranking by tiny denominators without showing the denominator.

### Funnel

Use for signup-to-activation, visit-to-payment, trial-to-paid, checkout-to-payment, renewal, or similar conversion paths.

- Identify each step and timestamp.
- Count users or accounts at each step.
- Return conversion rate and drop-off rate between steps.
- State whether the query is event-based, status-based, or inferred from timestamps.

### Retention and Cohorts

Use for "come back", "repeat", "retention", "churn", "cohort", or "inactive".

- Define cohort by first meaningful action, such as signup, activation, first order, or first payment.
- Define return action, such as login, session, order, payment, or renewal.
- Return cohort size and retained count, not only percentage.
- Keep the cohort window explicit.

### Exceptions

Use for refunds, cancellations, failed payments, fraud flags, support spikes, or abnormal drops.

- Compare current period against the previous period or recent baseline.
- Report absolute count, rate, and denominator.
- State if the schema only supports a proxy metric.

## Example

User request:

```text
Use Opscale to show revenue, paid orders, and refunds by day for the last 7 days.
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
