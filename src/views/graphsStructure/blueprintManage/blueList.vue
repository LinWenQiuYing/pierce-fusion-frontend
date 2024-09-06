<template>
  <TableList
    tableTitle="蓝图列表"
    listClass="blue-list"
    :columns="columns"
    :tableValue="tableValue"
    :pagination="pagination"
    :tableLoading="searchLoading3"
    tableClass="blueprint-table"
    :rowKey="(record) => record.id"
    isDefaultFold
  >
    <template v-slot:searchOptions>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">蓝图编号：</span>
        <Input
          class="table-list-top-item-input"
          type="text"
          allow-clear
          v-model:value.trim="graphId"
          placeholder="请输入图编号"
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">蓝图名称：</span>
        <Input
          class="table-list-top-item-input"
          type="text"
          allow-clear
          v-model:value.trim="graphName"
          placeholder="请输入图名称"
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">蓝图状态：</span>
        <Select
          class="table-list-top-item-input"
          v-model:value="graphState"
          placeholder="请选择状态"
        >
          <Select.Option value="">全部</Select.Option>
          <Select.Option :value="0">草稿</Select.Option>
          <Select.Option :value="1">构图失败</Select.Option>
          <Select.Option :value="2">构图成功</Select.Option>
        </Select>
      </div>
      <div class="table-list-top-item">
        <Button @click="onReset">重置</Button>
        <Button
          type="primary"
          @click="onSearch('init')"
          :loading="searchLoading1"
          v-if="userRights.btn_schemaQuery"
        >
          查询
        </Button>
      </div>
    </template>
    <template v-slot:tableBtns>
      <Button class="header-btn" @click="onRefresh('repeat')" v-if="userRights.btn_schemaQuery">
        <template #icon><sync-outlined /></template>
        刷新
      </Button>
      <Button
        class="header-btn"
        @click="handleAdd"
        type="primary"
        v-if="userRights.btn_schemaCreateOrEdit"
      >
        <template #icon><file-add-outlined /></template>
        新建
      </Button>
    </template>
    <template v-slot:actionsSlot="{ record }">
      <a @click="handleCheck(record)" v-if="userRights.btn_schemaDetail" style="margin-right: 12px"
        >查看</a
      >
      <a
        v-if="userRights.btn_schemaCreateOrEdit"
        @click="handleEdit(record)"
        :class="record.state === 2 ? 'disabled' : ''"
        style="margin-right: 12px"
        >编辑</a
      >
      <a
        @click="handleCopy(record)"
        v-if="userRights.btn_schemaCreateOrEdit"
        style="margin-right: 12px"
        >复制</a
      >
      <a
        @click="handleDelete(record)"
        v-if="userRights.btn_schemaDelete"
        :class="record.state === 2 ? 'disabled' : ''"
        >删除</a
      >
      <a
        v-if="
          !userRights.btn_schemaDetail &&
          !userRights.btn_schemaCreateOrEdit &&
          !userRights.btn_schemaDelete
        "
        class="no-action"
      >
        暂无操作权限
      </a>
    </template>
  </TableList>
</template>
<script setup lang="ts">
import TableList from "@/components/tableList.vue";
//todo Badge
import { deleteSchema, getSchemaDetail, querySchemaList } from "@/shared/api/graphsStructure.ts";
import { modalConfirm } from "@/utils/common.ts";
import { useUserStore } from "@store/user";
import { Button, Input, message, Select } from "ant-design-vue";
import { computed, onMounted, reactive, ref } from "vue";

