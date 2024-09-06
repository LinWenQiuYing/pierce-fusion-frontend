<template>
  <TableList
    tableTitle="图谱列表"
    listClass="graph-list"
    :columns="columns"
    :tableValue="tableValue"
    :pagination="pagination"
    :tableLoading="searchLoading3"
    tableClass="template-table"
    :rowKey="(record) => record.id"
    isDefaultFold
  >
    <template v-slot:searchOptions>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">图谱编号：</span>
        <Input
          class="table-list-top-item-input"
          type="text"
          v-model:value.trim="graphId"
          placeholder="请输入图编号"
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">图谱名称：</span>
        <Input
          class="table-list-top-item-input"
          type="text"
          v-model:value.trim="graphName"
          placeholder="请输入图名称"
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">图谱状态：</span>
        <Select
          class="table-list-top-item-input"
          v-model:value="graphState"
          placeholder="请选择状态"
        >
          <Select.Option value="">全部</Select.Option>
          <Select.Option value="0">启用</Select.Option>
          <Select.Option value="1">停用</Select.Option>
          <Select.Option value="3">创建中</Select.Option>
          <Select.Option value="4">创建失败</Select.Option>
        </Select>
      </div>
      <div class="table-list-top-item">
        <Button @click="onReset">重置</Button>
        <Button
          type="primary"
          @click="onSearch('init')"
          :loading="searchLoading1"
          v-if="userRights.btn_graphQuery"
        >
          查询
        </Button>
      </div>
    </template>
    <template v-slot:tableBtns>
      <Button class="header-btn" @click="onRefresh('repeat')">
        <template #icon><sync-outlined /></template>
        刷新
      </Button>
      <Button
        class="header-btn"
        @click="handleAdd"
        type="primary"
        v-if="userRights.btn_graphCreate"
      >
        <template #icon><file-add-outlined /></template>
        新建
      </Button>
    </template>
    <template v-slot:actionsSlot="{ record }">
      <a
        @click="handleSkip(record)"
        v-if="record.state !== '4'"
        :class="record.state === '3' ? 'disabled' : ''"
        style="margin-right: 12px"
        >探索</a
      >
      <a
        @click="handleRetry(record)"
        v-else-if="userRights.btn_graphCreate"
        style="margin-right: 12px"
        >重试</a
      >
      <a
        v-if="userRights.btn_graphUpdateStatus"
        @click="handleStop(record)"
        :class="record.state !== '0' && record.state !== '1' ? 'disabled' : ''"
        style="margin-right: 12px"
        >{{ record.state === "0" ? "停用" : "启用" }}</a
      >
      <a
        @click="handleCheckEdition(record)"
        :class="record.state !== '0' && record.state !== '1' ? 'disabled' : ''"
        v-if="userRights.btn_graphVersion"
        style="margin-right: 12px"
        >版本</a
      >
      <Popover overlayClassName="more-actions">
        <template v-slot:content>
          <p
            :class="record.state === '1' || record.state === '4' ? '' : 'disabled'"
            @click="handleDelete(record)"
            v-if="userRights.btn_graphDelete"
          >
            删除
          </p>
          <p
            @click="handleSetStrategy(record)"
            :class="record.state !== '0' && record.state !== '1' ? 'disabled' : ''"
            v-if="userRights.btn_graphUpdate"
          >
            更新策略
          </p>
          <p
            @click="checkUpdateDetail(record, 'init')"
            :class="record.state !== '0' && record.state !== '1' ? 'disabled' : ''"
            v-if="userRights.btn_graphUpdateDetail"
          >
            更新详情
          </p>
        </template>
        <a>更多</a>
      </Popover>
      <a
        v-if="
          !userRights.btn_graphCreate &&
          !userRights.btn_graphUpdateStatus &&
          !userRights.btn_graphVersion &&
          !userRights.btn_graphDelete &&
          !userRights.btn_graphUpdate &&
          !userRights.btn_graphUpdateDetail
        "
        class="no-action"
      >
        暂无操作权限
      </a>
    </template>
    <template v-slot:otherPart>
      <Modal
        centered
        :width="630"
        :footer="null"
        title="历史版本"
        @cancel="onCancel"
        class="edition-modal"
        :destroyOnClose="true"
        :visible="editionModalShow"
      >
        <div class="edition-modal-content">
          <table-component
            :columns="columns2"
            :tableValue="tableValue2"
            :rowKey="(record) => record.id"
            :row-selection="rowSelection"
            :pagination="pagination2"
            :loading="searchLoading4"
            class="edition-table"
            :border="true"
          >
            <template v-slot:edition="{ text }">
              <div class="edition-slot">
                <span class="edition-slot-text">
                  {{ text.value }}
                </span>
                <span class="edition-slot-label" v-if="text.isCurrent"> 当前版本 </span>
              </div>
            </template>
            <template v-slot:actions="record">
              <span>
                <a
                  @click="handleDeleteEdition(record)"
                  :class="pagination2.total === 1 ? 'disabled' : ''"
                  >删除</a
                >
              </span>
            </template>
          </table-component>
          <div class="edition-modal-content-footer">
            <Button class="footer-btn" @click="onCancel">取消</Button>
            <Button
              class="footer-btn"
              type="primary"
              @click="handleSelected"
              v-if="userRights.btn_selectGraphBranch"
              >回溯至该版本</Button
            >
          </div>
        </div>
      </Modal>
      <Modal
        centered
        :width="580"
        okText="确定"
        @ok="handleOk"
        class="strategy-modal"
        :destroyOnClose="true"
        @cancel="onStrategyCancel"
        :visible="strategyModalShow"
      >
        <template v-slot:title>
          <span class="strategy-modal-title" ref="title">更新策略配置</span>
          <Tooltip
            placement="right"
            :getPopupContainer="() => $refs.title"
            overlayClassName="strategy-modal-tooltip"
          >
            <template v-slot:title>
              <span>后台更新任务执行时，“立即更新”选项不可用</span>
            </template>
            <icon-svg icon-class="info_circle" class="info-circle" />
          </Tooltip>
        </template>
        <div class="strategy-modal-content">
          <Radio.Group name="strategyGroup" v-model:value="strategyValue" class="strategy-group">
            <Radio :value="0">暂不更新</Radio>
            <Radio :value="3" :disabled="isDisabled">立即更新</Radio>
            <Radio :value="2">周期更新</Radio>
          </Radio.Group>
          <div class="strategy-modal-content-box" v-if="strategyValue === 2">
            <Radio.Group name="cycleGroup" v-model:value="cycleValue" class="cycle-group">
              <Radio :value="1">
                <span class="cycle-group-title">固定周期更新</span>
                <Select class="cycle-group-input" v-model:value="value1" placeholder="请选择">
                  <Select.Option :value="1">每月第一天</Select.Option>
                  <Select.Option :value="4">每月最后一天</Select.Option>
                  <Select.Option :value="5">每周一</Select.Option>
                  <Select.Option :value="6">每周日</Select.Option>
                </Select>
              </Radio>
              <Radio :value="2">
                <span class="cycle-group-title">自定义周期更新</span>
                <InputNumber
                  :min="1"
                  :precision="0"
                  v-model:value="value2"
                  placeholder="请输入"
                  class="cycle-group-input left"
                  :parser="(value) => (/^\d+$/.test(value) ? value : 1)"
                />
                <Select class="cycle-group-input right" v-model:value="value3" placeholder="请选择">
                  <Select.Option :value="0">天</Select.Option>
                  <Select.Option :value="1">周</Select.Option>
                  <Select.Option :value="2">月</Select.Option>
                </Select>
              </Radio>
            </Radio.Group>
            <div class="box-item">
              <span class="cycle-group-title">选择生效时间段</span>
              <DatePicker.RangePicker
                v-model:value="value4"
                format="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
                class="cycle-group-input"
              >
                <template v-slot:suffixIcon>
                  <calendar-outlined />
                </template>
              </DatePicker.RangePicker>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        centered
        :width="734"
        okText="确定"
        title="更新详情"
        @ok="handleConfirm"
        :destroyOnClose="true"
        class="update-detail-modal"
        @cancel="onUpdateDetailCancel"
        :visible="updateDetailModalShow"
      >
        <div class="update-detail-modal-content">
          <p class="header-title">当前版本号：{{ details.edition }}</p>
          <p class="table-title">更新记录：</p>
          <!-- <table-component
            :columns="columns3"
            :tableValue="tableValue3"
            :rowKey="(record) => record.id"
            :pagination="pagination3"
            :loading="searchLoading4"
            class="update-table"
            border
          >
            <template v-slot:result="record">
              <div class="result-slot">
                <span class="result-slot-text" v-if="record.result === 0"
                  >
                  <loading-outlined class="blue"/>
                 
                  更新中...</span
                >
                <span class="result-slot-text" v-else-if="record.result === 1"
                  ><img src="@/assets/images/img/error.svg" alt="" />更新失败</span
                >
                <span class="result-slot-text" v-else
                  ><img src="@/assets/images/img/success.svg" alt="" />更新成功</span
                >
              </div>
            </template>
          </table-component> -->
        </div>
      </Modal>
    </template>
  </TableList>
