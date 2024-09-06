export interface StorageType {
  name: string;
  value: string;
  expires: number;
  startTime?: number; //记录何时将值存入缓存，毫秒级
}

export interface SourceType {
  key: string;
  isLeaf: boolean;
  title: string;
  children: SourceType[];
  resName: string;
  resCode: string;
}

export interface ResListItemType {
  id: string;
  resCode: string;
  resName: string;
  childResources: ResListItemType[];
}
