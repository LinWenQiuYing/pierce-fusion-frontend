<template>
  <div class="create-graph">
    <div class="create-graph-header">
      <span class="create-graph-header-title">蓝图选择</span>
      <div class="create-graph-header-btns">
        <Button @click="handleReturn">返回</Button>
      </div>
    </div>
    <div class="create-graph-content">
      <div class="content-header">
        <span class="content-header-title">蓝图列表</span>
        <div class="content-header-btns">
          <Input
            v-model:value.trim="inputValue"
            class="content-header-btns-input"
            placeholder="请输入蓝图名称"
          >
            <search-outlined @click="getDataList('init')" />
          </Input>
          <Button class="header-btn" @click="onRefresh('repeat')">
            <template #icon><sync-outlined /></template>
            刷新
          </Button>
          <!-- <Button
            class="header-btn"
            @click="onRefresh('repeat')"
            :icon="searchLoading2 ? 'loading' : 'undo'"
            >刷新</Button
          > -->
        </div>
      </div>
      <table-component
        :columns="columns"
        :tableValue="tableValue"
        :rowKey="(record) => record.id"
        :pagination="pagination"
        :loading="searchLoading1"
        class="blueprint-table"
        :row-selection="rowSelection"
      >
      </table-component>
    </div>
    <div class="create-graph-footer">
      <Button class="footer-btn" @click="handleReturn">取消</Button>
      <Button
        class="footer-btn"
        type="primary"
        @click="handleCreate"
        :disabled="!selectedRowKeys.length"
        >创建图谱</Button
      >
    </div>
    <Modal
      :width="572"
      class="graph-details-info-modal"
      :visible="infoModalShow"
      :destroyOnClose="true"
      @ok="handleOk"
      @cancel="onCancel"
      centered
      title="图谱信息"
    >
      <div class="content-item">
        <span class="content-item-label">图谱名称：</span>
        <Input
          type="text"
          placeholder="请输入图谱名称"
          class="content-item-input"
          v-model:value.trim="graphName"
        />
      </div>
      <div class="content-item">
        <span class="content-item-label">图谱描述：</span>
        <Input.TextArea
          type="text"
          placeholder="请输入图谱描述"
          class="content-item-input"
          v-model:value:value.trim="graphDesc"
          :auto-size="{ minRows: 3, maxRows: 5 }"
        />
      </div>
    </Modal>
  </div>
</template>
<script setup lang="ts">
import TableComponent from "@/components/tableComponent.vue";
import { createGraph, getUsefulSchema } from "@/shared/api/graphsStructure.ts";
import { Button, Input, Modal, message } from "ant-design-vue";
import { onMounted, reactive, ref } from "vue";

const columns = ref([
  {
    title: "蓝图编号",
    dataIndex: "id",
    key: "id",
    width: 160,
  },
  {
    title: "蓝图名称",
    dataIndex: "name",
    key: "name",
    width: 200,
  },
  {
    title: "蓝图描述",
    dataIndex: "desc",
    key: "desc",
    width: 200,
  },
  {
    title: "创建时间",
    dataIndex: "createDate",
    key: "createDate",
    width: 150,
    sorter: true,
  },
  {
    title: "创建人",
    dataIndex: "createPerson",
    key: "createPerson",
    width: 109,
  },
]);
const tableValue = ref([]);
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
const searchLoading1 = ref(false); // 表格
//const searchLoading2 = ref(false); // 刷新按钮
const inputValue = ref(undefined);
const infoModalShow = ref(false);
const graphName = ref(undefined);
const graphDesc = ref(undefined);
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
//       onChange: (selectedRowKeys) => {
//         this.selectedRowKeys = selectedRowKeys;
//       },
//     };
//   },
// },

const emit = defineEmits(["isCreateShowChanged"]);

onMounted(() => {
  getDataList("init");
});

const getDataList = async (type) => {
  if (type === "init") {
    pagination.current = 1;
  }
  const json = {
    graphName: inputValue.value === "" ? null : inputValue.value,
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
  };
  searchLoading1.value = true;
  const res = await getUsefulSchema(json);
  searchLoading1.value = false;
  if (res.message !== "成功") {
    message.error("获取图列表失败");
  } else {
    pagination.total = parseInt(res.data.totalCount);
    tableValue.value = res.data.dateList.map((item) => {
      return {
        id: item.id,
        name: item.graphName,
        desc: item.graphDesc,
        createDate: item.createDate,
        createPerson: item.createUser,
      };
    });
  }
};

const onRefresh = async (type) => {
  //searchLoading2.value = true;
  await getDataList(type);
  //searchLoading2.value = false;
};

const handleReturn = (isSearch) => {
  emit("isCreateShowChanged", false, isSearch);
};

const handleOk = async () => {
  if (!graphName.value) {
    message.error("请输入图谱名称！");
    return false;
  }
  const json = {
    id: selectedRowKeys.value[0],
    graphName: graphName.value,
    graphDesc: graphDesc.value,
  };
  const loading = message.loading("正在创建图谱", 0);
  const res = await createGraph(json);
  loading();
  if (res.message === "成功") {
    message.success("创建图谱成功！");
    handleReturn(true);
  } else {
    message.error(res.message);
  }
  onCancel();
};

const handleCreate = () => {
  infoModalShow.value = true;
};

const onCancel = () => {
  infoModalShow.value = false;
};
</script>
<style lang="less">
.create-graph {
  height: 100%;
  display: flex;
  overflow: auto;
  flex-direction: column;

  &-header {
    top: 0;
    left: 0;
    right: 0;
    z-index: 9;
    height: 74px;
    padding: 24px;
    display: flex;
    position: absolute;
    background: #fff;
    align-items: center;
    justify-content: space-between;

    &-title {
      font-size: 20px;
      font-weight: 600;
    }
  }

  &-content {
    margin-top: 74px;
    height: calc(100% - 126px);
    background: @contentColor;

    .content-header {
      height: 54px;
      display: flex;
      padding: 0 24px;
      line-height: 54px;
      align-items: center;
      margin-bottom: 24px;
      justify-content: space-between;
      border-bottom: 1px solid #d9d9d9;

      &-title {
        font-size: 16px;
        font-weight: 600;
        color: @primaryTextColor;
      }

      &-btns {
        display: flex;

        &-input {
          margin-right: 16px;

          .ant-input {
            border: 1px solid @borderColor;
          }

          .ant-input-suffix {
            right: 0;
            width: 32px;
            height: 32px;
            display: flex;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            border-left: 1px solid @borderColor;
          }
        }
      }
    }

    .blueprint-table {
      padding: 0 24px;
      height: calc(100% - 78px);
    }
  }

  &-footer {
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    display: flex;
    padding: 10px 24px;
    position: absolute;
    background: #fff;
    align-items: center;
    justify-content: flex-end;
  }
}

.graph-details-info-modal {
  .ant-modal-content {
    .ant-modal-header {
      .ant-modal-title {
        font-size: 16px;
        font-weight: 600;
        color: @primaryTextColor;
      }
    }

    .ant-modal-body {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;

      .content-item {
        width: 336px;
        display: flex;

        &:not(:last-child) {
          margin-bottom: 16px;
        }

        &-label {
          width: 80px;
          line-height: 32px;
          color: @primaryTextColor;
        }

        &-input {
          width: calc(100% - 80px);
        }
      }
    }

    .ant-modal-footer {
      padding: 10px 24px;
    }
  }
}
</style>
