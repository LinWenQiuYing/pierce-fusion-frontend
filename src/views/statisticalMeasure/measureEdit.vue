<template>
  <div class="measure-edit">
    <div class="hd">
      <span class="title">{{ title }}</span>
      <Button @click="onCancel">返回</Button>
    </div>
    <Spin :spinning="spinning" size="large" id="ant-spin-nested-loading">
      <!-- 基本信息 -->
      <section class="info">
        <div class="sub-title">
          <!-- <icon-svg icon-class="icon_measureInfo" class="info-icon" /> -->
          <h2>基本信息</h2>
        </div>
        <Form layout="inline" :model="infoForm" :rules="infoFormRules" ref="editInfoFormRef">
          <div class="top">
            <Form.Item label="度量名称：" prop="name">
              <Input
                v-model:vlue.trim="infoForm.name"
                placeholder="请输入度量名称"
                class="input"
                allow-clear
                :disabled="checkType === 'check'"
              />
            </Form.Item>
            <Form.Item label="蓝图结构：" prop="schemaId">
              <Select
                :disabled="checkType !== 'add'"
                v-model:vlue="infoForm.schemaId"
                class="input"
                placeholder="请选择蓝图"
                @change="handleSchemaChange"
                :getPopupContainer="getPopupContainer"
              >
                <Select.Option :value="id" :key="id" v-for="id in Object.keys(schemaMap)">{{
                  schemaMap[id]
                }}</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item label="度量描述：" prop="desc">
            <Input.Textarea
              v-model:vlue.trim="infoForm.desc"
              placeholder="这是一段关于该统计度量的描述..."
              class="input-textarea"
              :auto-size="{ minRows: 4, maxRows: 6 }"
              allow-clear
              :disabled="checkType === 'check'"
            />
          </Form.Item>
        </Form>
      </section>
      <!-- 度量统计配置 -->
      <section class="config">
        <div class="sub-title">
          <!-- <icon-svg icon-class="icon_measureConfig" class="config-icon" /> -->
          <h2>统计度量配置</h2>
        </div>
        <div class="config-box">
          <div class="config-box-item">
            <div class="config-box-item-info">
              <span class="info-label"> <span class="require">*</span>度量函数：</span>
              <Select
                :disabled="checkType === 'check'"
                v-model:vlue="func"
                class="info-select"
                placeholder="请选择"
                :options="funcOptions"
              />
            </div>
            <div class="config-box-item-info">
              <span class="info-label"> <span class="require">*</span>点边类型：</span>
              <Select
                :disabled="checkType === 'check'"
                v-model:vlue="dimension"
                class="info-select"
                placeholder="请选择"
              >
                <Select.Option :value="1">点</Select.Option>
                <Select.Option :value="2" :disabled="isInOrOut">边</Select.Option>
              </Select>
            </div>
          </div>
          <div class="config-box-item">
            <div class="config-box-item-title">
              <span class="title-text">类型和属性：</span>
            </div>
            <div class="config-box-item-attr">
              <div class="config-box-item-attr-item" v-for="(item, index) in attrList" :key="index">
                <Select
                  allow-clear
                  class="subject"
                  v-model:vlue="item.value"
                  placeholder="请选择主体类型"
                  :disabled="checkType === 'check'"
                >
                  <Select.Option
                    :key="child"
                    :value="child"
                    v-for="child in subjectOption[dimension].filter((cell) => {
                      const index = getIndex(attrList, (v) => v.value === cell);
                      if (index === -1) {
                        return cell;
                      }
                    })"
                  >
                    {{ child }}
                  </Select.Option>
                </Select>
                <Select
                  mode="multiple"
                  placeholder="请选择属性"
                  v-model:vlue="item.attrs"
                  class="attrs"
                  allow-clear
                  :disabled="checkType === 'check'"
                >
                  <Select.Option
                    :key="item"
                    :value="item"
                    v-for="item in featureOption[item.value]"
                  >
                    {{ item }}
                  </Select.Option>
                </Select>
                <DeleteOutlined
                  :style="{
                    color: checkType === 'check' ? 'rgba(0, 0, 0, 0.25)' : '#1890ff',
                    cursor: checkType === 'check' ? 'not-allowed' : 'pointer',
                  }"
                  @click="deleteAttr(index)"
                />
              </div>
              <Button class="attr-button" @click="handleAddAttr" :disabled="checkType === 'check'"
                ><PlusOutlined />添加类型</Button
              >
            </div>
          </div>
          <div class="config-box-item">
            <div class="config-box-item-title">
              <span>筛选条件：</span>
              <Button type="primary" @click="handleAddCondition" :disabled="checkType === 'check'"
                ><PlusOutlined />添加筛选项</Button
              >
            </div>
            <div
              class="config-box-item-condition"
              v-for="(item, index) in conditionList"
              :key="index"
            >
              <div class="config-box-item-condition-header">
                <Select
                  allow-clear
                  class="subject"
                  v-model:vlue="item.subject"
                  placeholder="请选择主体类型"
                  :disabled="checkType === 'check'"
                >
                  <Select.Option
                    :key="child.value"
                    :value="child.value"
                    v-for="child in attrList.filter((cell) => {
                      const num = getIndex(conditionList, (c) => c.subject === cell.value);
                      if (num === -1) {
                        return cell;
                      }
                    })"
                  >
                    {{ child.value }}
                  </Select.Option>
                </Select>
                <div class="header-btns">
                  <span
                    :class="['header-btn', checkType === 'check' ? 'disabled' : '']"
                    @click="addRules('single', index, [])"
                    >添加条件</span
                  >
                  <span
                    :class="['header-btn', checkType === 'check' ? 'disabled' : '']"
                    @click="addRules('group', index, [])"
                    >添加条件组</span
                  >
                  <span
                    :class="['header-btn', checkType === 'check' ? 'disabled' : '']"
                    @click="deleteRules(index)"
                    >删除</span
                  >
                  <caret-up-outlined
                    v-if="item.contentShow"
                    @click="item.contentShow = !item.contentShow"
                  />
                  <caret-down-outlined v-else @click="item.contentShow = !item.contentShow" />
                </div>
              </div>
              <div class="config-box-item-condition-content" v-show="item.contentShow">
                <group-rules
                  v-if="item.subject"
                  :list="item.rulesGroup"
                  :originList="item.rulesGroup"
                  :value="[]"
                  :floor="0"
                  :rulesOptions="
                    featureOption[item.subject].map((v) => ({
                      label: v,
                      value: v,
                    }))
                  "
                  :parentIndex="index"
                  :conditionOptions="conditionOptions"
                  @onAttributeChange="onAttributeChange"
                  :disabled="checkType === 'check'"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Spin>
    <!-- 底部按钮 -->
    <footer class="footer">
      <Button @click="onCancel">取消</Button>
      <Button type="primary" @click="onSubmit" v-show="checkType !== 'check'">提交</Button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { graphPreview } from "@/shared/api/configManage";
