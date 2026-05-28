export function normalizeReadOnlySql(sql: string): string {
  let query = sql.trim();
  if (!query) {
    throw new Error("SQL query is empty");
  }

  if (query.endsWith(";")) {
    query = query.slice(0, -1).trim();
  }

  if (query.includes(";")) {
    throw new Error("Multiple SQL statements are not allowed");
  }

  if (!/^(select|with)\b/i.test(query)) {
    throw new Error("Only SELECT and WITH queries are allowed");
  }

  return query;
}

export function buildLimitedQuery(sql: string, maxRows: number): string {
  const limit = Number.isFinite(maxRows) && maxRows > 0 ? Math.floor(maxRows) : 100;
  return `select * from (${sql}) as opscale_result limit ${limit}`;
}
