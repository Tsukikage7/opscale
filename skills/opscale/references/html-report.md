# HTML Report

Use this reference when an Opscale result should be shared with product, operations, growth, finance, or leadership stakeholders.

## When to Create HTML

Create a standalone `.html` report when the user says the result is for product or operations, asks for a report, asks for something shareable, or asks for HTML.

If the user only asks a quick exploratory question, answer in chat first. Offer HTML only when it would materially help the handoff.

## Report Structure

Use this order:

1. title: business question and time range;
2. executive summary: three to five concise bullets;
3. metric cards: key totals, rates, deltas, and rankings;
4. visual analysis: one or two charts that match the question;
5. evidence table: compact supporting rows behind the chart;
6. intelligent analysis: what changed, possible drivers, confidence level, what needs attention, and next checks;
7. scope: filters, grouping, row count, timezone, and comparison period;
8. caveats: assumptions, missing definitions, and data limitations;
9. technical appendix: SQL and inspected tables.

Put SQL in a collapsed `<details>` block. Do not make non-technical readers see SQL before the business conclusion.

## Charts

Every stakeholder-facing HTML report should include charts when the query result has enough data points.

Choose chart types by intent:

| Intent | Preferred chart |
| --- | --- |
| trend over time | line chart, area chart, or bar chart |
| ranking | horizontal bar chart |
| funnel | step/funnel bars with conversion and drop-off rates |
| retention or cohort | cohort table or heatmap-style grid |
| composition | stacked bar only when categories are few and readable |
| anomaly | trend chart with highlighted spike/drop point |

Implementation rules:

- Prefer inline SVG or CSS-based charts so the report works without external network access.
- Do not depend on CDN scripts, remote fonts, or external chart libraries.
- A simple inline SVG line/bar chart is better than a complex chart that may not render.
- Add labels, units, and legends directly in the chart area.
- Always keep a table below or near the chart so exact values remain auditable.
- Highlight anomalies only when the data supports them; otherwise label the chart as descriptive.

## Intelligent Analysis

Include an analysis section that goes beyond restating the table:

- summarize the main movement and its magnitude;
- identify likely drivers based on available columns and query results;
- separate verified facts from hypotheses;
- call out anomalies, low-denominator risks, missing definitions, or proxy metrics;
- recommend the next one to three practical checks, such as splitting by channel, product, cohort, or status.

## Visual Style

- Build one self-contained HTML file with inline CSS.
- Keep the layout readable without external assets or network access.
- Use a restrained operations-dashboard style: clear hierarchy, compact metric cards, readable tables, and neutral colors.
- Do not use decorative gradients, oversized marketing hero sections, or stock-like imagery.
- Use responsive CSS so the report works on a laptop and phone.
- Add wrapping rules for long Chinese text, metric labels, URLs, and SQL-adjacent notes, such as `overflow-wrap: anywhere`, `line-break: anywhere`, and mobile `word-break: break-all` on headings, metadata, bullets, and callouts.
- On mobile, constrain the page container with viewport units such as `width: calc(100vw - 64px)` so wide tables or code blocks do not make the whole report overflow horizontally.
- Use semantic HTML: `header`, `main`, `section`, `table`, and `details`.

## Content Rules

- Use the user's language.
- Preserve exact numbers from query results.
- State the time range and timezone near the top.
- For rates, show numerator and denominator when available.
- For rankings, show volume beside rate so low-volume rows are not over-interpreted.
- Redact or aggregate sensitive user-level data unless the user explicitly asks for identifiable rows and the context is appropriate.
- Never include database DSNs, passwords, tokens, or raw credentials.

## File Naming

Write reports under a local output path that fits the current workspace, such as:

```text
reports/opscale-YYYY-MM-DD-topic.html
```

Use a short ASCII filename. Create the directory if it does not exist.
