import type { Conditions } from "../types";

export class SelectBuilder {
  public buildSelectSQL(table: string, columns?: string[], conditions?: Conditions): string {
    let sql = `SELECT ${columns && columns.length > 0 ? columns.join(", ") : "*"} FROM ${table}`;
    if (conditions) {
      if (conditions.WHERE) {
        const whereClauses = Object.entries(conditions.WHERE)
          .map(([key, value]) => `${key} = '${value}'`)
          .join(" AND ");
        sql += ` WHERE ${whereClauses}`;
      }
      if (conditions.ORDER_BY && conditions.ORDER_BY.length > 0) {
        const orderByClauses = conditions.ORDER_BY.map(
          ({ column, direction }) => `${column} ${direction}`
        ).join(", ");
        sql += ` ORDER BY ${orderByClauses}`;
      }

      if (conditions.LIMIT !== undefined) {
        sql += ` LIMIT ${conditions.LIMIT}`;
      }

      if (conditions.OFFSET !== undefined) {
        sql += ` OFFSET ${conditions.OFFSET}`;
      }
    }
    return sql;
  }
}
