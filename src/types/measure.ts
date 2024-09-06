import type { TablePaginationConfig } from "ant-design-vue/es/table/interface";

export interface StatisticalStateType {
  record: MeasureListItemType;
  isListShow: true;
  isDetailShow: false;
  checkType: "add";
}

export interface MeasureListItemType {
  id: string;
  createPerson: string;
  createDate: string;
  desc: string;
  name: string;
  code: string;
  schemaId: string;
  schemaName: string;
  updateUser: string;
  updateDate: string;
  measureCode: string;
}

export interface MeasureFormType {
  name: string | undefined;
  schemaId: string | undefined;
  desc: string | undefined;
}

export interface MeasureRuleType {
  key: string;
}

export interface MeasureListStateType {
  record: MeasureListItemType | null;
  // table
  measureCode: string | undefined;
  measureName: string | undefined;
  createUser: string | undefined;
  schemaId: string | undefined;
  schemaMap: object;
  tableLoading: boolean;
  tableValue: MeasureListItemType[];
  graghMap: {};
  pagination: TablePaginationConfig;
  // show
  isCopyModalshow: boolean;
  // copyForm
  copyForm: MeasureFormType;
}

export interface MeasureEditStateType {
  spinning: boolean;
  schemaMap: {};
  infoForm: MeasureFormType;
  // 度量函数
  func: number;
  // 点边类型
  dimension: 1;
  featureOption: [];

  attrList: []; // 类型和属性保存的数组
  conditionList: []; // 条件/条件组数组
}