import {
  addMeasure,
  editMeasure,
  queryGraphSchema,
  queryMeasureDetail,
} from "@/shared/api/measure.js";
import { MeasureEditStateType, MeasureListItemType } from "@/types";
import { modalConfirm, scrollToBottom } from "@/utils/common";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons-vue";
import GroupRules from "@components/groupRules.vue";
import { Button, Form, Input, Spin, message } from "ant-design-vue";
import type { Rule } from "ant-design-vue/es/form";
import dayjs from "dayjs";
import { cloneDeep, findIndex } from "lodash";
import { nanoid } from "nanoid";
import { computed, nextTick, onMounted, reactive, watch } from "vue";

interface MeasureProps {
  checkType: string;
  record: MeasureListItemType | null;
}

const props = withDefaults(defineProps<MeasureProps>(), {
  checkType: "add",
  record: null,
});

const emit = defineEmits<{
  (e: "update:isListShow", value: boolean): any;
}>();

const conditionOptions = [
  {
    label: "=",
    value: "=",
  },
  {
    label: ">",
    value: ">",
  },
  {
    label: "<",
    value: "<",
  },
  {
    label: ">=",
    value: ">=",
  },
  {
    label: "<=",
    value: "<=",
  },
  {
    label: "!=",
    value: "!=",
  },
  {
    label: "标签选择",
    value: "regex",
  },
];

