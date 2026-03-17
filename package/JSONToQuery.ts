import { pool } from "./db/db";
import { TableBuilder } from "./builders/TableBuilder";
import { InsertBuilder } from "./builders/InsertBuilder";
import type {
  Conditions,
  DropTableDefinition,
  AlterTableDefinition,
  Query,
  TableDefinition,
  ProcedureCall,
  FunctionCall,
  ProcedureDefinition,
  FunctionDefinition,
} from "./types";
import { SelectBuilder } from "./builders/SelectBuilder";
import { UpdateBuilder } from "./builders/UpdateBuilder";
import { AlterBuilder } from "./builders/AlterBuilder";
import { DropBuilder } from "./builders/DropBuilder";
import { DeleteBuilder } from "./builders/DeleteBuilder";
import { ProcedureBuilder } from "./builders/ProcedureBuilder";
import { FunctionBuilder } from "./builders/FunctionBuilder";

export class JSONToQuery {
  private query: Query;
  private tableBuilder: TableBuilder;
  private insertBuilder: InsertBuilder;
  private selectBuilder: SelectBuilder;
  private updateBuilder: UpdateBuilder;
  private alterBuilder: AlterBuilder;
  private dropBuilder: DropBuilder;
  private deleteBuilder: DeleteBuilder;
  private procedureBuilder: ProcedureBuilder;
  private functionBuilder: FunctionBuilder;

  constructor(query: Query) {
    this.query = query;
    this.tableBuilder = new TableBuilder();
    this.insertBuilder = new InsertBuilder();
    this.selectBuilder = new SelectBuilder();
    this.updateBuilder = new UpdateBuilder();
    this.alterBuilder = new AlterBuilder();
    this.dropBuilder = new DropBuilder();
    this.deleteBuilder = new DeleteBuilder();
    this.procedureBuilder = new ProcedureBuilder();
    this.functionBuilder = new FunctionBuilder();
  }

  public async execute() {
    try {
      if (
        this.query.operation === "CREATE" &&
        this.query.createTable &&
        this.query.createTable.length > 0
      ) {
        return await this.createTables(this.query.createTable);
      }
      if (this.query.operation === "INSERT" && this.query.table && this.query.data) {
        return await this.insertIntoTable(this.query.table, this.query.data);
      }
      if (this.query.operation === "SELECT" && this.query.table) {
        return await this.selectFromTable(
          this.query.table,
          this.query.columns,
          this.query.conditions
        );
      }
      if (
        this.query.operation === "UPDATE" &&
        this.query.table &&
        this.query.data &&
        this.query.conditions
      ) {
        return await this.updateDataInTable(
          this.query.table,
          this.query.data,
          this.query.conditions
        );
      }
      if (this.query.operation === "ALTER" && this.query.alterTable) {
        return await this.alterTable(this.query.alterTable);
      }
      if (this.query.operation === "DELETE" && this.query.table) {
        return await this.deleteFromTable(this.query.table, this.query.conditions);
      }
      if (this.query.operation === "DROP" && this.query.dropTable) {
        return await this.dropTable(this.query.dropTable);
      }
      if (this.query.operation === "CALL_PROCEDURE" && this.query.procedure) {
        return await this.callProcedure(this.query.procedure);
      }
      if (this.query.operation === "CALL_FUNCTION" && this.query.function) {
        return await this.callFunction(this.query.function);
      }
      if (this.query.operation === "CREATE_PROCEDURE" && this.query.createProcedure) {
        return await this.createProcedure(this.query.createProcedure);
      }
      if (this.query.operation === "CREATE_FUNCTION" && this.query.createFunction) {
        return await this.createFunction(this.query.createFunction);
      }
    } catch (error: any) {
      throw new Error(error.message || "Database operation failed");
    }
  }

  private async createTables(createTable: TableDefinition[]) {
    const results = [];

    for (const tableDefinition of createTable) {
      const sql = this.tableBuilder.buildCreateTableSQL(tableDefinition);
      await pool.query(sql);
      results.push({ message: `Table '${tableDefinition.tableName}' created successfully` });
    }

    return results;
  }

  private async insertIntoTable(table: string, data: Record<string, any>[]) {
    const results = [];

    const sql = this.insertBuilder.buildInsertSQL(table, data);
    await pool.query(sql.query, sql.values);
    results.push({ message: `${data.length} record(s) inserted into '${table}' successfully` });

    return results;
  }

  private async selectFromTable(table: string, columns?: string[], conditions?: Conditions) {
    const results = [];
    const sql = this.selectBuilder.buildSelectSQL(table, columns, conditions);
    const result = await pool.query(sql);
    results.push(result.rows);

    return results;
  }

  private async updateDataInTable(
    table: string,
    data: Record<string, any>[],
    conditions: Conditions
  ) {
    const results = [];
    const sql = this.updateBuilder.buildUpdateSQL(table, data, conditions);
    await pool.query(sql);
    results.push({ message: `Records in '${table}' updated successfully` });
    return results;
  }

  private async alterTable(alterDefinition: AlterTableDefinition) {
    const results = [];
    const sql = this.alterBuilder.buildAlterSQL(alterDefinition);
    await pool.query(sql);
    results.push({ message: `Table '${alterDefinition.tableName}' altered successfully` });
    return results;
  }

  private async deleteFromTable(table: string, conditions?: Conditions) {
    const results = [];
    const sql = this.deleteBuilder.buildDeleteSQL(table, conditions);
    const result = await pool.query(sql);
    results.push({
      message: `${result.rowCount || 0} record(s) deleted from '${table}' successfully`,
    });
    return results;
  }

  private async dropTable(dropTable: DropTableDefinition) {
    const results: any[] = [];

    const sql = this.dropBuilder.buildDropTableSQL(dropTable);
    await pool.query(sql);
    dropTable.tables.forEach((table) => {
      results.push({ message: `Table '${table}' dropped successfully` });
    });
    return results;
  }

  private async callProcedure(procedureCall: ProcedureCall) {
    const results = [];

    try {
      const sql = this.procedureBuilder.buildCallProcedureSQL(procedureCall);
      await pool.query(sql);
      results.push({ message: `Procedure '${procedureCall.name}' executed successfully` });
    } catch (error) {
      throw new Error(`Failed to execute procedure '${procedureCall.name}': ${error}`);
    }

    return results;
  }

  private async createProcedure(procedureDefinition: ProcedureDefinition) {
    const results = [];

    const sql = this.procedureBuilder.buildCreateProcedureSQL(procedureDefinition);
    console.log(sql);
    await pool.query(sql);

    results.push({ message: `Procedure '${procedureDefinition.name}' created successfully` });

    return results;
  }

  private async callFunction(functionCall: FunctionCall) {
    const results = [];

    try {
      const sql = this.functionBuilder.buildCallFunctionSQL(functionCall);
      const result = await pool.query(sql);

      if (result.rows && result.rows.length > 0) {
        results.push(result.rows);
        results.push({ message: `Function '${functionCall.name}' executed successfully` });
      } else {
        results.push({
          message: `Function '${functionCall.name}' executed successfully (no results returned)`,
        });
      }
    } catch (error) {
      throw new Error(`Failed to execute function '${functionCall.name}': ${error}`);
    }

    return results;
  }

  private async createFunction(functionDefinition: FunctionDefinition) {
    const results = [];

    const sql = this.functionBuilder.buildCreateFunctionSQL(functionDefinition);
    await pool.query(sql);

    results.push({ message: `Function '${functionDefinition.name}' created successfully` });

    return results;
  }
}