</template>
<script setup lang="ts">
import TableComponent from "@/components/tableComponent.vue";
import TableList from "@/components/tableList.vue";
import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  Popover,
  Radio,
  Tooltip,
  message,
  Modal,
  Select,
} from "ant-design-vue";
import { queryGraphByPage, updateStatus, deleteGraphTable } from "@/shared/api/configManage.ts";
import {
  queryGraphVersion,
  graphUpdateDetail,
  // delGraphBranch,
  updateGraphTable,
  selectGraphBranch,
  getGraphState,
  createGraph,
} from "@/shared/api/graphsStructure.ts";
import { modalConfirm } from "@/utils/common.ts";
import { computed, onMounted, reactive, ref } from "vue";
import moment from "moment";

const emit = defineEmits(["isCreateShowChanged"]);

import { useUserStore } from "@store/user";
const store = useUserStore();
const userRights = computed(() => {
  return store.userRights;
});

const graphId = ref("");
const graphState = ref("");
const graphName = ref("");
const searchLoading1 = ref(false); // 查询按钮
//const searchLoading2 = ref(false); // 刷新按钮
const searchLoading3 = ref(false); // 表格
const searchLoading4 = ref(false); // 弹窗内表格
const columns = ref([
  {
    title: "图谱编号",
    dataIndex: "id",
    key: "id",
    width: 120,
  },
  {
    title: "图谱名称",
    dataIndex: "name",
    key: "name",
    width: 140,
  },
  {
    title: "版本号",
    dataIndex: "edition",
    key: "edition",
    width: 100,
  },
  {
    title: "图谱描述",
    dataIndex: "desc",
    key: "desc",
    width: 170,
  },
  {
    title: "生成时间",
    dataIndex: "createDate",
    key: "createDate",
    width: 120,
    sorter: true,
  },
  {
    title: "图谱状态",
    dataIndex: "stateText",
    key: "stateText",
    width: 105,
    //scopedSlots: { customRender: "state" },
    //todo
    // customRender: (text, record) => {
    //   return (
    //     <a-badge
    //       color={
    //         record.state === "0"
    //           ? "#52C41A"
    //           : record.state === "1"
    //             ? "rgba(0, 0, 0, 0.25)"
    //             : record.state === "3"
    //               ? "#FA8C16"
    //               : "#F5222D"
    //       }
    //       text={text}
    //     />
    //   );
    // },
  },
  {
    title: "操作",
    dataIndex: "actions",
    key: "actions",
    width: 114,
    //scopedSlots: { customRender: "actions" },
  },
]);
const columns2 = ref([
  {
    title: "版本号",
    dataIndex: "edition",
    key: "edition",
    width: 258,
    //scopedSlots: { customRender: "edition" },
  },
  {
    title: "生成时间",
    dataIndex: "time",
    key: "time",
    width: 180,
    sorter: true,
  },
  {
    title: "操作",
    dataIndex: "actions",
    key: "actions",
    width: 76,
    //scopedSlots: { customRender: "actions" },
  },
]);
// const columns3 = ref([
//   {
//     title: "开始时间",
//     dataIndex: "startTime",
//     key: "startTime",
//     width: 180,
//     sorter: true,
//   },
//   {
//     title: "结束时间",
//     dataIndex: "endTime",
//     key: "endTime",
//     width: 180,
//     sorter: true,
//   },
//   {
//     title: "结果",
//     dataIndex: "result",
//     key: "result",
//     width: 120,
//     scopedSlots: { customRender: "result" },
//   },
//   {
//     title: "版本号",
//     dataIndex: "edition",
//     key: "edition",
//     width: 200,
//   },
// ]);
const tableValue = ref([]);
const tableValue2 = ref([]);
const tableValue3 = ref([]);
const pagination = reactive({
  size: "small",
  total: 0,
  current: 1,
  pageSize: 15,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ["5", "10", "15", "20"],
  showTotal: (total, current) => {
    return `共${total}条记录，当前第${Math.ceil(current[0] / pagination.pageSize)}页`;
  },
  onChange: (page: number, pageSize: number) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
    getDataList("repeat");
  },
  onShowSizeChange: (current: number, size: number) => {
    pagination.current = current;
    pagination.pageSize = size;
    getDataList("repeat");
  },
});
const pagination2 = reactive({
  size: "small",
  total: 0,
  current: 1,
  pageSize: 5,
  onChange: (page: number, pageSize: number) => {
    pagination2.current = page;
    pagination2.pageSize = pageSize;
    getGraphEdition("repeat");
  },
});
const pagination3 = reactive({
  size: "small",
  total: 0,
  current: 1,
  pageSize: 5,
  onChange: (page, pageSize) => {
    pagination3.current = page;
    pagination3.pageSize = pageSize;
    checkUpdateDetail(details.value, "repeat");
  },
});
const editionModalShow = ref(false);
const strategyModalShow = ref(false);
const updateDetailModalShow = ref(false);
const isDisabled = ref(false);
const strategyValue = ref(0);
const cycleValue = ref(0);
const value1 = ref(undefined);
const value2 = ref(undefined);
const value3 = ref(0);
const value4 = ref([]);
const details = ref({});

