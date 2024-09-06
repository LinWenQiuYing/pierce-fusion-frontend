export interface paginationType {
  size: string;
  total: number;
  current: number;
  pageSize: number;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
  pageSizeOptions: string[];
  showTotal: (total: number, current: any) => string;
  onChange: (page: number, pageSize: number) => void;
  onShowSizeChange: (current: number, size: number) => void;
}
