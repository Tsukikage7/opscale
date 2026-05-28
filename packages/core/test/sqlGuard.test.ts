import assert from "node:assert/strict";
import test from "node:test";

import { buildLimitedQuery, normalizeReadOnlySql } from "../src/index.js";

test("normalizeReadOnlySql accepts SELECT and strips one trailing semicolon", () => {
  assert.equal(
    normalizeReadOnlySql("  select id, email from users;  "),
    "select id, email from users",
  );
});

test("normalizeReadOnlySql accepts WITH queries", () => {
  assert.equal(
    normalizeReadOnlySql("with recent as (select * from orders) select count(*) from recent"),
    "with recent as (select * from orders) select count(*) from recent",
  );
});

test("normalizeReadOnlySql accepts formatted SELECT queries", () => {
  assert.equal(
    normalizeReadOnlySql("select\n  id\nfrom users"),
    "select\n  id\nfrom users",
  );
});

test("normalizeReadOnlySql rejects non-read-only statements", () => {
  for (const sql of [
    "update users set email = 'x'",
    "delete from orders",
    "insert into users(email) values('x')",
    "drop table users",
  ]) {
    assert.throws(() => normalizeReadOnlySql(sql), /Only SELECT and WITH/i);
  }
});

test("normalizeReadOnlySql rejects multiple statements", () => {
  assert.throws(() => normalizeReadOnlySql("select 1; select 2"), /Multiple SQL statements/i);
});

test("buildLimitedQuery wraps query with a caller-controlled limit", () => {
  assert.equal(
    buildLimitedQuery("select id from users order by id desc", 25),
    "select * from (select id from users order by id desc) as opscale_result limit 25",
  );
});
