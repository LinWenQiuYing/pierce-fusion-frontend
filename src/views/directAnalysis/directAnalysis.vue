<template>
  <div class="direct-analysis">
    <div class="direct-analysis-header">关联关系查询</div>
    <div class="direct-analysis-content">
      <div class="direct-analysis-content-options">
        <div class="options-item">
          <div class="options-item-label">选择图谱：</div>
          <div class="options-item-content">
            <Cascader
              class="content-cascader"
              :options="options"
              placeholder="请选择"
              v-model:value="graphName"
              @change="graphChange"
            />
          </div>
        </div>
        <div class="options-item">
          <div class="options-item-label">分析对象：</div>
          <div class="options-item-content">
            <Input.TextArea
              allowClear
              v-model:value="analysisObj"
              placeholder="请输入用户号，用“，”或回车分隔"
              :auto-size="{ minRows: 6, maxRows: 6 }"
            />
          </div>
        </div>
        <div class="options-item">
          <div class="options-item-label">是否定向：</div>
          <div class="options-item-content">
            <Radio.Group v-model:value="isDirect">
              <Radio :value="1"> 定向 </Radio>
              <Tooltip>
                <template #title>仅支持顺向的关联关系：目标A -> 中间过度方 -> 目标B</template>
                <QuestionCircleOutlined />
              </Tooltip>
              <Radio :value="0"> 非定向 </Radio>
              <Tooltip>
                <template #title
                  >不限制检索目标之间的关系方向，支持：目标A -> 中间过度方 &lt;- 目标B</template
                >
                <QuestionCircleOutlined />
              </Tooltip>
            </Radio.Group>
          </div>
        </div>
        <div class="options-item">
          <div class="options-item-label">关联关系：</div>
          <div class="options-item-content">
            <Checkbox.Group
              v-model:checked="checkedList"
              :options="plainOptions"
              v-show="checkShow"
            />
            <DoubleLeftOutlined v-if="checkShow" @click="checkShow = !checkShow" />
            <DoubleRightOutlined v-else @click="checkShow = !checkShow" />
          </div>
        </div>
        <div class="options-item">
          <div class="options-item-label">分析层数：</div>
          <div class="options-item-content">
            <InputNumber v-model:value="analysisLevel" :min="1" :max="10" />
            <Tooltip>
              <template #title>层数过大影响运行效率，建议使用推荐层数3</template>
              <QuestionCircleOutlined />
            </Tooltip>
            <span class="reset-btn" @click="handleReset">重置</span>
          </div>
        </div>
        <div class="options-item">
          <div class="options-item-label">检索广度：</div>
          <div class="options-item-content">
            <Segmented :options="numbers" @selectItem="selectItem" ref="segmented" />
            <Tooltip>
              <template #title>失败后重试的最大任务数</template>
              <QuestionCircleOutlined />
            </Tooltip>
            <span class="reset-btn" @click="handleResetNum">重置</span>
          </div>
        </div>
        <div class="options-item">
          <Button type="primary" @click="handleAnalysis">开始分析</Button>
        </div>
      </div>
      <div class="direct-analysis-content-result">
        <p class="content-sub-title">分析结果</p>
        <Spin v-if="tableLoading" class="content-loading" />
        <p class="result-content" v-else-if="pathData.vertices && pathData.vertices.length">
          已查到结果，点击跳转探索
          <span class="result-content-skip" @click="toAffairGraph">探索</span>
        </p>
        <p class="result-content" v-else-if="pathData.vertices && !pathData.vertices.length">
          暂无分析结果，请更换查询条件重试！
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getGraphAndVersion } from "@/shared/api/configManage";
import { directAnalysis } from "@/shared/api/graph";
import { getSchemaDetail } from "@/shared/api/graphsStructure";
import {
  DirectAnalysisPostType,
  DirectAnalysisType,
  GraphOptionResType,
  PathDataType,
} from "@/types";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons-vue";
import Segmented from "@components/segmentedComponent.vue";
import {
  Button,
  Cascader,
  Checkbox,
  Input,
  InputNumber,
  Radio,
  Spin,
  Tooltip,
  message,
} from "ant-design-vue";
import { cloneDeep, find, findIndex, uniq } from "lodash";
import { onMounted, reactive, ref, toRefs } from "vue";

const state: DirectAnalysisType = reactive({
  graphName: undefined,
  analysisObj: undefined,
  isDirect: 0,
  analysisLevel: 3,
  retryTaskNumber: 200,
  pathData: {
    edges: [],
    vertices: [],
  },
  options: [],
  pagination: {
    size: "small",
    total: 0,
    current: 1,
    pageSize: 5,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["5", "10", "15", "20"],
    showTotal: (total) => {
      return `共${total}条记录`;
    },
    onChange: (page, pageSize) => {
      state.pagination.current = page;
      state.pagination.pageSize = pageSize;
    },
    onShowSizeChange: (current, size) => {
      state.pagination.current = current;
      state.pagination.pageSize = size;
    },
  },
  tableLoading: false,
  checkedList: [],
  plainOptions: [],
  checkShow: false,
});