const infoFormRules: Record<string, Rule[]> = {
  name: [
    {
      required: true,
      message: "请输入度量名称",
      trigger: "blur",
    },
  ],
  schemaId: [
    {
      required: true,
      message: "请选择蓝图",
      trigger: "blur",
    },
  ],
};

const funcOptions = [
  {
    label: "计数",
    value: 1,
  },
  {
    label: "求和",
    value: 2,
  },
  {
    label: "最大值",
    value: 3,
  },
  {
    label: "最小值",
    value: 4,
  },
  {
    label: "平均值",
    value: 5,
  },
  {
    label: "最大入度",
    value: 6,
  },
  {
    label: "最大出度",
    value: 7,
  },
];

// 主体类型
const subjectOption = {
  1: [],
  2: [],
};

const measureEditState: MeasureEditStateType = reactive({
  spinning: false,
  schemaMap: {},
  // infoForm
  infoForm: {
    name: undefined,
    schemaId: undefined,
    desc: undefined,
  },
  // 度量函数
  func: 1,
  // 点边类型
  dimension: 1,
  featureOption: [],

  attrList: [], // 类型和属性保存的数组
  conditionList: [], // 条件/条件组数组
});

onMounted(() => {
  getGraphSchemaList();
  if (props.checkType === "add") return;
  getMeasureDetail();
});

watch(
  () => measureEditState.func,
  (newVal: number) => {
    if (newVal === 6 || newVal === 7) {
      measureEditState.dimension = 1;
    }
  }
);

const isInOrOut = computed(() => {
  // 最大入度 || 最大出度
  return measureEditState.func === 6 || measureEditState.func === 7;
});

const title = computed(() => {
  return `${
    props.checkType === "check" ? "查看" : props.checkType === "add" ? "新建" : "编辑"
  }统计度量`;
});

const getIndex = (arr, fn) => {
  return findIndex(arr, fn);
};

const handleSchemaChange = async (newId: string) => {
  if (!measureEditState.infoForm.schemaId) {
    measureEditState.infoForm.schemaId = newId;
    processSchemaData(newId);
  } else {
    const title = "蓝图选择确认！";
    const content = "重新选择蓝图后，当前的统计度量配置将会被清空， 是否确认选择新的蓝图？";
    const onOk = async () => {
      measureEditState.infoForm.schemaId = newId;
      handleReset();
      processSchemaData(newId);
    };
    modalConfirm(title, onOk, content);
  }
};

const processSchemaData = async (schemaId: string) => {
  const data = await graphPreview(schemaId);
  const { vertexMetas, edgeMetas } = data;
  const vertexsLabelFeatureObj = {};
  const edgeMetasLabelFeatureObj = {};
  const edges = edgeMetas.map((item) => {
    vertexsLabelFeatureObj[item.label] = item.property;
    return item.label;
  });

  const vertexs = vertexMetas.map((item) => {
    edgeMetasLabelFeatureObj[item.label] = item.property;
    return item.label;
  });

  subjectOption[1] = vertexs;
  subjectOption[2] = edges;

  measureEditState.featureOption = Object.assign(
    {},
    vertexsLabelFeatureObj,
    edgeMetasLabelFeatureObj
  );
};

const handleReset = () => {
  measureEditState.func = 1;
  measureEditState.dimension = 1;
  measureEditState.attrList = [];
  measureEditState.conditionList = [];
};

const onCancel = () => {
  emit("update:isListShow", true);
};

