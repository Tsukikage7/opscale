import {
  buildLimitedQuery,
  detectDialect,
  getDialectAdapter,
  normalizeReadOnlySql,
  type DoctorResult,
  type DialectName,
  type QueryInput,
  type QueryResult,
  type SqlDriver,
} from "@opscale/core";
import { readFile } from "node:fs/promises";
import mssql from "mssql";
import mysql from "mysql2/promise";
import { Client as PgClient } from "pg";
import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";

interface PostgresField {
  name: string;
}

interface PostgresQueryResult {
  fields: PostgresField[];
  rows: Record<string, unknown>[];
  rowCount: number | null;
}

interface PostgresClient {
  query(sql: string): Promise<PostgresQueryResult>;
  end(): Promise<void>;
}

interface MysqlField {
  name: string;
}

interface MysqlConnection {
  query(sql: string): Promise<unknown>;
  end(): Promise<void>;
}

interface SqliteDatabase {
  exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>;
  close(): void;
}

interface SqlServerQueryResult {
  recordset?: Record<string, unknown>[];
  rowsAffected?: number[];
}

interface SqlServerPool {
  query(sql: string): Promise<SqlServerQueryResult>;
  close(): void | Promise<void>;
}

export interface DefaultSqlDriverOptions {
  postgresClientFactory?: (connectionString: string) => PostgresClient | Promise<PostgresClient>;
  mysqlConnectionFactory?: (uri: string) => MysqlConnection | Promise<MysqlConnection>;
  sqliteDatabaseFactory?: (filename: string) => SqliteDatabase | Promise<SqliteDatabase>;
  sqlServerPoolFactory?: (connectionString: string) => SqlServerPool | Promise<SqlServerPool>;
}

export class DefaultSqlDriver implements SqlDriver {
  readonly name = "node-packages";

  private readonly postgresClientFactory: (connectionString: string) => Promise<PostgresClient>;
  private readonly mysqlConnectionFactory: (uri: string) => Promise<MysqlConnection>;
  private readonly sqliteDatabaseFactory: (filename: string) => Promise<SqliteDatabase>;
  private readonly sqlServerPoolFactory: (connectionString: string) => Promise<SqlServerPool>;

  constructor(options: DefaultSqlDriverOptions = {}) {
    this.postgresClientFactory = async (connectionString) => {
      if (options.postgresClientFactory) {
        return options.postgresClientFactory(connectionString);
      }
      const client = new PgClient({ connectionString });
      await client.connect();
      return client;
    };
    this.mysqlConnectionFactory = async (uri) => {
      if (options.mysqlConnectionFactory) {
        return options.mysqlConnectionFactory(uri);
      }
      return mysql.createConnection(uri);
    };
    this.sqliteDatabaseFactory = async (filename) => {
      if (options.sqliteDatabaseFactory) {
        return options.sqliteDatabaseFactory(filename);
      }
      return createSqlJsDatabase(filename);
    };
    this.sqlServerPoolFactory = async (connectionString) => {
      if (options.sqlServerPoolFactory) {
        return options.sqlServerPoolFactory(connectionString);
      }
      return mssql.connect(connectionString);
    };
  }

  async doctor(): Promise<DoctorResult> {
    return {
      ok: true,
      driver: this.name,
      message: "Node database packages are available for PostgreSQL, MySQL, SQLite, and SQL Server",
    };
  }

  drivers(): { driver: string; dialects: string[]; packages: Record<string, string> } {
    return {
      driver: this.name,
      dialects: ["postgres", "mysql", "sqlite", "sqlserver"],
      packages: {
        postgres: "pg",
        mysql: "mysql2",
        sqlite: "sql.js",
        sqlserver: "mssql",
      },
    };
  }

  async query(input: QueryInput): Promise<QueryResult> {
    const normalized = normalizeReadOnlySql(input.sql);
    const dialect = detectDialect(input.dsn);
    const limited = limitQuery(dialect, normalized, input.maxRows);

    switch (dialect) {
      case "postgres":
        return this.queryPostgres(input.dsn, limited, input.timeoutMs);
      case "mysql":
        return this.queryMysql(input.dsn, limited, input.timeoutMs);
      case "sqlite":
        return this.querySqlite(input.dsn, limited);
      case "sqlserver":
        return this.querySqlServer(input.dsn, limited, input.timeoutMs);
      default:
        throw new Error("Default SQL driver currently supports PostgreSQL, MySQL, SQLite, and SQL Server");
    }
  }

