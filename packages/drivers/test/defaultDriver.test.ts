import assert from "node:assert/strict";
import test from "node:test";

import { DefaultSqlDriver } from "../src/index.js";

test("DefaultSqlDriver executes PostgreSQL queries through pg", async () => {
  const calls: Array<{ connectionString: string; sql: string }> = [];
  const driver = new DefaultSqlDriver({
    postgresClientFactory: (connectionString) => ({
      async query(sql) {
        calls.push({ connectionString, sql });
        return {
          fields: [{ name: "count" }],
          rows: [{ count: "3" }],
          rowCount: 1,
        };
      },
      async end() {},
    }),
  });

  const result = await driver.query({
    dsn: "postgres://user:pass@localhost/app",
    sql: "select count(*) as count from users",
    maxRows: 10,
    timeoutMs: 5000,
  });

  assert.deepEqual(calls, [
    {
      connectionString: "postgres://user:pass@localhost/app",
      sql: "select * from (select count(*) as count from users) as opscale_result limit 10",
    },
  ]);
  assert.deepEqual(result.columns, ["count"]);
  assert.deepEqual(result.rows, [{ count: "3" }]);
  assert.equal(result.rowCount, 1);
  assert.equal(result.driver, "pg");
});

test("DefaultSqlDriver executes MySQL queries through mysql2", async () => {
  const calls: Array<{ uri: string; sql: string }> = [];
  const driver = new DefaultSqlDriver({
    mysqlConnectionFactory: async (uri) => ({
      async query(sql) {
        calls.push({ uri, sql });
        return [[{ count: 3 }], [{ name: "count" }]];
      },
      async end() {},
    }),
  });

  const result = await driver.query({
    dsn: "mysql://user:pass@localhost/app",
    sql: "select count(*) as count from users",
    maxRows: 10,
    timeoutMs: 5000,
  });

  assert.deepEqual(calls, [
    {
      uri: "mysql://user:pass@localhost/app",
      sql: "select * from (select count(*) as count from users) as opscale_result limit 10",
    },
  ]);
  assert.deepEqual(result.columns, ["count"]);
  assert.deepEqual(result.rows, [{ count: 3 }]);
  assert.equal(result.rowCount, 1);
  assert.equal(result.driver, "mysql2");
});

test("DefaultSqlDriver executes SQLite queries through sql.js", async () => {
  const calls: Array<{ filename: string; sql: string }> = [];
  const driver = new DefaultSqlDriver({
    sqliteDatabaseFactory: (filename: string) => ({
      exec(sql: string) {
        calls.push({ filename, sql });
        return [
          {
            columns: ["count"],
            values: [[3]],
          },
        ];
      },
      close() {},
    }),
  });

  const result = await driver.query({
    dsn: "sqlite:///tmp/app.db",
    sql: "select count(*) as count from users",
    maxRows: 10,
    timeoutMs: 5000,
  });

  assert.deepEqual(calls, [
    {
      filename: "/tmp/app.db",
      sql: "select * from (select count(*) as count from users) as opscale_result limit 10",
    },
  ]);
  assert.deepEqual(result.columns, ["count"]);
  assert.deepEqual(result.rows, [{ count: 3 }]);
  assert.equal(result.rowCount, 1);
  assert.equal(result.driver, "sql.js");
});

test("DefaultSqlDriver executes SQL Server queries through mssql", async () => {
  const calls: Array<{ connectionString: string; sql: string }> = [];
  const driver = new DefaultSqlDriver({
    sqlServerPoolFactory: async (connectionString: string) => ({
      async query(sql: string) {
        calls.push({ connectionString, sql });
        return {
          recordset: [{ count: 3 }],
          rowsAffected: [1],
        };
      },
      close() {},
    }),
  });

  const result = await driver.query({
    dsn: "mssql://user:pass@localhost/app",
    sql: "select count(*) as count from users",
    maxRows: 10,
    timeoutMs: 5000,
  });

  assert.deepEqual(calls, [
    {
      connectionString: "mssql://user:pass@localhost/app",
      sql: "select top (10) * from (select count(*) as count from users) as opscale_result",
    },
  ]);
  assert.deepEqual(result.columns, ["count"]);
  assert.deepEqual(result.rows, [{ count: 3 }]);
  assert.equal(result.rowCount, 1);
  assert.equal(result.driver, "mssql");
});

test("DefaultSqlDriver rejects unsupported dialects with a clear message", async () => {
  const driver = new DefaultSqlDriver();

  await assert.rejects(
    () =>
      driver.query({
        dsn: "oracle://user:pass@localhost/app",
        sql: "select 1",
        maxRows: 10,
        timeoutMs: 5000,
      }),
    /Default SQL driver currently supports PostgreSQL, MySQL, SQLite, and SQL Server/,
  );
});

test("DefaultSqlDriver doctor reports installed Node database packages", async () => {
  const driver = new DefaultSqlDriver();

  assert.deepEqual(await driver.doctor(), {
    ok: true,
    driver: "node-packages",
    message: "Node database packages are available for PostgreSQL, MySQL, SQLite, and SQL Server",
  });
});
