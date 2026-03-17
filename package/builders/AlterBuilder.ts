import type { AlterTableDefinition } from "../types";
import { formatDataType, formatConstraints } from "../common";

export class AlterBuilder {
  public buildAlterSQL(alterDefinition: AlterTableDefinition): string {
    const { tableName, action, columnName, newColumnName, columnDefinition } = alterDefinition;

    let sql = `ALTER TABLE ${tableName}`;

    switch (action) {
      case "ADD_COLUMN":
        if (!columnDefinition) throw new Error("Column definition required for ADD_COLUMN");
        const dataType = formatDataType(columnDefinition.dataType);
        const constraintParts = formatConstraints(columnDefinition.constraints || []);
        sql += ` ADD COLUMN ${columnDefinition.name} ${dataType}${
          constraintParts ? ` ${constraintParts}` : ""
        }`;
        break;

      case "DROP_COLUMN":
        if (!columnName) throw new Error("Column name required for DROP_COLUMN");
        sql += ` DROP COLUMN ${columnName}`;
        break;

      case "RENAME_COLUMN":
        if (!columnName || !newColumnName)
          throw new Error("Both old and new column names required for RENAME_COLUMN");
        sql += ` RENAME COLUMN ${columnName} TO ${newColumnName}`;
        break;

      case "ALTER_COLUMN":
        if (!columnName || !columnDefinition)
          throw new Error("Column name and definition required for ALTER_COLUMN");
        const newDataType = formatDataType(columnDefinition.dataType);
        sql += ` ALTER COLUMN ${columnName} TYPE ${newDataType}`;
        break;

      default:
        throw new Error(`Unsupported ALTER action: ${action}`);
    }
    console.log(sql);
    return sql;
  }
}
