import type { Conditions } from "../types";

export class UpdateBuilder {
  public buildUpdateSQL(
    table: string,
    data: Record<string, any>[],
    conditions: Conditions
  ): string {
    if (!data || data.length === 0) {
      throw new Error("Data object cannot be empty");
    }

    const setClauses = data.map((row) =>
      Object.entries(row)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(", ")
    );

    let sql = `UPDATE ${table} SET ${setClauses}`;

    if (conditions.WHERE) {
      const whereClauses = Object.entries(conditions.WHERE)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(" AND ");
      sql += ` WHERE ${whereClauses}`;
    }

    return sql;
  }
}