onMounted(() => {
  getDataList("init");
});

const selectedRowKeys = ref([]);
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys;
};
const rowSelection = reactive({
  selectedRowKeys: selectedRowKeys,
  onChange: onSelectChange,
});

//todo rowSelection
// computed: {
//   rowSelection() {
//     return {
//       // columnTitle: "",
//       type: "radio",
//       selectedRowKeys: this.selectedRowKeys,
//       onChange: (selectedRowKeys) => {
//         this.selectedRowKeys = selectedRowKeys;
//       },
//     };
//   },
// },

//todo mapMutations
// ...mapMutations("graphOptions", {
//   setGraphId: "setGraphId",
//   setSchemaId: "setSchemaId",
//   setGraphSource: "setGraphSource",
// }),
const onSearch = async (type) => {
  searchLoading1.value = true;
  await getDataList(type);
  searchLoading1.value = false;
};

const onRefresh = async (type) => {
  //searchLoading2.value = true;
  await getDataList(type);
  //searchLoading2.value = false;
};

const getDataList = async (type) => {
  if (type === "init") {
    pagination.current = 1;
  }

  if (graphId.value) {
    const reg = /^[0-9]*$/;
    const flag = reg.test(graphId.value);
    if (!flag) {
      message.error("请输入正确的图谱编号！");
      return false;
    }
  }

  const json = {
    id: graphId.value === "" ? null : graphId.value,
    graphName: graphName.value === "" ? null : graphName.value,
    status: graphState.value,
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
    // source: 1, // pierce自己构建的图谱
  };
  searchLoading3.value = true;

  const data = await queryGraphByPage(json);

  searchLoading3.value = false;
  if (!data) {
    message.destroy();
    message.error("获取图列表失败");
  } else {
    pagination.total = parseInt(data.totalCount);

    tableValue.value = data.dateList.map((item) => {
      return {
        id: item.id,
        name: item.graphChName,
        desc: item.graphDesc,
        state: item.status,
        edition: item.version,
        stateText:
          item.status === "0"
            ? "已启用"
            : item.status === "1"
              ? "已停用"
              : item.status === "3"
                ? "创建中"
                : "创建失败",
        ruleList: item.ruleList.length ? item.ruleList : ["暂无应用"],
        createDate: item.createDate,
        updateStrategyStatus: item.updateStrategyStatus,
        effectStartDate: item.effectStartDate,
        effectEndDate: item.effectEndDate,
        cycleUnit: item.cycleUnit,
        checkDate: item.checkDate,
        branchId: item.branchId,
        schemaId: item.schemaId,
        graphSource: item.source,
      };
    });
  }
};

