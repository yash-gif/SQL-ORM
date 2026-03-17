import type {
  ColumnDefinition,
  TableConstraint,
  ColumnConstraint,
  TableDefinition,
} from "../types";
import { formatDataType, formatColumnConstraint } from "../common";

export class TableBuilder {
  public buildCreateTableSQL(tableDefinition: TableDefinition): string {
    const { tableName, ifNotExists, columns, constraints } = tableDefinition;

    let sql = `CREATE TABLE`;
    if (ifNotExists) {
      sql += ` IF NOT EXISTS`;
    }
    sql += ` ${tableName} (`;

    const columnDefinitions = columns.map((col) => this.buildColumnDefinition(col));
    const tableConstraints = constraints
      ? constraints.map((constraint) => this.buildTableConstraint(constraint))
      : [];

    const allDefinitions = [...columnDefinitions, ...tableConstraints];
    sql += allDefinitions.join(", ");
    sql += ")";
    return sql;
  }

  private buildColumnDefinition(column: ColumnDefinition): string {
    let definition = `${column.name} ${formatDataType(column.dataType)}`;

    if (column.constraints) {
      for (const constraint of column.constraints) {
        const constraintSQL = formatColumnConstraint(constraint);
        if (constraintSQL) {
          definition += ` ${constraintSQL}`;
        }
      }
    }

    return definition;
  }

  private buildTableConstraint(constraint: TableConstraint): string {
    if (constraint.type === "PRIMARY KEY") {
      return `PRIMARY KEY (${constraint.columns.join(", ")})`;
    }

    if (constraint.type === "FOREIGN KEY") {
      let fk = `FOREIGN KEY (${constraint.columns.join(", ")}) REFERENCES ${
        constraint.references.table
      }(${constraint.references.columns.join(", ")})`;
      if (constraint.onDelete) {
        fk += ` ON DELETE ${constraint.onDelete}`;
      }
      return fk;
    }

    if (constraint.type === "UNIQUE") {
      return `UNIQUE (${constraint.columns.join(", ")})`;
    }

    return "";
  }
}
