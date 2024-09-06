import SvgIcon from "@components/IconSvg.vue";
import "virtual:svg-icons-register";
import { type App } from "vue";
/**
 * Svg图标插件
 */
export default {
  install: (app: App): void => {
    app.component("svg-icon", SvgIcon);
  },
};
