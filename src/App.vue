<script setup lang="ts">
import { useUserStore } from "@store/user";
import { ConfigProvider } from "ant-design-vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { onMounted, ref } from "vue";

dayjs.locale("zhCN");

const locale = ref(zhCN);
const store = useUserStore();

onMounted(() => {
  initTheme();
});

const initTheme = () => {
  const theme = store.theme;
  store.setTheme(theme);
};
</script>

<template>
  <config-provider :locale="locale">
    <router-view />
  </config-provider>
</template>

<style scoped lang="less"></style>