const onReset = () => {
  graphId.value = "";
  graphState.value = "";
  graphName.value = "";
  getDataList("init");
};

const handleDelete = (record) => {
  if (record.state !== "1" && record.state !== "4") return false;
  const content = "此操作将永久删除该数据，请确认是否继续？";
  const title = `确定要删除 ${record.name} 吗？`;
  const onOk = async () => {
    const json = {
      id: record.id,
    };
    const data = await deleteGraphTable(json);
    if (data.message === "成功") {
      getDataList("init");
      message.success("删除成功");
    } else {
      message.error(`删除失败，${data.message}`);
    }
  };
  modalConfirm(title, onOk, content);
};

const handleStop = (record) => {
  if (record.state !== "0" && record.state !== "1") return false;

  const action = record.state === "0" ? "停用" : "启用";
  const content = "";
  const title = `确定要${action} ${record.name} 吗？`;
  const onOk = async () => {
    const json = {
      id: record.id,
      status: record.state === "0" ? "1" : "0",
    };
    const data = await updateStatus(json);
    if (data.message === "成功") {
      message.success(`${action}成功`);
      getDataList("init");
    } else {
      message.error(`${action}失败 ${data.message}`);
    }
  };
  modalConfirm(title, onOk, content);
};

const handleAdd = () => {
  emit("isCreateShowChanged", true);
};

