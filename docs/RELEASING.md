# Releasing

Opscale publishes one npm package: `opscale`.

Internal SQL guardrails and database drivers live inside `packages/cli`; they are not published as separate npm packages.

## Prepare A Release

```bash
pnpm install
pnpm run verify
pnpm changeset version
git add .
git commit -m "chore: prepare release"
git push origin main
```

The GitHub Actions release workflow runs verification and publishes through Changesets.

## npm Access

Use the `NPM_TOKEN` repository secret only for CI publishing. Do not commit npm tokens, database DSNs, or generated `.npmrc` files.

If npm blocks package changes with a 2FA or MFA policy, complete the operation through npm's official registry with an OTP or use a granular automation token that is allowed by the package policy.

## Accidental Packages

If an internal package is accidentally published:

1. Deprecate it immediately with a message pointing users to `opscale`.
2. Unpublish it if npm policy allows.
3. Remove it from the workspace publishing surface before the next release.
