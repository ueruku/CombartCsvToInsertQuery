export default class Mysql {

    /** INSERT クエリを作る */
    static createInsertQuery(tableName: string, columns: string[], dataTable: string[][]): string {
        // 囲い文字で囲っとく
        tableName = this.encloseTableName(tableName);
        columns = this.encloseColumnName(columns);
        dataTable = this.encloseData(dataTable);

        return this.makeMultipleInsertQuery(tableName, columns, dataTable);
    }

    /** テーブル名を識別子にする
     * 
     * - 既に囲われてたら何もしない
     */
    private static encloseTableName(tableName: string): string {
        // スキーマも囲う
        return tableName.split('.').map(name =>
            (/^'.*'$/.test(name)) ? name : "'" + name + "'"
        ).join(".");
    }

    /** カラム名を識別子にする
     * 
     * 予約語のカラム名対策。
     * 
     * - 既に囲われてたら何もしない
     */
    private static encloseColumnName(cols: string[]): string[] {
        return cols.map(col => {
            if (/^'.*'$/.test(col)) return col;
            return "'" + col + "'";
        });
    }

    /** データを文字列にする
     * 
     * データを登録する際、データを文字列にしておけば
     * RDBMS側で適切にキャストしてくれる。
     * 
     * - NULL文字がある場合、NULLとする
     * - シングルクォートはエスケープする
     * - 既に囲われてたら何もしない
     */
    private static encloseData(dataTable: string[][]): string[][] {
        return dataTable.map(row => {
            return row.map(col => {
                if (["(NULL)​", "« NULL »"].some(nullstr => col === nullstr)) return "NULL";
                if (/^'.*'$/.test(col)) return col;
                return "'" + col.replace(/'/g, "''") + "'";
            });
        });
    }

    /** INSERT クエリを作る */
    private static makeMultipleInsertQuery(tableName: string, columns: string[], dataTable: string[][]): string {
        return "INSERT INTO " +
            tableName +
            " (" +
            columns.join(",") +
            ")" +
            "\nVALUES " +
            dataTable.map(cols => "(" + cols.join(",") + ")").join("\n    ,") +
            ";";
    }
}