const onSubmit = async () => {
  console.log("infoForm", measureEditState.infoForm);
  console.log("attrList", measureEditState.attrList);
  console.log("conditionList", measureEditState.conditionList);
  if (!measureEditState.infoForm.name) {
    return message.error("请填写正确的度量名称！");
  }
  if (!measureEditState.infoForm.schemaId) {
    return message.error("请选择蓝图结构！");
  }
  if (
    measureEditState.func !== 1 &&
    measureEditState.func !== 6 &&
    measureEditState.func !== 7 &&
    !measureEditState.attrList.length
  ) {
    return message.error("请添加至少一项统计类型！");
  }
  const measureDto = handleMeasureDto();
  const json = {
    id: props.record.id,
    measureName: measureEditState.infoForm.name,
    schemaId: measureEditState.infoForm.schemaId,
    notes: measureEditState.infoForm.desc,
    measureDto,
  };
  console.log("json", json);
  // 新建
  let res = null;
  const loading = message.loading("正在提交");
  if (props.checkType === "add") {
    res = await addMeasure(json);
    loading();
    if (res.message === "成功") {
      message.success("添加成功！");
      onCancel();
    } else {
      message.error(res.message);
    }
  } else {
    res = await editMeasure(json);
    loading();
    if (res.message === "成功") {
      message.success("修改成功");
      onCancel();
    } else {
      message.error(res.message);
    }
  }
};

const handleMeasureDto = () => {
  const measureDto = {
    measureFunction: measureEditState.func,
    measureDimension: measureEditState.dimension,
    computePropertyList: [],
    labelConditionDtoList: [],
  };
  measureEditState.attrList.map((item) => {
    measureDto.computePropertyList.push({
      label: item.value,
      property: item.attrs,
    });
  });
  measureEditState.conditionList.map((item) => {
    measureDto.labelConditionDtoList.push({
      label: item.subject,
      conditionGroup: handleRuleGroup(item.rulesGroup),
    });
  });
  return measureDto;
};

const getPopupContainer = (triggerNode) => {
  return triggerNode.parentNode;
};

const getGraphSchemaList = async () => {
  const data = await queryGraphSchema();
  const schemaMap = {};
  if (data && data.length) {
    data.map((item) => (schemaMap[item.id] = item.graphName));
    console.log("schemaMap", schemaMap);
    measureEditState.schemaMap = schemaMap;
  }
  console.log("SchemaList", data);
};
const getMeasureDetail = async () => {
  measureEditState.spinning = true;
  const data = await queryMeasureDetail(props.record.id);
  measureEditState.infoForm = {
    name: data.measureName,
    schemaId: data.schemaId,
    desc: data.notes,
  };

  await processSchemaData(data.schemaId);

  measureEditState.func = data.measureFunction;
  nextTick(() => {
    measureEditState.dimension = data.measureDimension;
    const labelDtos = data.paramValue ? JSON.parse(data.paramValue) : [];
    console.log("labelDtos", labelDtos);
    processLabelDtos(labelDtos);
    measureEditState.spinning = false;
  });
};

const processLabelDtos = (labelDtos) => {
  // 处理生成attrList和conditionList
  measureEditState.attrList = [];
  labelDtos.computePropertyList.map((item) => {
    measureEditState.attrList.push({
      value: item.label,
      attrs: item.property,
    });
  });
  labelDtos.labelConditionDtoList.map((item) => {
    measureEditState.conditionList.push({
      subject: item.label,
      contentShow: true,
      rulesGroup: handleJsonToGroup(item.conditionGroup),
    });
  });
};

const handleJsonToGroup = (condition) => {
  // 将接口返回的json转换成ruleGroup
  const result = [];
  result.push({
    id: nanoid(),
    types: "relations",
    relations: condition.relations === "and" ? "且" : "或",
  });
  condition.conditionList.map((item) => {
    if (item.types === "single") {
      result.push({
        id: nanoid(),
        attribute: item.property,
        attributeControl: "value",
        attributeType: item.constant.type,
        condition: item.operate,
        isFunction: false,
        types: "single",
        num: item.operate === "regex" ? item.constant.value.split(",")[0] : undefined,
        value: item.operate === "regex" ? item.constant.value.split(",")[1] : item.constant.value,
        disabled: item.operate === "regex",
      });
    } else {
      result.push(handleJsonToGroup(item));
    }
  });
  return result;
};

