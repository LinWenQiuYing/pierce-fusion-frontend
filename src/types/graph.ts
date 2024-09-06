export interface GraphOptionType {
  label: string;
  value: string;
  branchId: string;
  schemaId: string;
  graphSource: number;
}

export interface GraphItemType {
  id: string;
  graphChName: string;
  branchId: string;
  schemaId: string;
  source: number;
}

export interface DirectAnalysisPostType {
  vertexIds: string[];
  minStep: number;
  maxStep: number;
  taskNums: number;
  graphName: string;
  types: string;
  isDirected: boolean;
  edgeLabelList: string[];
}
