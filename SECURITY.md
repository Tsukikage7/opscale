# Security Policy

Opscale is designed for read-only operational analytics. Treat every database
connection as sensitive.

## Supported Versions

Security fixes target the latest released version.

## Reporting a Vulnerability

If you find a vulnerability, do not open a public issue with exploit details.
Open a private security advisory on GitHub, or contact the maintainers through
the repository security contact once one is configured.

Please include:

- affected version or commit
- database dialect and DSN shape
- steps to reproduce
- impact
- suggested fix, if known

## Security Baseline

- Use read-only database accounts.
- Keep `OPSCALE_DSN` out of logs, screenshots, and issue reports.
- Avoid granting access to system schemas unless required.
- Use schema/table allowlists for sensitive production databases.
- Review AI-generated SQL before running it in privileged environments.

Opscale's SQL guard is a defense-in-depth layer, not a replacement for database
permissions.