const handleAddAttr = () => {
  measureEditState.attrList.push({
    value: undefined,
    attrs: [],
  });
  scrollToBottom("ant-spin-nested-loading", 5);
};

const deleteAttr = (index) => {
  if (props.checkType === "check") return;
  measureEditState.attrList.splice(index, 1);
};

const handleAddCondition = () => {
  measureEditState.conditionList.push({
    subject: undefined,
    contentShow: true,
    rulesGroup: [
      {
        id: -1,
        types: "relations",
        relations: "且",
      },
    ],
  });
  scrollToBottom("ant-spin-nested-loading", 5);
};

const addRules = (type, index, key) => {
  if (props.checkType === "check") return;
  if (!measureEditState.conditionList[index].subject) {
    message.warning("请先选择概念类型");
    return false;
  }
  const resultRulesArr = updateRulesGroup(key, measureEditState.conditionList[index].rulesGroup);
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
      },
    ]);
  }
  measureEditState.resultModalVisible = false;
};

const deleteRules = (index) => {
  if (props.checkType === "check") return;
  measureEditState.conditionList.splice(index, 1);
};

const onAttributeChange = (type, key, value, index) => {
  const rulesArr = cloneDeep(measureEditState.conditionList[index].rulesGroup);
  const resultRulesArr = updateRulesGroup(key, rulesArr);
  switch (type) {
    case "attribute":
      resultRulesArr.attribute = value;
      break;
    case "condition":
      resultRulesArr.condition = value;
      resultRulesArr.disabled = value === "regex" ? true : false;
      break;
    case "value":
      resultRulesArr.value = value;
      break;
    case "relations":
      resultRulesArr.relations = value;
      break;
    case "attributeType":
      resultRulesArr.attributeType = value;
      break;
    case "num":
      resultRulesArr.num = value;
      break;
    default:
      break;
  }
  measureEditState.conditionList[index].rulesGroup = rulesArr;
  measureEditState.resultModalVisible = false;
};

const updateRulesGroup = (key, rulesArr) => {
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
};

const handleRuleGroup = (group) => {
  // 将ruleGroup转换成json传给接口
  const result = {
    types: "group",
    relations: group[0].relations === "且" ? "and" : "or",
    conditionList: group.slice(1).map((item) => {
      if (Array.isArray(item)) {
        return handleRuleGroup(item);
      } else {
        return {
          types: "single",
          property: item.attribute,
          operate: item.condition,
          constant: {
            value:
              item.condition === "regex"
                ? item.num + "," + item.value
                : item.attributeType === "ValueTime"
                  ? dayjs(item.value).format("YYYY-MM-DD HH:mm:ss")
                  : item.value,
            type: item.attributeType,
          },
        };
      }
    }),
  };
  return result;
};
</script>