//todo  探索
// const handleSkip = (record) =>{
//   this.setGraphId(record.id);
//   this.setSchemaId(record.schemaId);
//   this.setGraphSource(record.graphSource);
//   sessionStorage.setItem("graphId", record.id);
//   sessionStorage.setItem("schemaId", record.schemaId);
//   sessionStorage.setItem("graphSource", record.graphSource);
//   this.$router.push({
//     name: "affairGraphAnalysis",
//     params: {
//       isSkip: true,
//     },
//   });
// }

const handleRetry = async (record) => {
  const json = {
    id: record.schemaId,
    graphName: record.name,
    graphDesc: record.desc,
  };
  const loading = message.loading("正在重试", 0);
  const res = await createGraph(json);
  loading();
  if (res.message === "成功") {
    getDataList("init");
  } else {
    message.error(res.message);
  }
};

const handleCheckEdition = async (record) => {
  if (record.state !== "0" && record.state !== "1") return;
  details.value = record;
  const loading = message.loading("正在查询", 0);
  await getGraphEdition("init");
  loading();
  editionModalShow.value = true;
};

const getGraphEdition = async (type) => {
  if (type === "init") {
    pagination2.current = 1;
  }
  const json = {
    id: details.value.id,
    pageNo: pagination2.current,
    pageSize: pagination2.pageSize,
  };
  const res = await queryGraphVersion(json);
  if (res.message === "成功") {
    tableValue2.value = res.data.dateList.map((item) => {
      if (item.checkBox) {
        selectedRowKeys.value = [item.id];
      }
      return {
        id: item.id,
        edition: {
          value: item.version,
          isCurrent: item.checkBox,
        },
        time: item.createDate,
      };
    });
    pagination2.total = parseInt(res.data.totalCount);
  } else {
    tableValue2.value = [];
    message.error(res.message);
  }
};