  private async queryPostgres(dsn: string, sql: string, timeoutMs: number): Promise<QueryResult> {
    const started = Date.now();
    const client = await this.postgresClientFactory(dsn);
    try {
      const result = await withTimeout(client.query(sql), timeoutMs);
      return {
        columns: result.fields.map((field) => field.name),
        rows: result.rows,
        rowCount: result.rowCount ?? result.rows.length,
        durationMs: Date.now() - started,
        sql,
        driver: "pg",
      };
    } finally {
      await client.end();
    }
  }

  private async queryMysql(dsn: string, sql: string, timeoutMs: number): Promise<QueryResult> {
    const started = Date.now();
    const connection = await this.mysqlConnectionFactory(dsn);
    try {
      const result = await withTimeout(connection.query(sql), timeoutMs);
      const { rows, fields } = parseMysqlResult(result);
      return {
        columns: fields.map((field) => field.name),
        rows,
        rowCount: rows.length,
        durationMs: Date.now() - started,
        sql,
        driver: "mysql2",
      };
    } finally {
      await connection.end();
    }
  }

  private async querySqlite(dsn: string, sql: string): Promise<QueryResult> {
    const started = Date.now();
    const database = await this.sqliteDatabaseFactory(sqliteFilenameFromDsn(dsn));
    try {
      const result = database.exec(sql)[0] ?? { columns: [], values: [] };
      const rows = result.values.map((values) => rowFromValues(result.columns, values));
      return {
        columns: result.columns,
        rows,
        rowCount: rows.length,
        durationMs: Date.now() - started,
        sql,
        driver: "sql.js",
      };
    } finally {
      database.close();
    }
  }

  private async querySqlServer(dsn: string, sql: string, timeoutMs: number): Promise<QueryResult> {
    const started = Date.now();
    const pool = await this.sqlServerPoolFactory(dsn);
    try {
      const result = await withTimeout(pool.query(sql), timeoutMs);
      const rows = result.recordset ?? [];
      return {
        columns: inferColumns(rows),
        rows,
        rowCount: result.rowsAffected?.[0] ?? rows.length,
        durationMs: Date.now() - started,
        sql,
        driver: "mssql",
      };
    } finally {
      await pool.close();
    }
  }
}

async function createSqlJsDatabase(filename: string): Promise<SqliteDatabase> {
  const SQL = await initSqlJs();
  if (filename === ":memory:") {
    return new SQL.Database() as SqlJsDatabase;
  }
  return new SQL.Database(await readFile(filename)) as SqlJsDatabase;
}

function sqliteFilenameFromDsn(dsn: string): string {
  if (dsn === "sqlite::memory:" || dsn === "sqlite://:memory:" || dsn === "sqlite3://:memory:") {
    return ":memory:";
  }
  if (dsn.startsWith("file://")) {
    return decodeURIComponent(new URL(dsn).pathname);
  }
  for (const prefix of ["sqlite://", "sqlite3://"]) {
    if (dsn.startsWith(prefix)) {
      const filename = dsn.slice(prefix.length);
      return filename.startsWith("/") ? decodeURIComponent(filename) : decodeURIComponent(filename);
    }
  }
  throw new Error("SQLite DSN must start with sqlite://, sqlite3://, or file://");
}

function limitQuery(dialect: DialectName, sql: string, maxRows: number): string {
  if (dialect === "unknown") {
    return buildLimitedQuery(sql, maxRows);
  }
  return getDialectAdapter(dialect).wrapLimit(sql, maxRows);
}

function parseMysqlResult(value: unknown): { rows: Record<string, unknown>[]; fields: MysqlField[] } {
  if (!Array.isArray(value) || value.length < 2) {
    throw new Error("Unable to parse mysql2 query result");
  }

  const [rawRows, rawFields] = value as [unknown, unknown];
  if (!Array.isArray(rawRows) || !Array.isArray(rawFields)) {
    throw new Error("Unable to parse mysql2 query result");
  }

  const rows = rawRows.map((row) => {
    if (row === null || typeof row !== "object" || Array.isArray(row)) {
      throw new Error("MySQL row is not an object");
    }
    return row as Record<string, unknown>;
  });
  const fields = rawFields.map((field) => {
    if (field === null || typeof field !== "object" || Array.isArray(field) || !("name" in field)) {
      throw new Error("MySQL field is missing a name");
    }
    return { name: String((field as { name: unknown }).name) };
  });

  return { rows, fields };
}

function rowFromValues(columns: string[], values: unknown[]): Record<string, unknown> {
  return Object.fromEntries(columns.map((column, index) => [column, values[index]]));
}

function inferColumns(rows: Record<string, unknown>[]): string[] {
  const columns = new Set<string>();
  for (const row of rows) {
    for (const column of Object.keys(row)) {
      columns.add(column);
    }
  }
  return [...columns];
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return promise;
  }

  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`Query timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });
}
