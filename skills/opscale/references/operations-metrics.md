# Operations Metrics

Use this reference to translate broad product and operations questions into metric plans. It is intentionally domain-neutral. Do not assume table or column names; always map these concepts to the live schema first.

## Question Classifier

| User asks | Interpret as | First checks |
| --- | --- | --- |
| "How are we doing?" | business trend | revenue, paid orders, active users, refunds, cancellations |
| "What is selling or performing best?" | ranking | product, plan, category, content, offer, channel, campaign |
| "Where are users dropping off?" | funnel | signup, activation, checkout, payment, renewal, repeat action |
| "Are users coming back?" | retention | cohort, return action, repeat purchase, renewal, inactivity |
| "Is anything abnormal?" | exception | spikes or drops in refunds, failures, cancellations, risk, support signals |
| "Which channel works best?" | channel performance | source, campaign, medium, partner, paid vs organic, revenue, conversion |

## Core Metric Families

### Revenue

- gross revenue
- net revenue
- paid orders or paid transactions
- average order value
- refund amount
- refund rate
- failed-payment rate
- cancellation amount or rate

Always show the money unit when it can be inferred. If the unit is unclear, state the uncertainty.

### Users and Accounts

- new users or accounts
- active users
- activated users
- paid users
- first-time buyers
- returning or repeat users
- inactive or churned users

Define "active" from schema evidence. If multiple activity tables exist, state which action was used.

### Funnel and Conversion

- visit to signup
- signup to activation
- activation to first key action
- checkout to order
- order to payment
- trial to paid
- paid to renewal

Return counts at each step, conversion rate, and drop-off rate. If events are unavailable, use the closest status or timestamp proxy and label it as a proxy.

### Retention and Cohort

- signup cohort retention
- first-purchase cohort repeat rate
- renewal retention
- returning active users
- reactivation after inactivity

Return cohort size, retained count, retention rate, and cohort window. Avoid percentages without denominators.

### Product, Content, Offer, or Category Performance

- revenue by product, plan, content item, offer, or category
- paid users by item
- conversion by item
- refund rate by item
- repeat usage or repeat purchase by item

For rankings, include both volume and rate. Do not call a low-volume item "best" based only on a percentage.

### Channel and Campaign Performance

- users by channel or source
- orders by channel
- revenue by channel
- conversion by campaign
- refund or cancellation rate by channel

If attribution tables are missing, say so and use only directly available source fields.

### Risk and Exceptions

- refund spikes
- failed-payment spikes
- cancellation spikes
- fraud or risk flags
- support-related spikes
- unusually low conversion or retention

Compare against a previous period or baseline. Report absolute count, rate, denominator, and comparison period.

## Default Assumptions

Use these only when the user does not provide a stronger instruction and the project has no known convention.

| Topic | Default |
| --- | --- |
| "recently" | last 7 days |
| trend grain | daily |
| ranking limit | top 10 |
| comparison | immediately previous period of the same length |
| money | preserve database unit and state uncertainty |
| user privacy | aggregate by default |

## Output Standard

Answer in business language first:

1. conclusion and key numbers;
2. scope: time range, filters, grouping, row count;
3. evidence table or compact bullets;
4. SQL used;
5. assumptions, caveats, and missing definitions.

Do not lead with schema dumps, raw JSON, or SQL unless the user asks for them.
