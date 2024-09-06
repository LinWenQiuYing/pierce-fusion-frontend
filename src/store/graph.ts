import { defineStore } from "pinia";

interface GraphState {
  firstNode: object;
  searchVertex: object[];
  branchId?: string;
  blueprintId?: string;
  graphId: string;
  schemaId: string;
  graphSource: number;
  searchNames: string[];
  sentence: string;
  layoutKey: string;
  graphFields: object;
}

export const useGraphStore = defineStore("graph", {
  state: (): GraphState => ({
    firstNode: JSON.parse(sessionStorage.getItem("firstNode") || "{}"),
    searchVertex: JSON.parse(sessionStorage.getItem("searchVertex") || "[]"),
    // branchId: sessionStorage.getItem("branchId") || undefined, // branchId为原业务中的branchId，与kg有关--------已弃用
    // blueprintId: sessionStorage.getItem("blueprintId") || undefined, // blueprintId为图的蓝图id--------已弃用
    graphId: sessionStorage.getItem("graphId") || "", // graphId为图的自身id
    schemaId: sessionStorage.getItem("schemaId") || "", // schemaId为图的蓝图id
    graphSource: parseFloat(sessionStorage.getItem("graphSource") || "1"), // graphSource为图的来源, 0:kg, 1:本地
    searchNames: [], // 图谱探索搜索的对象名称集合
    sentence: "",
    layoutKey: "breadthfirst",
    graphFields: {}, // 图谱的点边及对应属性
  }),
  actions: {
    setFirstNode(firstNode: object) {
      this.firstNode = firstNode;
    },
    setSearchVertex(searchVertex: object[]) {
      this.searchVertex = searchVertex;
    },
    // setBranchId(branchId: string) {
    //   this.branchId = branchId;
    // },
    setGraphId(graphId: string) {
      this.graphId = graphId;
    },
    // setBlueprintId(blueprintId: string) {
    //   this.blueprintId = blueprintId;
    // },
    setSchemaId(schemaId: string) {
      this.schemaId = schemaId;
    },
    setGraphSource(graphSource: number) {
      this.graphSource = graphSource;
    },
    setSearchNames(searchNames: string[]) {
      this.searchNames = searchNames;
    },
    setSentence(sentence: string) {
      this.sentence = sentence;
    },
    setLayoutKey(layoutKey: string) {
      this.layoutKey = layoutKey;
    },
    setGraphFields(graphFields: object) {
      this.graphFields = graphFields;
    },
  },
  getters: {},
});
