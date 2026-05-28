import { buildLimitedQuery } from "../sqlGuard.js";
import type { DialectAdapter, DialectName } from "../types.js";
import { createInformationSchemaAdapter, informationSchemaQuery, quoteLiteral } from "./common.js";

const postgresAdapter = createInformationSchemaAdapter("postgres", ["public"]);
const sqlserverAdapter: DialectAdapter = {
  ...createInformationSchemaAdapter("sqlserver", ["dbo"]),
  wrapLimit(sql, maxRows) {
    const limit = Number.isFinite(maxRows) && maxRows > 0 ? Math.floor(maxRows) : 100;
    return `select top (${limit}) * from (${sql}) as opscale_result`;
  },
};

const mysqlAdapter: DialectAdapter = {
  name: "mysql",
  schemaPlan(input) {
    if (input.schemas && input.schemas.length > 0) {
      return {
        kind: "single",
        sql: informationSchemaQuery(input, []),
      };
    }

    const tableFilter = input.table ? `\n  and table_name = ${quoteLiteral(input.table)}` : "";
    return {
      kind: "single",
      sql: `select
  table_schema as schema_name,
  table_name as table_name,
  column_name as column_name,
  data_type as type,
  is_nullable as nullable
from information_schema.columns
where table_schema = database()${tableFilter}
order by table_schema, table_name, ordinal_position`,
    };
  },
  wrapLimit: buildLimitedQuery,
};

const sqliteAdapter: DialectAdapter = {
  name: "sqlite",
  schemaPlan(input) {
    if (input.table) {
      return {
        kind: "single",
        sql: `select
  'main' as schema_name,
  ${quoteLiteral(input.table)} as table_name,
  name as column_name,
  type as type,
  case when "notnull" = 1 then 'NO' else 'YES' end as nullable
from pragma_table_info(${quoteLiteral(input.table)})
order by cid`,
      };
    }

    return {
      kind: "single",
      sql: `select
  'main' as schema_name,
  m.name as table_name,
  p.name as column_name,
  p.type as type,
  case when p."notnull" = 1 then 'NO' else 'YES' end as nullable
from sqlite_master m
join pragma_table_info(m.name) p
where m.type in ('table', 'view')
  and m.name not like 'sqlite_%'
order by m.name, p.cid`,
    };
  },
  wrapLimit: buildLimitedQuery,
};

const unknownAdapter: DialectAdapter = {
  name: "unknown",
  schemaPlan() {
    throw new Error("Schema introspection is not supported for unknown DSN dialect");
  },
  wrapLimit: buildLimitedQuery,
};

export function detectDialect(dsn: string): DialectName {
  const scheme = dsn.split(":", 1)[0]?.toLowerCase();
  switch (scheme) {
    case "postgres":
    case "postgresql":
    case "pg":
    case "pgsql":
      return "postgres";
    case "mysql":
    case "mariadb":
    case "maria":
      return "mysql";
    case "sqlite":
    case "sqlite3":
    case "file":
      return "sqlite";
    case "sqlserver":
    case "mssql":
    case "ms":
      return "sqlserver";
    default:
      return "unknown";
  }
}

export function getDialectAdapter(dialect: DialectName): DialectAdapter {
  switch (dialect) {
    case "postgres":
      return postgresAdapter;
    case "mysql":
      return mysqlAdapter;
    case "sqlite":
      return sqliteAdapter;
    case "sqlserver":
      return sqlserverAdapter;
    case "unknown":
      return unknownAdapter;
  }
}
