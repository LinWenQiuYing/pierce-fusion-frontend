import { themes } from "./model";

// 修改页面中的样式变量值
const changeStyle = (obj: Record<string, string>) => {
  for (const key in obj) {
    document.getElementsByTagName("body")[0].style.setProperty(`--${key}`, obj[key]);
  }
};
// 改变主题的方法
export const setTheme = (themeName: string) => {
  localStorage.setItem("theme", themeName); // 保存主题到本地，下次进入使用该主题
  const themeConfig: Record<string, string> = themes[themeName];
  // 如果有主题名称，那么则采用我们定义的主题
  if (themeConfig) {
    for (const key in themeConfig) {
      if (Object.hasOwnProperty.call(themeConfig, key)) {
        const element = themeConfig[key];
        localStorage.setItem(key, element); // 保存到本地
      }
    }
    changeStyle(themeConfig); // 改变样式
  } else {
    const themeConfig: Record<string, string> = {};
    for (const key in themes.light) {
      themeConfig[key] = localStorage.getItem(key) || "";
    }
    changeStyle(themeConfig);
  }
};
