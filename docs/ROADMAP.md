# Roadmap

This roadmap describes planned work only. Items are not supported until code,
tests, and documentation land in the repository.

## Current

- CLI for read-only SQL analytics.
- Schema introspection for supported SQL databases.
- Query execution through Node.js database packages.
- Supported execution targets: PostgreSQL, MySQL/MariaDB, SQLite, SQL Server.

## Next

- Docker-based integration tests for PostgreSQL and MySQL/MariaDB.
- Optional gated SQL Server integration tests.
- Public npm release workflow with Changesets.
- Stronger SQL validation with parser-backed read-only checks.
- Project-level semantic configuration for metrics, units, time fields, and soft deletes.

## AI Workflow

Opscale's current AI integration is repository-local Codex Skill guidance. A
future `opscale ask` workflow should be implemented only after these pieces are
designed and tested:

- LLM provider interface.
- Schema grounding.
- SQL generation prompt templates.
- SQL validation before execution.
- Query audit output.
- Result summarization.
- Semantic config support.

## Not Planned For The Core SQL Driver

- Redis and MongoDB as SQL drivers.
- Browser-only database connections.
- Write queries.
- Generic shell-based SQL client execution.
