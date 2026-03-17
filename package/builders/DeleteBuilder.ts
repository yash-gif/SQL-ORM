import type { Conditions } from "../types";

export class DeleteBuilder {
  public buildDeleteSQL(table: string, conditions?: Conditions): string {
    let sql = `DELETE FROM ${table}`;

    if (conditions && conditions.WHERE) {
      const whereClauses = Object.entries(conditions.WHERE)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(" AND ");
      sql += ` WHERE ${whereClauses}`;
    }

    return sql;
  }
}
