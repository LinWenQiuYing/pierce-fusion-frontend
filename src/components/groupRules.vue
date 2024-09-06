<template>
  <div
    ref="main"
    :class="
      Array.isArray(ruleList[ruleList.length - 1]) && ruleList[ruleList.length - 1].length > 1
        ? 'rules-content-main short'
        : 'rules-content-main'
    "
    :style="{
      '--mainHeight': domHeight + 'px',
      '--mainTop': domHeight / 2 + 26 + 'px',
    }"
  >
    <div v-for="(item, index) in ruleList" :key="item.id">
      <div
        v-if="Array.isArray(item)"
        :class="ruleList.length < 3 ? 'rules-content-header no-before' : 'rules-content-header'"
      >
        <a-icon type="folder" />
        <span class="header-tips">
          规则组
          <a-icon :type="item.length > 1 ? 'caret-up' : 'caret-down'" />
        </span>
        <a-icon
          :style="{
            color: disabled ? 'rgba(0, 0, 0, 0.25)' : '#1890ff',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }"
          type="plus-square"
          @click="addRules('single', [...value, index])"
        />
        <a-icon
          :style="{
            color: disabled ? 'rgba(0, 0, 0, 0.25)' : '#1890ff',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }"
          type="folder-add"
          @click="addRules('multi', [...value, index])"
        />
        <a-icon
          :style="{
            color: disabled ? 'rgba(0, 0, 0, 0.25)' : '#1890ff',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }"
          type="delete"
          @click="deleteRule([...value, index])"
        />
      </div>
      <group-rules
        v-if="Array.isArray(item)"
        :list="item"
        :originList="originList"
        :value="[...value, index]"
        :floor="floor + 1"
        :rulesOptions="rulesOptions"
        :conditionOptions="conditionOptions"
        :parentIndex="parentIndex"
        :disabled="disabled"
        @onAttributeChange="onAttributeChange"
      />
      <div
        v-else-if="item.types === 'single'"
        :class="ruleList.length < 3 ? 'rules-single no-before' : 'rules-single'"
      >
        <a-icon type="file" />
        <a-select
          show-search
          filter-option
          placeholder="请选择"
          :value="item.attribute"
          :options="rulesOptions"
          class="rule-options"
          @change="
            (e) => {
              onAttributeChange('attribute', [...value, index], e, parentIndex);
            }
          "
          :disabled="disabled"
        />
        <a-select
          placeholder="请选择"
          :value="item.condition"
          :options="conditionOptions"
          class="condition-options"
          @change="
            (e) => {
              onAttributeChange('condition', [...value, index], e, parentIndex);
            }
          "
          :disabled="disabled"
        />
        <a-select
          v-show="!item.disabled"
          class="condition-options"
          v-model="item.attributeType"
          :options="thresholdTypeOptions"
          @change="
            (e) => {
              onAttributeChange('attributeType', [...value, index], e, parentIndex);
            }
          "
          :disabled="disabled"
        />
        <a-input-number
          v-if="item.attributeType === 'ValueInteger'"
          class="rules-single-input"
          v-model="item.value"
          placeholder="请输入值"
          :precision="0"
          @change="
            (e) => {
              onAttributeChange('value', [...value, index], e, parentIndex);
            }
          "
          :disabled="disabled"
        />
        <a-input-number
          v-if="item.attributeType === 'ValueDouble'"
          class="rules-single-input"
          v-model="item.value"
          placeholder="请输入值"
          @change="
            (e) => {
              onAttributeChange('value', [...value, index], e, parentIndex);
            }
          "
          :disabled="disabled"
        />
        <a-input
          type="text"
          v-if="item.attributeType === 'ValueString' && !item.disabled"
          placeholder="请输入"
          class="rules-single-input"
          v-model="item.value"
          @change="
            (e) => {
              onAttributeChange('value', [...value, index], e.currentTarget.value, parentIndex);
            }
          "
          :disabled="disabled"
        />
        <div class="regex" v-else-if="item.disabled">
          第
          <a-input
            type="text"
            class="small"
            v-model="item.num"
            placeholder="请输入"
            @change="
              (e) => {
                onAttributeChange('num', [...value, index], e.currentTarget.value, parentIndex);
              }
            "
            :disabled="disabled"
          />
          位标签，状态判定为
          <a-input
            type="text"
            class="small"
            v-model="item.value"
            placeholder="请输入"
            @change="
              (e) => {
                onAttributeChange('value', [...value, index], e.currentTarget.value, parentIndex);
              }
            "
            :disabled="disabled"
          />
        </div>
        <a-date-picker
          v-if="item.attributeType === 'ValueTime'"
          v-model="item.value"
          show-time
          class="rules-single-input"
          format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择时间"
          @change="
            (e) => {
              onAttributeChange('value', [...value, index], e, parentIndex);
            }
          "
          :disabled="disabled"
        />
        <a-icon
          :style="{
            color: disabled ? 'rgba(0, 0, 0, 0.25)' : '#1890ff',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }"
          type="delete"
          @click="deleteRule([...value, index])"
        />
      </div>
      <div
        v-else
        :class="floor === 0 ? 'and-or first' : 'and-or'"
        :style="{
          display: ruleList.length > 2 ? 'block' : 'none',
          borderColor: disabled ? 'rgba(0, 0, 0, 0.25)' : '#549be7',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }"
        @click="onRelationChange([...value, index])"
      >
        {{ item.relations }}
      </div>
    </div>
  </div>