const emit = defineEmits(["detailsChanged", "isDetailsShowChanged"]);

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
const columns = ref([
  {
    title: "蓝图编号",
    dataIndex: "id",
    key: "id",
    width: 130,
  },
  {
    title: "蓝图名称",
    dataIndex: "name",
    key: "name",
    width: 150,
  },
  {
    title: "蓝图描述",
    dataIndex: "desc",
    key: "desc",
    width: 160,
  },
  {
    title: "创建时间",
    dataIndex: "createDate",
    key: "createDate",
    width: 120,
    sorter: true,
  },
  {
    title: "创建人",
    dataIndex: "createPerson",
    key: "createPerson",
    width: 100,
  },
  {
    title: "状态",
    dataIndex: "stateText",
    key: "stateText",
    width: 105,
    //todo
    // customRender: (text, record) => {
    //   return (
    //     <a-badge
    //       color={
    //         record.state === 2
    //           ? "#52C41A"
    //           : record.state === 0
    //           ? "rgba(0, 0, 0, 0.25)"
    //           : "#F5222D"
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
    scopedSlots: { customRender: "actions" },
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
      message.error("请输入正确的蓝图编号！");
      return false;
    }
  }
  const json = {
    id: graphId.value === "" ? null : graphId.value,
    graphName: graphName.value === "" ? null : graphName.value,
    status: graphState.value,
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
  };
  searchLoading3.value = true;
  // try {
  //   res = await querySchemaList(json);
  // } catch (error) {
  //   console.log(error);
  // }
  const res = await querySchemaList(json);
  searchLoading3.value = false;
  if (!res) {
    message.destroy();
    message.error("获取蓝图列表失败");
  } else {
    pagination.total = parseInt(res.data.totalCount);
    tableValue.value = res.data.dateList.map((item) => {
      return {
        id: item.id,
        name: item.graphName,
        desc: item.graphDesc,
        state: item.status,
        stateText: item.status === 0 ? "草稿" : item.status === 1 ? "构图失败" : "构图成功",
        createDate: item.createDate,
        createPerson: item.createUser,
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
  if (record.state === 2) return false;

  const title = `确定要删除 ${record.name} 吗？`;
  const content = "此操作将永久删除该数据，请确认是否继续？";
  const onOk = async () => {
    const data = await deleteSchema(record.id);
    if (data.message === "成功") {
      getDataList("init");
      message.success("删除成功");
    } else {
      message.error(`删除失败，${data.message}`);
    }
  };
  modalConfirm(title, onOk, content);
};

const handleEdit = (record) => {
  getGraphDetails(record, "edit");
};

const handleAdd = () => {
  emit("detailsChanged", {});
  emit("isDetailsShowChanged", true, "add");
};

const handleCheck = (record) => {
  getGraphDetails(record, "check");
};

const getGraphDetails = async (record, type) => {
  const loading = message.loading("正在查询", 0);
  const res = await getSchemaDetail(record.id);
  loading();
  if (res.message === "成功") {
    const graphData = getGraphData(res);
    res.data.graphData = graphData;
    res.data.sourceValue = res.data.dsName;
    res.data.databaseValue = res.data.dataSourceId;
    emit("detailsChanged", res.data);
    emit("isDetailsShowChanged", true, type);
  } else {
    message.error(res.message);
  }
};

const getGraphData = (res) => {
  const graphData = {
    nodes: res.data.graphVertex.map((node) => {
      let keyValue = undefined;
      const attrValue = [];
      const attrValueAll = [];
      const tableValue = [];
      node.fields.map((item, index) => {
        attrValue.push(item.tableName + "_" + item.fieldName);
        attrValueAll.push({
          key: item.tableName + "_" + item.fieldName,
          label: item.fieldName,
          parent: item.tableName,
          type: item.fieldType,
        });
        tableValue.push({
          id: index,
          tableName: item.tableName,
          fieldName: item.fieldName,
          isShow: item.fieldDisplay === "1" ? true : false,
          key: item.tableName + "_" + item.fieldName,
          showName: item.fieldAlias,
          type: item.fieldType,
        });
        if (item.isPk) {
          keyValue = item.tableName + "_" + item.fieldName;
        }
      });
      const iconValue = (node.icon && node.icon.split(",")) || undefined;
      let fill = null;
      let stroke = null;
      let lineWidth = 0;
      let icon = node.icon
        ? {
            show: true,
          }
        : {
            show: false,
          }; // 如果有图标，则赋值true，如果没有图标，则先赋值false，然后在下面判断结束后更改为true ———— 解决编辑或复制时更换不了图标的bug
      if (node.baseStyle === "2") {
        fill = "#fff";
        stroke = node.color;
        lineWidth = 1.5;
        if (icon && icon.show) {
          icon.width = node.size;
          icon.height = node.size;
          icon.img =
            iconValue.length === 4
              ? require(
                  `@/assets/theme/${iconValue[0]}/${iconValue[1]}/${iconValue[2]}/${iconValue[3]}.svg`
                )
              : null;
        } else {
          // 解决编辑或复制时更换不了图标的bug
          icon.show = true;
        }
      } else if (node.baseStyle === "3") {
        if (icon && icon.show) {
          icon.width = node.size;
          icon.height = node.size;
          icon.img =
            iconValue.length === 4
              ? require(
                  `@/assets/theme/${iconValue[0]}/${iconValue[1]}/${iconValue[2]}/${iconValue[3]}.svg`
                )
              : null;
        } else {
          // 解决编辑或复制时更换不了图标的bug
          icon.show = true;
        }
      } else {
        fill = node.color;
        stroke = node.color;
        lineWidth = 0;
        if (icon && icon.show) {
          icon.width = node.size;
          icon.height = node.size;
          icon.img =
            iconValue.length === 4
              ? require(
                  `@/assets/theme/${iconValue[0]}/${iconValue[1]}/${iconValue[2]}/${iconValue[3]}.svg`
                )
              : null;
        } else {
          // 解决编辑或复制时更换不了图标的bug
          icon.show = true;
        }
      }
      return {
        type: "circle",
        id: node.id,
        label: node.label,
        size: node.size,
        icon,
        style: {
          fill,
          stroke,
          lineWidth,
        },
        data: {
          attrValue,
          attrValueAll,
          colorValue: node.color,
          iconValue,
          inputValue: node.label,
          keyValue,
          sizeValue: node.size,
          styleValue: node.baseStyle,
          tableValue,
        },
      };
    }),
    edges: res.data.graphEdge.map((edge) => {
      let keyValue = undefined;
      const attrValue = [];
      const attrValueAll = [];
      const tableValue = [];
      edge.fields.map((item, index) => {
        attrValue.push(item.tableName + "_" + item.fieldName);
        attrValueAll.push({
          key: item.tableName + "_" + item.fieldName,
          label: item.fieldName,
          parent: item.tableName,
          type: item.fieldType,
        });
        tableValue.push({
          id: index,
          tableName: item.tableName,
          fieldName: item.fieldName,
          startOrEnd: item.analyzedFrom === "0" ? "start" : item.analyzedFrom === "1" ? "end" : "",
          isShow: item.fieldDisplay === "1" ? true : false,
          key: item.tableName + "_" + item.fieldName,
          showName: item.fieldAlias,
          type: item.fieldType,
        });
        if (item.isPk) {
          keyValue = item.tableName + "_" + item.fieldName;
        }
      });
      return {
        type: "line",
        id: edge.id,
        label: edge.label,
        source: edge.srcFieldId,
        target: edge.dstFieldId,
        style: {
          stroke: edge.color,
          lineWidth: edge.size,
          lineDash: edge.baseStyle === "2" ? [5, 5] : [],
        },
        data: {
          attrValue,
          attrValueAll,
          colorValue: edge.color,
          inputValue: edge.label,
          keyValue,
          sizeValue: edge.size,
          styleValue: edge.baseStyle,
          tableValue,
        },
      };
    }),
  };
  return graphData;
};

const handleCopy = async (record) => {
  const loading = message.loading("正在查询", 0);
  const res = await getSchemaDetail(record.id);
  loading();
  const details = {};
  if (res.message === "成功") {
    const graphData = getGraphData(res);
    details.dataSourceId = res.data.dataSourceId;
    details.databaseValue = res.data.databaseValue;
    details.graphData = graphData;
    details.id = "";
    emit("detailsChanged", details);
    emit("isDetailsShowChanged", true, "copy");
  } else {
    message.error(res.message);
  }
};

onMounted(() => {
  getDataList("init");
});
</script>
<style lang="less">
.blueprint-manage {
  height: 100%;

  &-top {
    display: flex;
    padding: 24px;
    margin-bottom: 24px;
    background: @contentColor;

    &-item {
      display: flex;
      margin-right: 36px;
      align-items: center;
      width: calc((100% - 108px) / 4);

      &:nth-child(4) {
        margin-right: 0;
        justify-content: flex-end;
      }

      &-label {
        width: 75px;
      }

      &-input {
        max-width: 275px;
        width: calc(100% - 75px) !important;
      }

      .ant-btn:first-child {
        margin-right: 12px;
      }
    }
  }

  &-bottom {
    height: calc(100% - 104px);
    background: @contentColor;

    .bottom-header {
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

      .header-btn {
        &:not(:last-child) {
          margin-right: 8px;
        }
      }
    }

    .graph-table {
      padding: 0 24px;
      height: calc(100% - 78px);

      .ant-table-row-cell-break-word,
      .state-text {
        color: #949dad;
      }
    }
  }

  .disabled {
    cursor: not-allowed;
    color: @disabledColor;
  }
}
</style>
