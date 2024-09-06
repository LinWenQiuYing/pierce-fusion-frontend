export interface paginationType {
  size: string;
  total: number;
  current: number;
  pageSize: number;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
  pageSizeOptions: string[];
  showTotal: (total: number) => string;
  onChange: (page: number, pageSize: number) => void;
  onShowSizeChange: (current: number, size: number) => void;
}

export interface params {
  addName: string;
  baseName: string;
  type: number | undefined;
  ip: string;
  port: string;
  userName: string;
  password: string;
  url: string;
  notes: string;
  driver: string;
}

export interface listParams {
  id: string;
  name: string;
  desc: string;
  icon: string;
  date: string | null;
  account: string;
  driver: string;
  ip: string;
  password: string;
  port: string;
  type: number;
  url: string;
}

export interface itemDetail {
  id: string;
  dsAccount: string;
  dsDriver: string;
  dsIp: string;
  dsName: string;
  dsPassword: string;
  dsPort: string;
  dsType: number;
  dsUrl: string;
  notes: string;
  createDate: string | null;
  createUser: string | null;
  updateDate: string | null;
  updateUser: string | null;
}

export interface targetTypes {
  label: string | undefined;
  value: number | undefined;
  icon: string | undefined;
}
