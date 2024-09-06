<template>
  <div class="statistical-measure">
    <MeasureList
      v-if="isListShow"
      v-model:isListShow="isListShow"
      v-model:isDetailShow="isDetailShow"
      v-model:record="record"
      v-model:checkType="checkType"
    />

    <MeasureEdit
      v-if="isEditShow"
      key="measureEdit"
      :checkType="checkType"
      :record="record"
      v-model:isListShow="isListShow"
    />
  </div>
</template>

<script lang="ts" setup>
import { StatisticalStateType } from "@/types";
import { computed, reactive, toRefs } from "vue";
import MeasureEdit from "./measureEdit.vue";
import MeasureList from "./measureList.vue";

const state: StatisticalStateType = reactive({
  record: {},
  isListShow: true,
  isDetailShow: false,
  checkType: "add",
});

const { isListShow, isDetailShow, checkType, record } = toRefs(state);

const isEditShow = computed(() => {
  return !state.isListShow && !state.isDetailShow;
});
</script>

<style lang="less" scoped>
.statistical-measure {
  height: 100%;
  overflow: auto;
}
</style>
