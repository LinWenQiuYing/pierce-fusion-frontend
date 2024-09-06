<template>
  <div class="segmented-contain">
    <div class="segmented-contain-content">
      <div
        :class="['segmented-item', selected === item.value ? 'segmented-item-selected' : '']"
        v-for="item in options"
        :key="item.value"
        @click="handleClick(item.value as number)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { OptionType } from "@/types";
import { ref, toRefs } from "vue";

interface SegmentedProps {
  options: OptionType[];
}

const props = withDefaults(defineProps<SegmentedProps>(), {
  options: () => [],
});

const { options } = toRefs(props);

const emit = defineEmits<{
  (event: "selectItem", item: string | number): any;
}>();

const selected = ref(200);

const handleClick = (item: number) => {
  selected.value = item;
  emit("selectItem", item);
};
</script>

<style lang="less" scoped>
.segmented-contain {
  margin: 0;
  padding: 2px;
  font-size: 14px;
  border-radius: 6px;
  display: inline-block;
  box-sizing: border-box;
  background: #f5f5f5;
  color: rgba(0, 0, 0, 0.65);
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

  &-content {
    display: flex;
    align-items: center;

    .segmented-item {
      cursor: pointer;
      text-align: center;
      border-radius: 4px;
      transform: translateZ(0);
      transition: color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      padding: 0 12px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      &:hover {
        color: rgba(0, 0, 0, 0.88);
        background-color: rgba(0, 0, 0, 0.06);
      }

      // &:active {
      //   color: rgba(0, 0, 0, 0.88);
      //   background-color: rgba(0, 0, 0, 0.15);
      // }

      &::after {
        content: "";
        position: absolute;
        z-index: -1;
        width: 100%;
        height: 100%;
        top: 0;
        inset-inline-start: 0;
        border-radius: inherit;
        transition: background-color 0.2s;
        pointer-events: none;
      }

      &.segmented-item-selected {
        background-color: #fff;
        box-shadow:
          0 1px 2px 0 rgba(0, 0, 0, 0.03),
          0 1px 6px -1px rgba(0, 0, 0, 0.02),
          0 2px 4px 0 rgba(0, 0, 0, 0.02);
        color: rgba(0, 0, 0, 0.88);
      }
    }
  }
}
</style>
