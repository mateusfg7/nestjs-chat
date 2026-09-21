import { getTableColumns, sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

export function conflictUpdateAllExcept<T extends PgTable>(
  table: T,
  except: (keyof T["_"]["columns"])[]
) {
  return Object.fromEntries(
    Object.entries(getTableColumns(table))
      .filter(([k]) => !except.includes(k as keyof T["_"]["columns"]))
      .map(([k, col]) => [k, sql`excluded.${sql.identifier(col.name)}`])
  );
}
