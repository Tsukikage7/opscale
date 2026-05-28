# Contributing

Thanks for helping improve Opscale.

## Development

```bash
pnpm install
pnpm run build
pnpm run typecheck
pnpm test
```

Use Node.js 22.13 or newer and pnpm 11.

## Change Guidelines

- Keep behavior small and explicit.
- Prefer focused driver implementations over generic shell execution.
- Do not add database support unless it has tests and README coverage.
- Keep SQL safety behavior conservative. If a query can mutate data, reject it.
- Do not commit credentials, database dumps, or production DSNs.

## Tests

Runtime changes should include focused tests:

- `packages/cli/test/core` for SQL guard and dialect behavior.
- `packages/cli/test/drivers` for database driver behavior.
- `packages/cli/test` for configuration and CLI behavior.

Run the full verification before opening a PR:

```bash
pnpm run verify
```

## Pull Requests

Describe:

- what changed
- why it changed
- what commands were used to verify it
- any unsupported or intentionally deferred behavior
