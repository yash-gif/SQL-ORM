export interface Query {
  operation:
    | "CREATE"
    | "INSERT"
    | "SELECT"
    | "UPDATE"
    | "DELETE"
    | "DROP"
    | "ALTER"
    | "CALL_PROCEDURE"
    | "CALL_FUNCTION"
    | "CREATE_PROCEDURE"
    | "CREATE_FUNCTION";
  createTable?: TableDefinition[];
  dropTable?: DropTableDefinition;
  alterTable?: AlterTableDefinition;
  table?: string;
  data?: Record<string, any>[];
  conditions?: Conditions;
  columns?: string[];
  procedure?: ProcedureCall;
  function?: FunctionCall;
  createProcedure?: ProcedureDefinition;
  createFunction?: FunctionDefinition;
}

export interface TableDefinition {
  tableName: string;
  ifNotExists?: boolean;
  columns: ColumnDefinition[];
  constraints?: TableConstraint[];
}

export interface Conditions {
  WHERE?: Record<string, string | number | boolean | null>;
  ORDER_BY?: { column: string; direction: "ASC" | "DESC" }[];
  LIMIT?: number;
  OFFSET?: number;
}

export interface ColumnDefinition {
  name: string;
  dataType: PostgreSQLDataType;
  constraints?: ColumnConstraint[];
}

export type PostgreSQLDataType =
  | "INTEGER"
  | "BIGINT"
  | "SERIAL"
  | "BIGSERIAL"
  | "TEXT"
  | "DATE"
  | "TIMESTAMP"
  | "BOOLEAN"
  | "UUID"
  | { type: "VARCHAR"; length: number }
  | { type: "DECIMAL"; precision: number; scale?: number };

export type ColumnConstraint =
  | "NOT NULL"
  | "UNIQUE"
  | "PRIMARY KEY"
  | { type: "DEFAULT"; value: string | number | boolean | null }
  | { type: "REFERENCES"; table: string; column: string; onDelete?: "CASCADE" | "SET NULL" };

export type TableConstraint =
  | { type: "PRIMARY KEY"; columns: string[] }
  | {
      type: "FOREIGN KEY";
      columns: string[];
      references: { table: string; columns: string[] };
      onDelete?: "CASCADE" | "SET NULL";
    }
  | { type: "UNIQUE"; columns: string[] };

export interface DropTableDefinition {
  tables: string[];
  ifExists?: boolean;
  cascade?: boolean;
}

export interface AlterTableDefinition {
  tableName: string;
  action: "ADD_COLUMN" | "DROP_COLUMN" | "RENAME_COLUMN" | "ALTER_COLUMN";
  columnName?: string;
  newColumnName?: string;
  columnDefinition?: ColumnDefinition;
}

export interface ProcedureCall {
  name: string;
  parameters?: (string | number | boolean | null)[];
}

export interface FunctionCall {
  name: string;
  parameters?: (string | number | boolean | null)[];
}

export interface ProcedureDefinition {
  name: string;
  parameters?: ProcedureParameter[];
  body: Query[];
  language?: "plpgsql" | "sql";
  replace?: boolean;
}

export interface FunctionDefinition {
  name: string;
  parameters?: FunctionParameter[];
  returnType: PostgreSQLDataType | "TABLE" | "VOID";
  body: Query[];
  language?: "plpgsql" | "sql";
  replace?: boolean;
}

export interface ProcedureParameter {
  name: string;
  dataType: PostgreSQLDataType;
  defaultValue?: string | number | boolean | null;
}

export interface FunctionParameter {
  name: string;
  dataType: PostgreSQLDataType;
  defaultValue?: string | number | boolean | null;
}