const onCancel = () => {
  editionModalShow.value = false;
};

const handleSelected = async () => {
  if (selectedRowKeys.value[0] === details.value.branchId) {
    // 版本未改变，直接关闭弹窗
    onCancel();
  } else {
    const json = {
      id: details.value.id,
      graphChName: details.value.name,
      branchId: selectedRowKeys.value[0],
    };
    const loading = message.loading("正在回溯至该版本", 0);
    const res = await selectGraphBranch(json);
    loading();
    if (res.message === "成功") {
      message.success("回溯成功！");
      onCancel();
    } else {
      message.error(res.message);
    }
  }
};

// const handleDeleteEdition = async (record) => {
//   if (pagination2.total === 1) return false;
//   const loading = message.loading("正在删除", 0);
//   const res = await delGraphBranch(record.id);
//   loading();
//   if (res.message === "成功") {
//     message.success("历史版本删除成功！");
//     getGraphEdition("init");
//   } else {
//     message.error(res.message);
//   }
// };

const handleOk = async () => {
  let updateStrategyStatus = undefined;
  if (strategyValue.value === 2) {
    // 周期更新
    if (cycleValue.value === 1) {
      // 固定周期
      if (!value1.value) {
        message.error("请选择固定周期更新时间！");
        return false;
      } else {
        updateStrategyStatus = value1.value;
      }
    } else {
      // 自定义周期
      updateStrategyStatus = cycleValue.value;
      if (!value2.value) {
        message.error("请输入自定义周期检测时间！");
        return false;
      }
    }
    if (!value4.value || !value4.value.length) {
      message.error("请选择生效时间段！");
      return false;
    }
  } else {
    updateStrategyStatus = strategyValue.value;
  }
  const json = {
    id: details.value.id,
    updateStrategyStatus,
    effectStartDate: value4.value[0],
    effectEndDate: value4.value[1],
    cycleUnit: value3.value,
    checkDate: value2.value,
  };
  const loading = message.loading("正在设置", 0);
  const res = await updateGraphTable(json);
  loading();
  if (res.message === "成功") {
    message.success("设置更新策略成功！");
    onStrategyCancel();
    getDataList("init");
  } else {
    message.error(res.message);
  }
};

const onStrategyCancel = () => {
  strategyModalShow.value = false;
  strategyValue.value = 0;
  cycleValue.value = 1;
  value1.value = undefined;
  value2.value = undefined;
  value3.value = 0;
  value4.value = [];
};

const handleSetStrategy = async (record) => {
  if (record.state !== "0" && record.state !== "1") return;
  details.value = record;
  const loading = message.loading("正在查询", 0);
  const res = await getGraphState(record.id);
  loading();
  if (res.data !== 0) {
    isDisabled.value = false;
  } else {
    isDisabled.value = true;
  }
  if (!record.effectEndDate || !record.effectStartDate) {
    value4.value = [];
  } else {
    value4.value = [
      moment(record.effectStartDate).format("YYYY-MM-DD"),
      moment(record.effectEndDate).format("YYYY-MM-DD"),
    ];
  }
  if (
    record.updateStrategyStatus === 1 ||
    record.updateStrategyStatus === 4 ||
    record.updateStrategyStatus === 5 ||
    record.updateStrategyStatus === 6
  ) {
    strategyValue.value = 2;
    cycleValue.value = 1;
    value1.value = record.updateStrategyStatus;
  } else {
    strategyValue.value = record.updateStrategyStatus;
    if (record.updateStrategyStatus === 2) {
      strategyValue.value = 2;
      cycleValue.value = 2;
      value2.value = record.checkDate;
      value3.value = record.cycleUnit;
    }
  }
  strategyModalShow.value = true;
};

