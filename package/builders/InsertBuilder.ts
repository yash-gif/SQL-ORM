export class InsertBuilder {
  public buildInsertSQL(
    table: string,
    data: Record<string, any>[]
  ): { query: string; values: any[] } {
    if (!data || data.length === 0) {
      throw new Error("Data array cannot be empty");
    }

    const firstRow = data[0];
    if (!firstRow) {
      throw new Error("First row cannot be empty");
    }

    const columns = Object.keys(firstRow);
    const placeholders = data
      .map(
        (_, rowIndex) =>
          `(${columns
            .map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`)
            .join(", ")})`
      )
      .join(", ");

    const values = data.flatMap((row) => columns.map((col) => row[col]));
    const query = `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders}`;

    return { query, values };
  }
}
