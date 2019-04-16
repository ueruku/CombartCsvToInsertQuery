<template>
  <div id="app" style="width: 80%; margin: 0px auto;">
    <div style="text-align: left; font-size: 2em; color: gray;">CSV→InsertQuery</div>
    <div class="input">
      <label>DBの種類</label>
      <select v-model="dbType">
        <option>MySQL</option>
        <option>SQL Server</option>
        <option>Oracle</option>
      </select>
      <label>テキストの種類</label>
      <select v-model="textType">
        <option>CSV</option>
        <option>TSV</option>
      </select>
      <hr>
      <label>テーブル名</label>
      <input v-model="tableName" v-bind:disabled="firstLineName">
      <input type="checkbox" id="cb_firstLineName" v-model="firstLineName">
      <label for="cb_firstLineName">1行目をテーブル名とする</label>
      <hr>
      <label>{{ textType }}</label>
      <br>
      <textarea
        v-model="text"
        v-on:keydown.prevent.tab="inputTab"
        style="width: 80%; height: 10em;"
        wrap="off"
      ></textarea>
    </div>
    <label>Query</label>
    <br>
    <textarea class="result" v-model="insertQuery" style="width: 80%; height: 10em;" wrap="off"></textarea>
    <p>
      ※使い方
      <br>インサート先のDBの種類を選ぶ
      <br>テキストの種類を選ぶ
      <br>テーブル名を入力する
      <br>カラム+データが載ってるテキストを貼り付ける
      <br>Queryに出てくる
      <br>
    </p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "app",
  data() {
    return {
      dbType: "MySQL",
      textType: "TSV",
      tableName: "",
      firstLineName: false,
      text: ""
    };
  },
  // 算出プロパティ
  computed: {
    /** ボックスのスタイル */
    insertQuery(): string {
      let table: string[][] = [];
      if (this.textType === "TSV") table = this.combartTsvToTable(this.text);
      if (this.textType === "CSV") table = this.combartCsvToTable(this.text);

      // 余計な空行を削除
      table = this.deleteBlankRowFromTable(table);
      if (table.length === 0) return "なし";

      // 末尾の空白を削除
      table = this.deleteTrailingBlankFromTable(table);

      // カラム列に合わせて末尾に空白をセット
      const columnLength = this.firstLineName
        ? table[1].length
        : table[0].length;
      table = table.map(row => this.resizeArray(row, columnLength, ""));

      if (this.firstLineName) {
        // 1行目がテーブル名なら、取得してセットしてデータテーブルから外す
        this.tableName = table[0].filter(col => col !== "")[0];
        table = table.slice(1);
      }

      // テーブル名を用意
      const tableName =
        this.dbType === "MySQL"
          ? this.tableName
          : this.dbType === "SQL Server"
          ? "[" + this.tableName + "]"
          : this.dbType === "Oracle"
          ? '"' + this.tableName + '"'
          : this.tableName;

      // カラム列を用意
      const columns =
        this.dbType === "MySQL"
          ? this.encloseColumnName_Mysql(table[0])
          : this.dbType === "SQL Server"
          ? this.encloseColumnName_SqlServer(table[0])
          : this.dbType === "Oracle"
          ? this.encloseColumnName_Oracle(table[0])
          : [];

      table = table.slice(1);

      // データ列を用意
      const dataTable = this.encloseData(table);

      // クエリを組み立てる
      let query = "";
      if (["SQL Server", "MySQL"].some(dBType => dBType === this.dbType)) {
        query =
          "INSERT INTO " +
          tableName +
          " (" +
          columns.join(",") +
          ")" +
          "\nVALUES " +
          dataTable.map(cols => "(" + cols.join(",") + ")").join("\n    ,") +
          ";";
      }
      if (this.dbType === "Oracle") {
        if (dataTable.length <= 1) {
          query += "INSERT ";
        } else {
          query += "INSERT ALL\n";
        }

        query += dataTable
          .map(cols => {
            let intoQuery =
              "INTO " +
              tableName +
              " (" +
              columns.join(",") +
              ")" +
              " VALUES (" +
              cols.join(",") +
              ")";
            return intoQuery;
          })
          .join("\n");

        if (dataTable.length > 1) {
          query += "\nSELECT * FROM DUAL;";
        }
      }

      return query;
    }
  },
  methods: {
    /** カラム名を文字として扱うよう囲う(MySQL) */
    encloseColumnName_Mysql(cols: string[]): string[] {
      return cols.map(col => "'" + col.replace(/'/g, "''") + "'");
    },
    /** カラム名を文字として扱うよう囲う(SQL Server) */
    encloseColumnName_SqlServer(cols: string[]): string[] {
      return cols.map(col => "[" + col + "]");
    },
    /** カラム名を文字として扱うよう囲う(Oracle) */
    encloseColumnName_Oracle(cols: string[]): string[] {
      return cols.map(col => '"' + col + '"');
    },

    /** 2次元配列から空行を削除 */
    encloseData(table: string[][]): string[][] {
      return table.map(row => {
        return row.map(col => {
          if (col === "(NULL)​") return "NULL";
          if (col === "« NULL »") return "NULL";

          return "'" + col.replace(/'/g, "''") + "'";
        });
      });
    },

    /** 2次元配列から空行を削除 */
    deleteBlankRowFromTable(table: string[][]): string[][] {
      return table.filter(row => row.some(col => col !== ""));
    },

    /** 2次元配列から末尾が空文字の項を削除 */
    deleteTrailingBlankFromTable(table: string[][]): string[][] {
      return table.map(row => {
        const index =
          row.length -
          row
            .slice()
            .reverse()
            .findIndex(col => col !== "");
        if (row.length < index) return [];
        return row.slice(0, index);
      });
    },

    /** CSV→2次元配列 */
    combartCsvToTable(text: string): string[][] {
      let csvRows: string[][] = [];
      let csvRow: string[] = [];

      // 項目の文字列をくみ上げる(一時変数)
      let value = "";

      // 「"」内フラグ
      let isContent = false;

      // 1文字づつ進める
      const textArr =
        text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S]/g) || [];
      for (let i = 0; i < textArr.length; ++i) {
        let char1 = textArr[i];

        if (isContent) {
          // 「"」内
          if (char1 === '"') {
            // 「"」が来たら2文字目を見る
            let char2 = textArr[i + 1];
            if (char2 === '"') {
              // 「""」ならエスケープされた「"」なので、「"」をセットする
              value += '"';
              // 2文字目は対応をしたので飛ばす
              ++i;
            } else {
              isContent = false;
            }
          } else {
            value += char1;
          }
          continue;
        }

        // 「"」外
        if (char1 === '"') {
          isContent = true;
        } else if (char1 === ",") {
          csvRow.push(value);
          value = "";
        } else if (char1 === "\n") {
          // 改行が来たら改行する
          csvRow.push(value);
          value = "";
          csvRows.push(csvRow);
          csvRow = [];
        } else {
          value += char1;
        }
      }

      if (value !== "") {
        // valueが有るならセット
        csvRow.push(value);
        value = "";
        csvRows.push(csvRow);
        csvRow = [];
      }

      return csvRows;
    },
    /** TSV→2次元配列 */
    combartTsvToTable(tsv: string): string[][] {
      return tsv.split("\n").map(row => row.split("\t"));
    },

    /** 配列の長さを変える
     *
     * - 元の配列より長くする：末尾に初期値を埋めて長くする
     * - 短くする：末尾を切り落とす
     * - 同じサイズ：何もしない
     * lengthにマイナスを入れるとUB。
     */
    resizeArray(arr: any[], length: number, initValue: any): any[] {
      const len = length - arr.length;
      if (len === 0) return arr;
      if (len < 0) return arr.slice(0, length);
      return arr.concat(Array(len).fill(initValue));
    },

    /** タブ入力をさせる */
    inputTab(event: any) {
      let obj = event.target;

      // 現在のカーソルの位置を取得
      const cursorPosition = obj.selectionStart;

      // カーソル位置にタブ挿入
      obj.value =
        obj.value.substr(0, cursorPosition) +
        "\t" +
        obj.value.substr(cursorPosition, obj.value.length);

      // カーソルを進める
      obj.selectionEnd = cursorPosition + 1;
    }
  }
});
</script>

<style>
#app {
  font-family: "Lato", "Noto Sans JP", "游ゴシック Medium", "游ゴシック体",
    "Yu Gothic Medium", YuGothic, "ヒラギノ角ゴ ProN",
    "Hiragino Kaku Gothic ProN", "メイリオ", Meiryo, "ＭＳ Ｐゴシック",
    "MS PGothic", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
