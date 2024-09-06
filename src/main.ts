import * as Icons from "@ant-design/icons-vue";
import IconSvg from "@components/IconSvg.vue"; // 调整路径以匹配您的项目结构
import "ant-design-vue/dist/antd.css";
import Particles from "particles.vue3";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import "virtual:svg-icons-register";
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/theme/index.less";
import router from "./router";
// 开始使用全局图标
const icons: any = Icons;

const app = createApp(App);
for (const i in icons) {
  // 循环注册组件
  app.component(i, icons[i]);
}
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate); // pinia数据持久化插件——防止刷新后数据丢失
app.use(IconSvg); // 注册全局组件
app.use(Particles).use(pinia).use(router);
app.mount("#app");
