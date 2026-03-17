import type { PostgreSQLDataType, ColumnConstraint } from "./types";

export function formatDataType(dataType: PostgreSQLDataType): string {
  if (typeof dataType === "string") {
    return dataType;
  }

  if (dataType.type === "VARCHAR") {
    return `VARCHAR(${dataType.length})`;
  }

  if (dataType.type === "DECIMAL") {
    return dataType.scale
      ? `DECIMAL(${dataType.precision}, ${dataType.scale})`
      : `DECIMAL(${dataType.precision})`;
  }

  return "TEXT";
}

export function formatColumnConstraint(constraint: ColumnConstraint): string {
  if (typeof constraint === "string") {
    return constraint;
  }

  if (constraint.type === "DEFAULT") {
    if (typeof constraint.value === "string") {
      if (constraint.value.toUpperCase().includes("CURRENT_DATE")) {
        return `DEFAULT CURRENT_DATE`;
      } else {
        return `DEFAULT '${constraint.value}'`;
      }
    } else if (constraint.value === null) {
      return `DEFAULT NULL`;
    } else {
      return `DEFAULT ${constraint.value}`;
    }
  }

  if (constraint.type === "REFERENCES") {
    let ref = `REFERENCES ${constraint.table}(${constraint.column})`;
    if (constraint.onDelete) {
      ref += ` ON DELETE ${constraint.onDelete}`;
    }
    return ref;
  }

  return "";
}

export function formatConstraints(constraints: ColumnConstraint[]): string {
  return constraints
    .map((constraint) => formatColumnConstraint(constraint))
    .filter(Boolean)
    .join(" ");
}

export function formatSQLValue(value: any): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "string") {
    return `'${value.replaceAll("'", "''")}'`;
  }
  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }
  return `'${String(value).replaceAll("'", "''")}'`;
}