<style lang="less">
.measure-edit {
  height: 100%;
  padding: 24px 0 53px;
  // background-color: @contentColor;
  overflow: auto;

  @lineColor: #c9cdd4;
  @disabledColor: #f7f8fa;
  @titleColor: #1d2129;

  .ant-spin-nested-loading {
    height: calc(100% - 40px);
    overflow: auto;
    position: relative;
    top: 56px;
  }

  .hd {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9;
    height: 80px;
    padding: 24px;
    display: flex;
    background: @contentColor;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.06);

    display: flex;
    align-items: center;
    justify-content: space-between;

    .title {
      font-size: 20px;
      color: @titleColor;
      font-weight: 600;
    }
  }

  .x-line::before {
    content: "";
    position: absolute;
    border-bottom: 1px solid @lineColor;
    width: 50%;
    // width: calc((100% - 136px - 16px) / 2);
    top: 50%;
    right: 0;
    transform: translateY(-50%);
  }

  .x-line-left::before {
    content: "";
    position: absolute;
    border-bottom: 1px solid @lineColor;
    width: 50%;
    // width: calc((100% - 160px - 8px * 2) / 2);
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }

  .y-line::before {
    content: "";
    position: absolute;
    height: calc((100% - 35px - 31px - 1px));
    border-left: 1px solid @lineColor;
    top: 36px;
    left: 0;
  }

  .circle-r::after,
  .circle-l::after {
    content: "";
    position: absolute;
    width: 6px;
    height: 6px;
    background-color: @lineColor;
    border-radius: 50%;
    top: 50%;
  }

  .circle-r::after {
    right: 0;
    transform: translate(50%, -50%);
  }

  .circle-l::after {
    left: 0;
    transform: translate(-50%, -50%);
  }

  .sub-title {
    display: flex;
    align-items: center;
    width: 100%;
    height: 56px;
    margin-bottom: 24px;
    padding: 16px 24px;
    border-bottom: 1px solid #d9d9d9;

    h2 {
      // font-size: 14px;
      // font-weight: normal;
      // line-height: 22px;
      // color: @titleColor;
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
      letter-spacing: 0em;
      color: #262626;
    }

    // .info-icon {
    //   width: 13.75px;
    //   height: 17.5px;
    // }

    // .config-icon {
    //   width: 15.63px;
    //   height: 15.63px;
    // }
  }

  .config-box {
    &-item {
      display: flex;
      flex-wrap: wrap;
      padding: 0 24px;
      align-items: center;
      margin-bottom: 16px;

      &-info {
        width: 380px;
        height: 32px;
        margin-right: 48px;

        .info-label {
          width: 87px;

          .require {
            margin-right: 4px;
            color: #f5222d;
            font-size: 14px;
          }
        }

        .info-select {
          width: calc(100% - 87px);
        }
      }

      &-title {
        width: 100%;
        height: 32px;
        line-height: 32px;
        margin-bottom: 16px;

        .title-text {
          font-size: 14px;
          color: #262626;
        }
      }

      &-attr {
        width: 100%;
        border-radius: 8px;
        padding: 16px 24px;
        background: #fafafa;

        .attr-button {
          border-radius: 2px;

          &:not([disabled]) {
            color: #1890ff;
            background: #e6f4ff;
            border-color: #1890ff;
          }
        }

        &-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          .subject {
            width: 160px;
            margin-right: 8px;
          }

          .attrs {
            width: calc(100% - 194px);

            .ant-select-selection__choice {
              padding: 0 20px;
              border-radius: 12px;
            }
          }

          .anticon-delete {
            color: #1890ff;
            font-size: 16px;
            margin-left: 10px;
          }
        }
      }

      &-condition {
        width: 100%;
        overflow: hidden;
        border-radius: 8px;
        margin-bottom: 16px;

        &-header {
          height: 56px;
          display: flex;
          padding: 0 24px;
          align-items: center;
          background: #f2f3f5;
          justify-content: space-between;

          .subject {
            width: 160px;
          }

          .header-btns {
            .header-btn {
              cursor: pointer;
              color: #1890ff;
              margin-right: 24px;

              &.disabled {
                cursor: not-allowed;
                color: @disabledColor;
              }
            }
          }
        }

        &-content {
          overflow: auto;
          min-height: 56px;
          padding-left: 24px;
          background: #fafafa;
        }
      }
    }
  }

  .info {
    background-color: @contentColor;
    margin: 0 0 24px 0;

    .ant-form {
      padding: 0 24px;
      .top {
        margin-bottom: 16px;

        .ant-form-item {
          width: calc((67% - 32px) / 2);
        }
      }

      .ant-form-item {
        width: 67%;
        margin-right: 32px;

        &-label {
          width: 85px;
          text-align: right;
        }

        &-control-wrapper {
          width: calc(100% - 85px);
        }
      }
    }
  }

  .config {
    background-color: @contentColor;
  }

  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 52px;
    padding: 24px;
    background: @contentColor;
    z-index: 9;

    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