const handleConfirm = () => {
  onUpdateDetailCancel();
};

const onUpdateDetailCancel = () => {
  updateDetailModalShow.value = false;
};

const checkUpdateDetail = async (record, type) => {
  if (record.state !== "0" && record.state !== "1") return;
  if (type === "init") {
    pagination3.current = 1;
  }
  details.value = record;
  const json = {
    id: record.id,
    pageNo: pagination3.current,
    pageSize: pagination3.pageSize,
  };
  const loading = message.loading("正在查询", 0);
  const res = await graphUpdateDetail(json);
  loading();
  if (res.message !== "成功") {
    message.error(res.message);
    return false;
  }

  tableValue3.value = res.data.dateList.map((item) => {
    return {
      id: item.id,
      startTime: item.startDate,
      endTime: item.endDate,
      result: item.status,
      edition: item.version,
    };
  });
  updateDetailModalShow.value = true;
};
</script>
<style lang="less">
.edition-modal {
  .ant-modal-title {
    font-weight: 600;
  }

  .ant-modal-body {
    padding: 0;
  }
  &-content {
    .edition-table {
      padding: 24px 24px 8px;

      .edition-slot {
        &-text {
          font-size: 14px;
          margin-right: 10px;
          color: @primaryTextColor;
        }

        &-label {
          color: @blue;
          padding: 0 8px;
          font-size: 12px;
          line-height: 20px;
          background: #e6f7ff;
          border: 1px solid #91d5ff;
        }
      }
    }

    &-footer {
      width: 100%;
      height: 52px;
      display: flex;
      padding: 0 24px;
      align-items: center;
      justify-content: flex-end;
      border-top: 1px solid @dividersColor;

      .footer-btn {
        &:first-child {
          margin-right: 8px;
        }
      }
    }
  }
}

.strategy-modal {
  .ant-modal-title {
    font-weight: 600;

    .info-circle {
      width: 12px;
      height: 12px;
      cursor: pointer;
      margin-left: 12px;
    }
  }

  &-tooltip {
    max-width: 320px;
  }

  &-content {
    .strategy-group {
      width: 100%;
      display: flex;
      justify-content: center;

      .ant-radio-wrapper {
        margin-right: 56px;
        color: @secondaryTextColor;

        &:last-child {
          margin-right: 0;
        }

        &.ant-radio-wrapper-checked {
          color: @primaryTextColor;
        }
      }
    }

    &-box {
      padding: 24px;
      margin-top: 24px;
      background: @backgroundColor;

      .cycle-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;

        .ant-radio-wrapper {
          width: 100%;
          margin-right: 0;
          margin-bottom: 16px;
        }

        &-title {
          width: 100px;
          margin-right: 24px;
          display: inline-block;
          color: @primaryTextColor;
        }

        &-input {
          width: 256px;

          &.left {
            width: 156px;
            margin-right: 8px;
          }

          &.right {
            width: 92px;
          }
        }
      }

      .box-item {
        padding-left: 24px;
      }
    }
  }
}

.update-detail-modal {
  .ant-modal-title {
    font-weight: 600;
  }

  .ant-modal-body {
    padding: 24px 24px 8px;
  }

  &-content {
    .header-title {
      color: @blue;
      font-size: 12px;
      margin-bottom: 16px;
    }

    .table-title {
      font-size: 12px;
      margin-bottom: 8px;
      color: @secondaryTextColor;
    }

    .update-table {
      .result-slot {
        &-text {
          .anticon,
          img {
            margin-right: 12px;

            &.blue {
              color: @blue;
            }
          }
        }
      }
    }
  }
}

.disabled {
  cursor: not-allowed;
  color: rgba(0, 0, 0, 0.25);
}
</style>
