<template>
  <svg :class="svgClass" :style="{ fill: iconColor }" aria-hidden="true" @click="handleClick">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IconProps {
  iconClass: string;
  color?: string;
  className?: string;
}

const props = withDefaults(defineProps<IconProps>(), {
  className: "",
});
const emit = defineEmits(["click"]);

const iconName = computed(() => {
  return `#icon-${props.iconClass}`;
});

const svgClass = computed(() => {
  return props.className ? `${props.className} icon-svg` : "icon-svg";
});

const iconColor = computed(() => {
  if (props.color) {
    return props.color;
  } else {
    return "";
  }
});

const handleClick = () => {
  emit("click");
};
</script>

<style lang="less" scoped>
.icon-svg {
  width: 100%;
  height: 100%;
  vertical-align: middle;
  fill: currentColor;
  overflow: hidden;

  &:focus {
    outline: none;
  }
}
</style>
