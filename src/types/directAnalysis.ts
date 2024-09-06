import { PathDataType } from "@/types";
import { TablePaginationConfig } from "ant-design-vue/es/table/interface";

export interface GraphCascaderOptionType {
  label: string;
  value: string;
  id: string;
  blueprintId: string;
  children: GraphCascaderOptionType[];
}

export interface GraphOptionResType {
  graphChName: string;
  graphCnName: string;
  graphName: string;
  id: string;
  bluePrintId: string;
  graphBranchList: GraphOptionResType[];
}

export interface DirectAnalysisType {
  graphName: string[] | undefined;
  analysisObj: string | undefined;
  isDirect: number;
  analysisLevel: number;
  retryTaskNumber: number;
  pathData: PathDataType;
  options: GraphCascaderOptionType[];
  pagination: TablePaginationConfig;
  tableLoading: boolean;
  checkedList: string[];
  plainOptions: string[];
  checkShow: boolean;
}
