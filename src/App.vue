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
      <input type="checkbox" id="cb_multipleTable" v-model="multipleTable">
      <label for="cb_multipleTable">複数テーブルを空行で区切る</label>
      <hr>
      <label>テーブル名</label>
      <input v-model="tableName" v-bind:disabled="multipleTable || firstLineTableName">
      <input type="checkbox" id="cb_firstLineTableName" v-model="firstLineTableName">
      <label for="cb_firstLineTableName">1行目をテーブル名とする</label>
      <input
        type="checkbox"
        id="cb_firstLineTableNameComment"
        v-model="firstLineTableNameComment"
        v-bind:disabled="!firstLineTableName"
      >
      <label for="cb_firstLineTableNameComment">隣をコメントとする</label>
      <hr>
      <label>{{ textType }}</label>
      <br>
      <textarea
        v-model="text"
        v-on:keydown.prevent.tab="inputTab"
        style="width: 80%; height: 10em;"
        wrap="off"
        spellcheck="false"
      ></textarea>
    </div>
    <label>Query</label>
    <br>
    <textarea
      class="result"
      v-model="insertQuery"
      style="width: 80%; height: 10em;"
      wrap="off"
      spellcheck="false"
    ></textarea>
    <br>
    <div style="width:fit-content; margin:0px auto; background-color:#ccc; ">
      ※使い方
      <div style="width:fit-content; text-align:left; margin:0px auto;">
        ・インサート先のDBの種類を選ぶ
        <br>・テキストの種類を選ぶ
        <br>・テーブル名を入力する
        <br>・カラム+データが載ってるテキストを貼り付ける
        <br>・Queryに出てくる
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import OracleDB from "./classes/OracleDB";
import Mysql from "./classes/Mysql";
import SqlServer from "./classes/SqlServer";

export default Vue.extend({
  name: "app",
  data() {
    return {
      dbType: "MySQL",
      textType: "TSV",
      tableName: "",
      multipleTable: false,
      firstLineTableName: true,
      firstLineTableNameComment: true,
      text: ""
    };
  },
  // 算出プロパティ
  computed: {
    /** Queryのテキスト */
    insertQuery(): string {
      let table =
        this.textType === "TSV"
          ? this.combartTsvToTable(this.text)
          : this.textType === "CSV"
          ? this.combartCsvToTable(this.text)
          : [];

      if (this.multipleTable) {
        // 複数のテーブルに分け、それぞれをInsertクエリに変換
        return this.SliceMultipleTable(table)
          .map(tbl => this.combartTableToInsertQuery(tbl))
          .join("\n\n");
      } else {
        return this.combartTableToInsertQuery(table);
      }
    }
  },
  methods: {
    /** 2次元配列を空行で分ける */
    SliceMultipleTable(table: string[][]): string[][][] {
      let blankIndex = table.findIndex(
        row => row.length === 0 || row.every(col => col === "")
      );
      let tables: string[][][] = [];
      while (-1 < blankIndex) {
        if (0 < blankIndex) tables.push(table.slice(0, blankIndex));
        table = table.slice(blankIndex + 1);
        blankIndex = table.findIndex(
          row => row.length === 0 || row.every(col => col === "")
        );
      }
      tables.push(table.slice(0, table.length));
      return tables;
    },

    /** 2次元配列の内容からInsertクエリを作成 */
    combartTableToInsertQuery(table: string[][]): string {
      // 余計な空行を削除
      table = this.deleteBlankRowFromTable(table);
      if (table.length === 0) return "";

      // 末尾の空白を削除
      table = this.deleteTrailingBlankFromTable(table);

      // テーブル名/コメントを用意
      let tableName = this.tableName;
      let tableNameComment = "";
      if (this.firstLineTableName) {
        // 1行目がテーブル名なら、取得してセットしてデータテーブルから外す
        const fistLine = table[0].filter(col => col !== "");
        tableName = fistLine[0];
        if (this.firstLineTableNameComment && 1 < fistLine.length)
          tableNameComment = "-- " + fistLine[1];
        table = table.slice(1);
      }

      // カラム列に合わせて末尾に空白をセット
      const columnLength = table[0].length;
      table = table.map(row => this.resizeArray(row, columnLength, ""));

      // カラム列を用意
      const columns = table[0];
      table = table.slice(1);

      // データ行を用意
      const dataTable = table;
      table = [];

      // クエリを組み立てる
      let query = "";
      // コメント
      query += tableNameComment !== "" ? tableNameComment + "\n" : "";
      // Insertクエリ
      query +=
        this.dbType === "MySQL"
          ? Mysql.createInsertQuery(tableName, columns, dataTable)
          : this.dbType === "SQL Server"
          ? SqlServer.createInsertQuery(tableName, columns, dataTable)
          : this.dbType === "Oracle"
          ? OracleDB.createInsertQuery(tableName, columns, dataTable)
          : "";

      return query;
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
