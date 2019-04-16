export default class OracleDB {

    /** INSERT クエリを作る */
    static createInsertQuery(tableName: string, columns: string[], dataTable: string[][]): string {
        // 囲い文字で囲っとく
        tableName = this.encloseTableName(tableName);
        columns = this.encloseColumnName(columns);
        dataTable = this.encloseData(dataTable);

        // 一行だけなら INSERT INTO にしとく
        // DBLinkが有る場合、 INSERT ALL は使えないので INSERT INTO にしとく
        if (dataTable.length <= 1 || this.checkDbLink(tableName))
            return this.makeInsertQuery(tableName, columns, dataTable);

        return this.makeMultipleInsertQuery(tableName, columns, dataTable);
    }

    /** テーブル名を識別子にする
     * 
     * - 既に囲われてたら何もしない
     * - DBLinkがあるなら何もしない
     *     - ※A5SQLでクエリを投げる場合、DBLink指定の"@"が、変数の"@"と認識されて誤作動を起こす。
     *       下記設定で無効にすればいいが、テーブル名に小文字や予約語はあまりないので、囲まないようにしている。
     *       ・設定(P)→オプション(O)→タブ「SQL」→パラメータ利用モード
     */
    private static encloseTableName(tableName: string): string {
        if (this.checkDbLink(tableName)) return tableName;

        // ユーザー指定がある場合、テーブル名だけ囲うようにする
        const user_table = tableName.split('.');
        if (user_table.length === 2){
            if (/^".*"$/.test(user_table[1])) return tableName;
            return user_table[0] + '.' + '"' + user_table[1] + '"';
        }

        if (/^".*"$/.test(tableName)) return tableName;
        return '"' + tableName + '"';
    }

    /** カラム名を識別子にする
     * 
     * 予約語のカラム名対策。
     * 
     * - 既に囲われてたら何もしない
     */
    private static encloseColumnName(cols: string[]): string[] {
        return cols.map(col => {
            if (/^".*"$/.test(col)) return col;
            return '"' + col + '"';
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

    /** DBLinkが含まれているかチェック */
    private static checkDbLink(tableName: string): boolean {
        return /@/.test(tableName);
    }

    /** INSERT INTO クエリを作る
     * 
     * dataTableの行数分クエリを作成する。
     */
    private static makeInsertQuery(tableName: string, columns: string[], dataTable: string[][]): string {
        return dataTable
            .map(cols =>
                "INSERT INTO " +
                tableName +
                " (" +
                columns.join(",") +
                ")" +
                " VALUES (" +
                cols.join(",") +
                ");")
            .join("\n");
    }

    /** INSERT ALL クエリを作る */
    private static makeMultipleInsertQuery(tableName: string, columns: string[], dataTable: string[][]): string {
        let query = "";
        query += "INSERT ALL\n";
        query += dataTable
            .map(cols => "INTO " +
                tableName +
                " (" +
                columns.join(",") +
                ")" +
                " VALUES (" +
                cols.join(",") +
                ")")
            .join("\n");
        query += "\nSELECT * FROM DUAL;";
        return query;
    }
}