</template>
<script>
import { DatePicker, Input, InputNumber } from "ant-design-vue";
import { cloneDeep } from "lodash";
import { nanoid } from "nanoid";

export default {
  name: "GroupRules",
  props: [
    "list",
    "originList",
    "value",
    "floor",
    "rulesOptions",
    "conditionOptions",
    "parentIndex",
    "disabled",
  ],
  data() {
    return {
      ruleList: cloneDeep(this.list),
      domHeight: 0,
      thresholdTypeOptions: [
        {
          label: "整数",
          value: "ValueInteger",
        },
        {
          label: "字符串",
          value: "ValueString",
        },
        {
          label: "时间",
          value: "ValueTime",
        },
        {
          label: "浮点数",
          value: "ValueDouble",
        },
      ],
    };
  },
  components: {
    ADatePicker: DatePicker,
    AInput: Input,
    AInputNumber: InputNumber,
  },
  mounted() {
    this.domHeight = this.$refs.main.offsetHeight;
  },
  watch: {
    list() {
      this.ruleList = cloneDeep(this.list);
    },
    ruleList() {
      setTimeout(() => {
        const height = this.$refs.main.offsetHeight;
        let targetArr = [];
        let lastHeight = 0;
        if (
          Array.isArray(this.ruleList[this.ruleList.length - 1]) &&
          this.ruleList[this.ruleList.length - 1].length > 1
        ) {
          targetArr = this.ruleList[this.ruleList.length - 1];
          lastHeight = this.getArrChildNum(targetArr, 0, 0);
        }
        this.domHeight = height - (lastHeight + 1) * 52;
      }, 50);
    },
  },
  methods: {
    addRules(type, key) {
      if (this.disabled) return;
      const rulesArr = this.originList;
      const resultRulesArr = this.updateRulesGroup(key, rulesArr);
      if (type === "single") {
        const singleItem = {
          id: nanoid(),
          attribute: undefined,
          attributeControl: "value",
          attributeType: "ValueString",
          condition: undefined,
          isFunction: false,
          types: "single",
          value: undefined,
        };
        resultRulesArr.push(singleItem);
      } else {
        resultRulesArr.push([
          {
            id: nanoid(),
            types: "relations",
            relations: "且",
            label: this.ruleList[0].label,
          },
        ]);
      }
      this.ruleList = rulesArr;
    },
    updateRulesGroup(key, rulesArr) {
      if (key.length) {
        let resultArr = rulesArr[key[0]];
        if (key.length > 1) {
          key.map((num, index) => {
            if (index > 0) {
              resultArr = resultArr[num];
            }
          });
        }
        return resultArr;
      } else {
        return rulesArr;
      }
    },
    deleteRule(key) {
      if (this.disabled) return;
      let parentArr = this.originList;
      if (key.length > 1) {
        key.map((num, index) => {
          if (index < key.length - 1) {
            parentArr = parentArr[num];
          }
        });
      }
      parentArr.splice(key[key.length - 1], 1);
    },
    onRelationChange(key) {
      let parentArr = this.originList;
      if (key.length > 1) {
        key.map((num, index) => {
          if (index < key.length - 1) {
            parentArr = parentArr[num];
          }
        });
      }
      if (parentArr[0].relations === "且") {
        parentArr[0].relations = "或";
      } else {
        parentArr[0].relations = "且";
      }
      this.ruleList = parentArr;
      this.$emit("onAttributeChange", "relations", key, parentArr[0].relations, this.parentIndex);
    },
    onAttributeChange(type, key, value, index) {
      this.$emit("onAttributeChange", type, key, value, index);
    },
    getArrChildNum(arr, num, floor) {
      arr.map((item, index) => {
        if (floor > 0) {
          if (Array.isArray(item)) {
            num = this.getArrChildNum(item, num, floor + 1);
          } else {
            num = num + 1;
          }
        } else {
          if (index > 0) {
            if (Array.isArray(item)) {
              num = this.getArrChildNum(item, num, floor + 1);
            } else {
              num = num + 1;
            }
          }
        }
      });
      return num;
    },
  },
};
</script>
<style lang="less">
.rules-content-main {
  padding: 0 10px;
  position: relative;

  &:not(:first-child) {
    padding: 0 35px;
  }

  &::before {
    top: 26px;
    content: "";
    position: absolute;
    height: calc(100% - 52px);
    border-left: 1px solid #d9d9d9;
  }

  &.short {
    .and-or {
      top: calc(var(--mainTop));
    }

    &::before {
      height: var(--mainHeight);
    }
  }

  &:first-child::before {
    left: -4px;
  }

  &:not(:first-child)::before {
    left: 21px;
  }

  .rules-single {
    // width: 530px;
    display: flex;
    padding: 10px 0;
    align-items: center;
    padding-left: 10px;
    position: relative;

    &::before {
      top: 25px;
      content: "";
      left: -14px;
      width: 24px;
      height: 14px;
      position: absolute;
      border-top: 1px solid #d9d9d9;
    }

    &.no-before {
      &::before {
        width: 0;
      }
    }

    .anticon-file {
      font-size: 16px;
      color: #949dad;
    }

    .rule-options {
      width: 160px;
      margin: 0 5px;
    }

    .condition-options {
      width: 120px;
      margin: 0 5px;
    }

    &-input {
      width: 160px;
      margin: 0 5px;
    }

    .regex {
      width: 300px;
      padding-left: 5px;
      display: inline-block;

      .small {
        width: calc((100% - 156px) / 2);
      }
    }

    .anticon-delete {
      color: @activeFontColor;
      font-size: 16px;
      margin-left: 10px;
    }
  }

  .rules-content-header {
    display: flex;
    padding: 14px 0;
    align-items: center;
    padding-left: 10px;
    position: relative;

    &::before {
      top: 25px;
      content: "";
      left: -13px;
      width: 22px;
      height: 14px;
      position: absolute;
      border-top: 1px solid #d9d9d9;
    }

    &.no-before {
      &::before {
        width: 0;
      }
    }

    .anticon-folder {
      font-size: 18px;
      color: #949dad;
    }

    .header-tips {
      color: #949dad;
      padding: 0 10px;
      font-size: 16px;
    }

    .anticon-plus-square,
    .anticon-delete {
      color: @activeFontColor;
      font-size: 18px;
      padding: 0 5px;
    }

    .anticon-folder-add {
      color: @activeFontColor;
      font-size: 21px;
      padding: 0 5px;
    }
  }

  .and-or {
    top: 50%;
    width: 20px;
    z-index: 99;
    left: 12px;
    height: 20px;
    cursor: pointer;
    font-size: 10px;
    line-height: 18px;
    border-radius: 50%;
    background: #fff;
    position: absolute;
    text-align: center;
    border: 1px solid #549be7;
    transform: translateY(-50%);
    transition: all 0.1s;

    &.first {
      left: -14px;
    }
  }
}
</style>
