import { writeFileSync } from "node:fs";
import initSqlJs from "sql.js";

const filename = process.argv[2];
if (!filename) {
  console.error("Usage: node examples/sqlite-quickstart/create-db.mjs <output.db>");
  process.exit(1);
}

const SQL = await initSqlJs();
const db = new SQL.Database();

db.run(`
  create table orders (
    id integer primary key,
    status text not null,
    total_cents integer not null,
    created_at text not null
  );

  insert into orders (status, total_cents, created_at) values
    ('paid', 1200, '2026-05-01T10:00:00Z'),
    ('paid', 2500, '2026-05-02T11:00:00Z'),
    ('refunded', 900, '2026-05-03T12:00:00Z');
`);

writeFileSync(filename, db.export());
db.close();
