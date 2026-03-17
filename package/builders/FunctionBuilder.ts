import type { FunctionCall, FunctionDefinition, Query } from "../types";
import { InsertBuilder } from "./InsertBuilder";
import { SelectBuilder } from "./SelectBuilder";
import { UpdateBuilder } from "./UpdateBuilder";
import { DeleteBuilder } from "./DeleteBuilder";
import { formatDataType } from "../common";

export class FunctionBuilder {
  private insertBuilder = new InsertBuilder();
  private selectBuilder = new SelectBuilder();
  private updateBuilder = new UpdateBuilder();
  private deleteBuilder = new DeleteBuilder();

  public buildCallFunctionSQL(functionCall: FunctionCall): string {
    const { name, parameters = [] } = functionCall;
    const formattedParams = parameters
      .map((param) => (typeof param === "string" ? `'${param}'` : String(param)))
      .join(", ");

    return `SELECT * FROM ${name}(${formattedParams})`;
  }

  public buildCallScalarFunctionSQL(functionCall: FunctionCall): string {
    const { name, parameters = [] } = functionCall;
    const formattedParams = parameters
      .map((param) => (typeof param === "string" ? `'${param}'` : String(param)))
      .join(", ");

    return `SELECT ${name}(${formattedParams})`;
  }

  public buildCreateFunctionSQL(definition: FunctionDefinition): string {
    const { name, parameters = [], returnType, body } = definition;

    const paramList = parameters
      .map((param) => `${param.name} ${formatDataType(param.dataType)}`)
      .join(", ");

    let sql = `CREATE OR REPLACE FUNCTION ${name}(${paramList})`;

    if (returnType === "TABLE") {
      sql += ` RETURNS TABLE`;
    } else if (returnType === "VOID") {
      sql += ` RETURNS VOID`;
    } else {
      sql += ` RETURNS ${formatDataType(returnType)}`;
    }

    const bodySQL = body.map((query) => this.queryToSQL(query)).join(";\n");

    const isTableReturn = returnType === "TABLE";
    const isVoidReturn = returnType === "VOID";
    const isScalarReturn = returnType !== "TABLE" && returnType !== "VOID";

    if (isTableReturn) {
      sql += ` LANGUAGE plpgsql AS $$\nBEGIN\n`;
      if (bodySQL.trim().toUpperCase().startsWith("SELECT")) {
        sql += `RETURN QUERY ${bodySQL};\n`;
      } else {
        sql += `${bodySQL};\n`;
      }
      sql += `END\n$$;`;
    } else if (isVoidReturn) {
      sql += ` LANGUAGE plpgsql AS $$\nBEGIN\n${bodySQL};\nEND\n$$;`;
    } else {
      sql += ` LANGUAGE plpgsql AS $$\nBEGIN\n`;
      if (bodySQL.trim().toUpperCase().startsWith("SELECT")) {
        sql += `RETURN (${bodySQL});\n`;
      } else {
        sql += `${bodySQL};\n`;
      }
      sql += `END\n$$;`;
    }

    return sql;
  }

  private queryToSQL(query: Query): string {
    switch (query.operation) {
      case "INSERT":
        if (query.table && query.data) {
          const result = this.insertBuilder.buildInsertSQL(query.table, query.data);
          return result.values.reduce(
            (sql, value, i) => sql.replace(`$${i + 1}`, String(value)),
            result.query
          );
        }
        break;
      case "SELECT":
        if (query.table) {
          return this.buildSelectSQLForFunction(query.table, query.columns, query.conditions);
        }
        break;
      case "UPDATE":
        if (query.table && query.data && query.conditions) {
          return this.updateBuilder.buildUpdateSQL(query.table, query.data, query.conditions);
        }
        break;
      case "DELETE":
        if (query.table) {
          return this.deleteBuilder.buildDeleteSQL(query.table, query.conditions);
        }
        break;
    }
    return "";
  }

  private buildSelectSQLForFunction(table: string, columns?: string[], conditions?: any): string {
    let sql = `SELECT ${columns && columns.length > 0 ? columns.join(", ") : "*"} FROM ${table}`;
    if (conditions) {
      if (conditions.WHERE) {
        const whereClauses = Object.entries(conditions.WHERE)
          .map(([key, value]) => {
            if (typeof value === "string" && value.startsWith("p_")) {
              return `${key} = ${value}`;
            }
            return `${key} = '${value}'`;
          })
          .join(" AND ");
        sql += ` WHERE ${whereClauses}`;
      }
      if (conditions.ORDER_BY && conditions.ORDER_BY.length > 0) {
        const orderByClauses = conditions.ORDER_BY.map(
          ({ column, direction }: any) => `${column} ${direction}`
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
