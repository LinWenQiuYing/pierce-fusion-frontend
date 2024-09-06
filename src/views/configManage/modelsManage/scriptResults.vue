<template>
  <div class="script-results">
    <div class="script-results-item" v-for="(item, index) in dataList.list" :key="index">
      <div class="item-top">
        <span class="item-top-text">{{ item.content }}</span>
        <Input
          v-if="item.type[0] === 2"
          type="text"
          allow-clear
          :value="item.value"
          placeholder="请输入"
          class="item-top-input"
          :disabled="type === 'check'"
          @change="(e) => onInputChange(e.target.value, index)"
        />
        <Select
          v-else-if="item.type[0] === 'Enum'"
          allow-clear
          :value="item.value"
          placeholder="请选择"
          class="item-top-input"
          :disabled="type === 'check'"
          @change="(e) => onInputChange(e, index)"
        >
          <Select.Option v-for="option in item.example" :key="option.index" :value="option.text">
            {{ option.content }}
          </Select.Option>
        </Select>
        <a-input-number
          v-else
          placeholder="请输入"
          class="item-top-input"
          :value="item.value"
          :disabled="type === 'check'"
          @change="(e) => onInputChange(e, index)"
        />
      </div>
      <div class="item-bottom">
        <span class="item-bottom-eg">e.g.</span>
        <span class="item-bottom-text" v-if="!Array.isArray(item.example)">{{ item.example }}</span>
        <span class="item-bottom-text" v-else>枚举值</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Input, Select } from "ant-design-vue";
import { reactive } from "vue";
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    default: () => "",
  },
});

// 使用 reactive 创建响应式对象 todo
const dataList = reactive({
  list: props.list,
});

//todo
const onInputChange = (value, index) => {
  const target = dataList.list[index];
  target.value = value;
  dataList.list[index] = target;
};
// onInputChange(value, index) {
//       const target = this.dataList[index];
//       target.value = value;
//       this.$set(this.dataList, index, target);
//     },

// watch: {
//   list: {
//     handler(newValue) {
//       this.list = newValue;
//       this.dataList = cloneDeep(newValue);
//     },
//     deep: true,
//   },
// },
</script>
<style lang="less">
.script-results {
  background-color: @tableHeaderColor;

  &-item {
    padding: 8px 24px;
    border-bottom: 1px dashed #d9d9d9;

    &:first-child {
      border-top: 1px dashed #d9d9d9;
    }

    .item-top {
      margin-bottom: 4px;

      &-text {
        margin-right: 8px;
        color: @primaryTextColor;
      }

      &-input {
        width: 90px;

        .ant-input-number-handler-wrap {
          opacity: 1;
        }
      }
    }

    .item-bottom {
      height: 21px;
      line-height: 21px;

      &-eg {
        color: @secondaryTextColor;
      }

      &-text {
        color: @primaryTextColor;
      }
    }
  }
}
</style>
