export interface ThemeItemType {
  title: string;
  value: string;
}

export interface PaneType {
  key: string;
  title: string;
  closable: boolean;
  path: string;
}

export interface LayoutParamsType {
  activeKey: string;
  selectedKeys: string[];
  openKeys: string[];
  openKeysCopy: string[];
  panes: PaneType[];
  nowTime: string;
  timer: NodeJS.Timeout | null;
  themeList: ThemeItemType[];
  collapsed: boolean;
}
