<!-- 蓝图管理 -->
<template>
  <div class="blueprint-manage">
    <BlueList
      v-if="!isDetailsShow"
      ref="listRef"
      @detailsChanged="detailsChanged"
      @isDetailsShowChanged="isDetailsShowChanged"
    />
    <Details
      v-if="isDetailsShow"
      :details="details"
      ref="detailsRef"
      :detailsType="detailsType"
      @isDetailsShowChanged="isDetailsShowChanged"
    />
  </div>
</template>
<script setup lang="ts">
import BlueList from "./blueList.vue";
import { nextTick, ref } from "vue";
// import Details from "./details";

const details = ref({});
const isDetailsShow = ref(false);
const detailsType = ref(undefined);
const listRef = ref(null);
const detailsRef = ref(null);

const isDetailsShowChanged = (value, type, isSearch) => {
  detailsType.value = type;
  isDetailsShow.value = value;
  if (value) {
    nextTick(() => {
      detailsRef.value.getDataBase();
    });
  }
  if (isSearch) {
    nextTick(() => {
      listRef.value.onReset();
    });
  }
};
const detailsChanged = (value) => {
  details.value = value;
};
</script>
<style lang="less">
.blueprint-manage {
  height: 100%;

  .table-list-top-item {
    width: calc((100% - 96px) / 4);
  }
}
</style>
