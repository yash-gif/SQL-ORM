import type { DropTableDefinition } from "../types";

export class DropBuilder {
  public buildDropTableSQL(dropTable: DropTableDefinition): string {
    let sql = "DROP TABLE";
    console.log(dropTable);

    if (dropTable.ifExists) {
      sql += " IF EXISTS";
    }
    sql += ` ${dropTable.tables.join(", ")}`;
    if (dropTable.cascade) {
      sql += " CASCADE";
    } else {
      sql += " RESTRICT";
    }

    return sql;
  }
}
