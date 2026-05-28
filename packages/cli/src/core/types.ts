export type DialectName =
  | "postgres"
  | "mysql"
  | "sqlite"
  | "sqlserver"
  | "unknown";

export interface QueryInput {
  dsn: string;
  sql: string;
  maxRows: number;
  timeoutMs: number;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  durationMs: number;
  sql: string;
  driver: string;
}

export interface DoctorResult {
  ok: boolean;
  driver: string;
  message?: string;
}

export interface SchemaInput {
  schemas?: string[];
  table?: string;
}

export interface SchemaPlan {
  kind: "single";
  sql: string;
}

export interface DialectAdapter {
  name: DialectName;
  schemaPlan(input: SchemaInput): SchemaPlan;
  wrapLimit(sql: string, maxRows: number): string;
}

export interface SqlDriver {
  name: string;
  doctor(): Promise<DoctorResult>;
  query(input: QueryInput): Promise<QueryResult>;
}
