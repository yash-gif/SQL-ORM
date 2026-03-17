import type { ProcedureCall, ProcedureDefinition, Query } from "../types";
import { InsertBuilder } from "./InsertBuilder";
import { SelectBuilder } from "./SelectBuilder";
import { UpdateBuilder } from "./UpdateBuilder";
import { DeleteBuilder } from "./DeleteBuilder";
import { formatDataType } from "../common";

export class ProcedureBuilder {
  private insertBuilder = new InsertBuilder();
  private selectBuilder = new SelectBuilder();
  private updateBuilder = new UpdateBuilder();
  private deleteBuilder = new DeleteBuilder();

  public buildCallProcedureSQL(procedure: ProcedureCall): string {
    const { name, parameters = [] } = procedure;
    const formattedParams = parameters
      .map((param) => (typeof param === "string" ? `'${param}'` : String(param)))
      .join(", ");

    return `CALL ${name}(${formattedParams})`;
  }

  public buildCreateProcedureSQL(definition: ProcedureDefinition): string {
    const { name, parameters = [], body } = definition;

    const paramList = parameters
      .map((param) => `${param.name} ${formatDataType(param.dataType)}`)
      .join(", ");

    let sql = `CREATE OR REPLACE PROCEDURE ${name}(${paramList})`;

    const bodySQL = body.map((query) => this.queryToSQL(query)).join(";\n");
    sql += ` LANGUAGE plpgsql AS $$\nBEGIN\n${bodySQL};\nEND\n$$;`;

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
          return this.selectBuilder.buildSelectSQL(query.table, query.columns, query.conditions);
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
}
