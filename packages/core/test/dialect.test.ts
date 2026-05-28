import assert from "node:assert/strict";
import test from "node:test";

import { detectDialect, getDialectAdapter } from "../src/index.js";

test("detectDialect maps common DSN schemes", () => {
  assert.equal(detectDialect("postgres://u:p@localhost/db"), "postgres");
  assert.equal(detectDialect("postgresql://u:p@localhost/db"), "postgres");
  assert.equal(detectDialect("mysql://u:p@localhost/db"), "mysql");
  assert.equal(detectDialect("mariadb://u:p@localhost/db"), "mysql");
  assert.equal(detectDialect("sqlite:///tmp/app.db"), "sqlite");
  assert.equal(detectDialect("file:///tmp/app.db"), "sqlite");
  assert.equal(detectDialect("sqlserver://u:p@localhost/db"), "sqlserver");
  assert.equal(detectDialect("mssql://u:p@localhost/db"), "sqlserver");
});

test("postgres adapter builds information_schema query", () => {
  const adapter = getDialectAdapter("postgres");
  const plan = adapter.schemaPlan({ schemas: ["public"], table: "orders" });

  assert.equal(plan.kind, "single");
  assert.match(plan.sql, /information_schema\.columns/);
  assert.match(plan.sql, /table_schema in \('public'\)/);
  assert.match(plan.sql, /table_name = 'orders'/);
});

test("mysql adapter builds information_schema query", () => {
  const adapter = getDialectAdapter("mysql");
  const plan = adapter.schemaPlan({ schemas: ["app"] });

  assert.equal(plan.kind, "single");
  assert.match(plan.sql, /information_schema\.columns/);
  assert.match(plan.sql, /table_schema in \('app'\)/);
});

test("mysql adapter defaults to current database", () => {
  const adapter = getDialectAdapter("mysql");
  const plan = adapter.schemaPlan({});

  assert.match(plan.sql, /table_schema = database\(\)/);
});

test("sqlite adapter describes one table with pragma", () => {
  const adapter = getDialectAdapter("sqlite");
  const plan = adapter.schemaPlan({ table: "orders" });

  assert.equal(plan.kind, "single");
  assert.match(plan.sql, /pragma_table_info\('orders'\)/);
});
