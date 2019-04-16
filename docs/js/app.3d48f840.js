(function(e){function t(t){for(var n,l,o=t[0],s=t[1],u=t[2],p=0,m=[];p<o.length;p++)l=o[p],a[l]&&m.push(a[l][0]),a[l]=0;for(n in s)Object.prototype.hasOwnProperty.call(s,n)&&(e[n]=s[n]);c&&c(t);while(m.length)m.shift()();return i.push.apply(i,u||[]),r()}function r(){for(var e,t=0;t<i.length;t++){for(var r=i[t],n=!0,o=1;o<r.length;o++){var s=r[o];0!==a[s]&&(n=!1)}n&&(i.splice(t--,1),e=l(l.s=r[0]))}return e}var n={},a={app:0},i=[];function l(t){if(n[t])return n[t].exports;var r=n[t]={i:t,l:!1,exports:{}};return e[t].call(r.exports,r,r.exports,l),r.l=!0,r.exports}l.m=e,l.c=n,l.d=function(e,t,r){l.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},l.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},l.t=function(e,t){if(1&t&&(e=l(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(l.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)l.d(r,n,function(t){return e[t]}.bind(null,n));return r},l.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return l.d(t,"a",t),t},l.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},l.p="";var o=window["webpackJsonp"]=window["webpackJsonp"]||[],s=o.push.bind(o);o.push=t,o=o.slice();for(var u=0;u<o.length;u++)t(o[u]);var c=s;i.push([0,"chunk-vendors"]),r()})({0:function(e,t,r){e.exports=r("cd49")},"034f":function(e,t,r){"use strict";var n=r("64a9"),a=r.n(n);a.a},"64a9":function(e,t,r){},cd49:function(e,t,r){"use strict";r.r(t);var n=r("2b0e"),a=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",{staticStyle:{width:"80%",margin:"0px auto"},attrs:{id:"app"}},[r("div",{staticStyle:{"text-align":"left","font-size":"2em",color:"gray"}},[e._v("CSV→InsertQuery")]),r("div",{staticClass:"input"},[r("label",[e._v("DBの種類")]),r("select",{directives:[{name:"model",rawName:"v-model",value:e.dbType,expression:"dbType"}],on:{change:function(t){var r=Array.prototype.filter.call(t.target.options,function(e){return e.selected}).map(function(e){var t="_value"in e?e._value:e.value;return t});e.dbType=t.target.multiple?r:r[0]}}},[r("option",[e._v("MySQL")]),r("option",[e._v("SQL Server")]),r("option",[e._v("Oracle")])]),r("label",[e._v("テキストの種類")]),r("select",{directives:[{name:"model",rawName:"v-model",value:e.textType,expression:"textType"}],on:{change:function(t){var r=Array.prototype.filter.call(t.target.options,function(e){return e.selected}).map(function(e){var t="_value"in e?e._value:e.value;return t});e.textType=t.target.multiple?r:r[0]}}},[r("option",[e._v("CSV")]),r("option",[e._v("TSV")])]),r("hr"),r("label",[e._v("テーブル名")]),r("input",{directives:[{name:"model",rawName:"v-model",value:e.tableName,expression:"tableName"}],attrs:{disabled:e.firstLineName},domProps:{value:e.tableName},on:{input:function(t){t.target.composing||(e.tableName=t.target.value)}}}),r("input",{directives:[{name:"model",rawName:"v-model",value:e.firstLineName,expression:"firstLineName"}],attrs:{type:"checkbox",id:"cb_firstLineName"},domProps:{checked:Array.isArray(e.firstLineName)?e._i(e.firstLineName,null)>-1:e.firstLineName},on:{change:function(t){var r=e.firstLineName,n=t.target,a=!!n.checked;if(Array.isArray(r)){var i=null,l=e._i(r,i);n.checked?l<0&&(e.firstLineName=r.concat([i])):l>-1&&(e.firstLineName=r.slice(0,l).concat(r.slice(l+1)))}else e.firstLineName=a}}}),r("label",{attrs:{for:"cb_firstLineName"}},[e._v("1行目をテーブル名とする")]),r("hr"),r("label",[e._v(e._s(e.textType))]),r("br"),r("textarea",{directives:[{name:"model",rawName:"v-model",value:e.text,expression:"text"}],staticStyle:{width:"80%",height:"10em"},attrs:{wrap:"off"},domProps:{value:e.text},on:{keydown:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"tab",9,t.key,"Tab")?null:(t.preventDefault(),e.inputTab(t))},input:function(t){t.target.composing||(e.text=t.target.value)}}})]),r("label",[e._v("Query")]),r("br"),r("textarea",{directives:[{name:"model",rawName:"v-model",value:e.insertQuery,expression:"insertQuery"}],staticClass:"result",staticStyle:{width:"80%",height:"10em"},attrs:{wrap:"off"},domProps:{value:e.insertQuery},on:{input:function(t){t.target.composing||(e.insertQuery=t.target.value)}}}),e._m(0)])},i=[function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("p",[e._v("\n    ※使い方\n    "),r("br"),e._v("インサート先のDBの種類を選ぶ\n    "),r("br"),e._v("テキストの種類を選ぶ\n    "),r("br"),e._v("テーブル名を入力する\n    "),r("br"),e._v("カラム+データが載ってるテキストを貼り付ける\n    "),r("br"),e._v("Queryに出てくる\n    "),r("br")])}],l=n["a"].extend({name:"app",data(){return{dbType:"MySQL",textType:"TSV",tableName:"",firstLineName:!1,text:""}},computed:{insertQuery(){let e=[];if("TSV"===this.textType&&(e=this.combartTsvToTable(this.text)),"CSV"===this.textType&&(e=this.combartCsvToTable(this.text)),e=this.deleteBlankRowFromTable(e),0===e.length)return"なし";e=this.deleteTrailingBlankFromTable(e);const t=this.firstLineName?e[1].length:e[0].length;e=e.map(e=>this.resizeArray(e,t,"")),this.firstLineName&&(this.tableName=e[0].filter(e=>""!==e)[0],e=e.slice(1));const r="MySQL"===this.dbType?this.tableName:"SQL Server"===this.dbType?"["+this.tableName+"]":"Oracle"===this.dbType?'"'+this.tableName+'"':this.tableName,n="MySQL"===this.dbType?this.encloseColumnName_Mysql(e[0]):"SQL Server"===this.dbType?this.encloseColumnName_SqlServer(e[0]):"Oracle"===this.dbType?this.encloseColumnName_Oracle(e[0]):[];e=e.slice(1);const a=this.encloseData(e);let i="";return["SQL Server","MySQL"].some(e=>e===this.dbType)&&(i="INSERT INTO "+r+" ("+n.join(",")+")\nVALUES "+a.map(e=>"("+e.join(",")+")").join("\n    ,")+";"),"Oracle"===this.dbType&&(a.length<=1?i+="INSERT ":i+="INSERT ALL\n",i+=a.map(e=>{let t="INTO "+r+" ("+n.join(",")+") VALUES ("+e.join(",")+")";return t}).join("\n"),a.length>1&&(i+="\nSELECT * FROM DUAL;")),i}},methods:{encloseColumnName_Mysql(e){return e.map(e=>"'"+e.replace(/'/g,"''")+"'")},encloseColumnName_SqlServer(e){return e.map(e=>"["+e+"]")},encloseColumnName_Oracle(e){return e.map(e=>'"'+e+'"')},encloseData(e){return e.map(e=>{return e.map(e=>{return"(NULL)​"===e?"NULL":"« NULL »"===e?"NULL":"'"+e.replace(/'/g,"''")+"'"})})},deleteBlankRowFromTable(e){return e.filter(e=>e.some(e=>""!==e))},deleteTrailingBlankFromTable(e){return e.map(e=>{const t=e.length-e.slice().reverse().findIndex(e=>""!==e);return e.length<t?[]:e.slice(0,t)})},combartCsvToTable(e){let t=[],r=[],n="",a=!1;const i=e.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S]/g)||[];for(let l=0;l<i.length;++l){let e=i[l];if(a)if('"'===e){let e=i[l+1];'"'===e?(n+='"',++l):a=!1}else n+=e;else'"'===e?a=!0:","===e?(r.push(n),n=""):"\n"===e?(r.push(n),n="",t.push(r),r=[]):n+=e}return""!==n&&(r.push(n),n="",t.push(r),r=[]),t},combartTsvToTable(e){return e.split("\n").map(e=>e.split("\t"))},resizeArray(e,t,r){const n=t-e.length;return 0===n?e:n<0?e.slice(0,t):e.concat(Array(n).fill(r))},inputTab(e){let t=e.target;const r=t.selectionStart;t.value=t.value.substr(0,r)+"\t"+t.value.substr(r,t.value.length),t.selectionEnd=r+1}}}),o=l,s=(r("034f"),r("2877")),u=Object(s["a"])(o,a,i,!1,null,null,null),c=u.exports;n["a"].config.productionTip=!1,new n["a"]({render:e=>e(c)}).$mount("#app")}});
//# sourceMappingURL=app.3d48f840.js.map