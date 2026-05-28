import { buildLimitedQuery } from "../sqlGuard.js";
import type { DialectAdapter, SchemaInput } from "../types.js";

export function quoteLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export function schemaList(schemas: string[] | undefined, fallback: string[]): string {
  const list = schemas && schemas.length > 0 ? schemas : fallback;
  return list.map(quoteLiteral).join(", ");
}

export function informationSchemaQuery(input: SchemaInput, fallbackSchemas: string[]): string {
  const schemaFilter = `table_schema in (${schemaList(input.schemas, fallbackSchemas)})`;
  const tableFilter = input.table ? `\n  and table_name = ${quoteLiteral(input.table)}` : "";

  return `select
  table_schema as schema_name,
  table_name as table_name,
  column_name as column_name,
  data_type as type,
  is_nullable as nullable
from information_schema.columns
where ${schemaFilter}${tableFilter}
order by table_schema, table_name, ordinal_position`;
}

export function createInformationSchemaAdapter(
  name: DialectAdapter["name"],
  fallbackSchemas: string[],
): DialectAdapter {
  return {
    name,
    schemaPlan(input) {
      return {
        kind: "single",
        sql: informationSchemaQuery(input, fallbackSchemas),
      };
    },
    wrapLimit: buildLimitedQuery,
  };
}