const segmented = ref(null);

const numbers = [
  {
    value: 100,
    label: "最低",
  },
  {
    value: 200,
    label: "低",
  },
  {
    value: 300,
    label: "较高",
  },
  {
    value: 400,
    label: "高",
  },
  {
    value: 500,
    label: "最高",
  },
];

const {
  options,
  graphName,
  analysisObj,
  isDirect,
  analysisLevel,
  tableLoading,
  pathData,
  checkedList,
  plainOptions,
  checkShow,
} = toRefs(state);

onMounted(() => {
  getGraphList();
});

const getGraphList = async () => {
  const res = await getGraphAndVersion();
  state.options = [];
  if (res.message === "成功") {
    state.options = res.data.map((item: GraphOptionResType) => {
      return {
        label: item.graphChName,
        value: item.graphName,
        id: item.id,
        blueprintId: item.bluePrintId,
        children:
          (item.graphBranchList &&
            item.graphBranchList.map((cell) => {
              return {
                label: cell.graphCnName,
                value: cell.graphName,
                id: cell.id,
              };
            })) ||
          [],
      };
    });
  }
};

const toAffairGraph = () => {};

const handleAnalysis = async () => {
  if (!state.graphName || !state.graphName.length) {
    message.error("请选择图谱！");
    return false;
  }
  if (!state.analysisObj) {
    message.error("请输入分析对象！");
    return false;
  }
  if (!state.analysisLevel) {
    message.error("请输入分析层数！");
    return false;
  }
  if (!state.retryTaskNumber) {
    message.error("请输入检索广度！");
    return false;
  }
  state.analysisObj = state.analysisObj.replace(new RegExp(" ", "gm"), "");
  state.analysisObj = state.analysisObj.replace(new RegExp("，", "gm"), ",");
  // eslint-disable-next-line no-control-regex
  state.analysisObj = state.analysisObj.replace(/\n|\r|\r\n/g, ",");
  let vertexIds = state.analysisObj.split(",") || [];
  const ids = cloneDeep(vertexIds);
  if (vertexIds.length) {
    for (let i = 0; i < vertexIds.length; i++) {
      let id = vertexIds[i];
      console.log("id", id, i, id.slice(-2, -1));
      if (id.slice(-2, -1) === "_") {
        const index = findIndex(ids, (v) => v === id);
        const newId = id.slice(0, -2);
        ids.splice(index, 1, newId);
      }
    }
    vertexIds = ids;
  }
  console.log("vertexIds", vertexIds);
  vertexIds = uniq(vertexIds);
  const json: DirectAnalysisPostType = {
    vertexIds,
    minStep: 1,
    maxStep: state.analysisLevel,
    taskNums: state.retryTaskNumber,
    graphName: state.graphName[1],
    types: "directedAnalysis",
    isDirected: state.isDirect ? true : false,
    edgeLabelList: state.checkedList,
  };
  state.tableLoading = true;
  const res = await directAnalysis(json);
  state.tableLoading = false;
  const pathData: PathDataType = {
    edges: [],
    vertices: [],
  };
  if (res.message === "成功" && res.data.paths.length) {
    res.data.paths.map((item: PathDataType) => {
      pathData.edges.push(...item.edges);
      pathData.vertices.push(...item.vertices);
    });
  } else if (res.message === "成功" && !res.data.paths.length) {
    message.info("未查到相关路径信息！");
  } else {
    message.error(res.message);
  }
  state.pathData = pathData;
};

const handleReset = () => {
  state.analysisLevel = 3;
};

const handleResetNum = () => {
  if (segmented.value) {
    segmented.value.handleClick(200);
  }
};

const graphChange = async (value: string[]) => {
  console.log("graphChange", value, state.options);
  const target = find(state.options, (v) => v.value === value[0]);
  console.log("target", target);
  if (target && target.blueprintId) {
    const plainOptions: string[] = [];
    const checkedList: string[] = [];
    const res = await getSchemaDetail(target.blueprintId);
    if (res.message === "成功") {
      console.log("res", res);
      res.data.graphEdge.map((edge: any) => {
        plainOptions.push(edge.label);
      });
    } else {
      message.error(res.message);
    }
    state.plainOptions = plainOptions;
    state.checkedList = checkedList;
  } else {
    message.info("图谱数据缺少蓝图id，请检查！");
  }
};

const selectItem = (item: number) => {
  state.retryTaskNumber = item;
};
</script>
<style lang="less">
@import url("./index.less");
</style>
