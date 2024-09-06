<!-- 图谱管理 -->
<template>
  <div class="graph-manage">
    <GraphList v-if="!isCreateShow" ref="graphListRef" @isCreateShowChanged="isCreateShowChanged" />
    <create-graph v-if="isCreateShow" @isCreateShowChanged="isCreateShowChanged" />
  </div>
</template>
<script setup lang="ts">
import GraphList from "./graphList.vue";
import CreateGraph from "./createGraph.vue";
import { ref } from "vue";

const isCreateShow = ref(false);
const graphListRef = ref(null);

const isCreateShowChanged = (value, isSearch) => {
  isCreateShow.value = value;
  if (isSearch) {
    graphListRef.value.onReset();
  }
};
</script>
<style lang="less">
.graph-manage {
  height: 100%;

  .table-list-top-item {
    width: calc((100% - 96px) / 4);
  }
}
</style>
