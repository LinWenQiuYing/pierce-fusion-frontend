<template>
  <TableList
    listClass="template-list"
    tableTitle="模板列表"
    isDefaultFold
    :columns="columns"
    :tableValue="tableValue"
    :pagination="pagination"
    :tableLoading="tableLoading"
    tableClass="template-table"
    :rowKey="(record) => record.code"
  >
    <template v-slot:searchOptions="{ isFold, handleFold }">
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">模板编号：</span>
        <Input
          allow-clear
          class="table-list-top-item-input"
          type="text"
          v-model:vlue.trim="templateId"
          placeholder="模板编号"
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">模板名称：</span>
        <Input
          allow-clear
          class="table-list-top-item-input"
          type="text"
          v-model:vlue.trim="templateName"
          placeholder="模板名称"
        />
      </div>
      <div class="table-list-top-item" v-show="!isFold">
        <span class="table-list-top-item-label">创建方式：</span>
        <Select class="table-list-top-item-input" v-model:vlue="createType" placeholder="创建方式">
          <Select.Option value="">全部</Select.Option>
          <Select.Option :value="1">配置化</Select.Option>
          <Select.Option :value="2">脚本化</Select.Option>
        </Select>
      </div>
      <div class="table-list-top-item" v-show="!isFold">
        <span class="table-list-top-item-label">模板描述：</span>
        <Input
          allow-clear
          class="table-list-top-item-input"
          type="text"
          v-model:value.trim="templateDesc"
          placeholder="模板描述"
        />
      </div>
      <div class="table-list-top-item" v-show="!isFold">
        <span class="table-list-top-item-label">模板状态：</span>
        <Select
          class="table-list-top-item-input"
          v-model:vlue="templateState"
          placeholder="模板状态"
        >
          <Select.Option value="">全部</Select.Option>
          <Select.Option :value="0">启用</Select.Option>
          <Select.Option :value="1">停用</Select.Option>
        </Select>
      </div>
      <div class="table-list-top-item">
        <Button @click="onReset"> 重置 </Button>
        <Button
          type="primary"
          @click="onSearch('init')"
          :loading="tableLoading"
          v-if="userRights.btn_queryTemplateByPage"
        >
          查询
        </Button>
        <Button class="fold-btn" @click="handleFold">
          {{ isFold ? "展开" : "收起" }}
          <up-outlined v-if="!isFold" />
          <down-outlined v-if="isFold" />
        </Button>
      </div>
    </template>
    <template v-slot:tableBtns>
      <Button class="add-btn" @click="onSearch('repeat')">
        <template #icon><sync-outlined /></template>
        刷新
      </Button>
      <Button class="add-btn" @click="handleAdd" type="primary">
        <template #icon><file-add-outlined /></template>
        新建
      </Button>
    </template>
    <template v-slot:actionsSlot="{ record }">
      <a
        @click="handleCheck(record)"
        v-if="userRights.btn_getTemplateDetails"
        style="margin-right: 12px"
        >查看</a
      >
      <a
        @click="handleCreateModel(record)"
        v-if="userRights.btn_createModelByTempId"
        style="margin-right: 12px"
        >创建模型</a
      >
      <Popover overlayClassName="more-actions">
        <template v-slot:content>
          <p
            @click="handleEdit(record)"
            :class="record.status === 0 ? 'disabled' : ''"
            v-if="userRights.btn_editTemplate"
          >
            编辑
          </p>
          <p @click="startTemplate(record)" v-if="userRights.btn_updateTemplateStatus">
            {{ record.status === 0 ? "停用" : "启用" }}
          </p>
          <p
            :class="record.status === 0 ? 'disabled' : 'del'"
            @click="handleDelete(record)"
            v-if="userRights.btn_delTemplate"
          >
            删除
          </p>
        </template>
        <a>更多</a>
      </Popover>
      <a
        v-if="
          !userRights.btn_getTemplateDetails &&
          !userRights.btn_updateTemplateStatus &&
          !userRights.btn_delTemplate &&
          !userRights.btn_editTemplate
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
import {
  delTemplate,
  getTemplateDetails,
  queryTemplateByPage,
  updateTemplateStatus,
} from "@/shared/api/configManage.ts";
import { paginationType } from "@/types/templatesManage.ts";
import { modalConfirm } from "@/utils/common";
import { useUserStore } from "@store/user";
import { Button, Input, message, Popover, Select } from "ant-design-vue";
import { computed, h, onMounted, reactive, ref } from "vue";

const emit = defineEmits([
  "detailsChanged",
  "isListShowChanged",
  "isDetailsShowChanged",
  "detailsTypeChanged",
  "handleCreateModel",
  "getCategoryList",
]);

const userStore = useUserStore();
const userRights = computed(() => {
  return userStore.userRights;
});

const templateId = ref(undefined);
const templateState = ref("");
const templateName = ref(undefined);
const templateDesc = ref(undefined);
const createType = ref("");
const tableLoading = ref(false);
const columns = ref([
  {
    title: "模板编号",
    dataIndex: "code",
    key: "code",
    width: 200,
  },
  {
    title: "模板名称",
    dataIndex: "name",
    key: "name",
    width: 200,
  },
  {
    title: "模板描述",
    dataIndex: "desc",
    key: "desc",
    width: 300,
    // customRender: (text, record, index) => {
    //   if (text) {
    //     return (
    //       <a-tooltip placement="topLeft" overlayClassName="desc-content">
    //         <template slot="title">{text}</template>
    //         {strReduct(text, 16)}
    //       </a-tooltip>
    //     );
    //   } else {
    //     return text;
    //   }
    // },
  },
  {
    title: "创建方式",
    dataIndex: "createType",
    key: "createType",
    width: 100,
    customRender: (text) => {
      if (text.text === 1) {
        return h("span", { class: "way-slot-item item-config" }, "配置化");
      } else {
        return h("span", { class: "way-slot-item item-sql" }, "脚本化");
      }
    },
  },
  {
    title: "创建时间",
    dataIndex: "createDate",
    key: "createDate",
    width: 200,
  },
  {
    title: "创建人",
    dataIndex: "createPerson",
    key: "createPerson",
    width: 120,
  },
  {
    title: "模板状态",
    dataIndex: "stateText",
    key: "stateText",
    width: 100,
    customRender: (text: any) => {
      if (text.text === "启用") {
        return h("a", { class: "status-cell" }, [
          h("span", { class: "publish dot" }),
          h("span", { class: "status-text" }, "启用"),
        ]);
      } else {
        return h("a", { class: "status-cell" }, [
          h("span", { class: "draft dot" }),
          h("span", { class: "status-text" }, "停用"),
        ]);
      }
    },
  },
  {
    title: "操作",
    dataIndex: "actions",
    key: "actions",
    width: 200,
    scopedSlots: { customRender: "actions" },
    fixed: "right",
  },
]);
const tableValue = ref([]);
const pagination: paginationType = reactive({
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
    onSearch("repeat");
  },
  onShowSizeChange: (current: number, size: number) => {
    pagination.current = current;
    pagination.pageSize = size;
    onSearch("repeat");
  },
});

const onSearch = async (type: string) => {
  tableLoading.value = true;
  if (type === "init") {
    pagination.current = 1;
  }
  const json = {
    name: templateName.value,
    code: templateId.value,
    desc: templateDesc.value,
    createType: createType.value,
    status: templateState.value,
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
  };
  const data = await queryTemplateByPage(json);
  if (!data) {
    message.error("获取模板列表失败！");
  } else {
    pagination.total = parseInt(data.totalCount);
    tableValue.value = data.dateList.map((item) => {
      return {
        id: item.id,
        code: item.code,
        name: item.name,
        desc: item.desc,
        status: item.status,
        createType: item.createType,
        stateText: item.status === 0 ? "启用" : "停用",
        createDate: item.createDate || item.updateDate,
        createPerson: item.createUser,
        schemaId: item.schemaid,
      };
    });
  }
  tableLoading.value = false;
};

const handleCheck = async (record) => {
  const res = await getTemplateDetail(record);
  if (res) {
    emit("detailsChanged", res);
    emit("isListShowChanged", false);
    emit("isDetailsShowChanged", true);
    emit("detailsTypeChanged", "check");
  }
};

const getTemplateDetail = async (record) => {
  const loading = message.loading("正在查询", 0);
  const res = await getTemplateDetails(record.id, record.createType);
  loading();
  if (!res) {
    message.error("模板获取失败，请重试！");
    return false;
  } else {
    if (res.createType === 1) {
      // 配置化
      const condition = JSON.parse(res.condition) || undefined;
      const modelInfo = JSON.parse(res.schemaInfo) || undefined;
      if (condition && modelInfo) {
        res.matchList = condition.matchList;
        res.rulesGroup = condition.rulesGroup;
        res.sentenceContent = res.templateScript;
        res.modelInfo = modelInfo;

        // 重置nodeIndex、edgeIndex与pathIndex
        let nodeIndex = 0;
        let edgeIndex = 0;
        modelInfo.vertexMetas.map((node) => {
          const index = parseInt(node.name.slice(1));
          if (index > nodeIndex) {
            nodeIndex = index;
          }
        });
        modelInfo.edgeMetas.map((edge) => {
          const index = parseInt(edge.name.slice(1));
          if (index > edgeIndex) {
            edgeIndex = index;
          }
        });
        res.nodeIndex = nodeIndex;
        res.edgeIndex = edgeIndex + 1;
        res.pathIndex = condition.matchList.length - 1;
      } else {
        message.error("获取模型结构失败！");
      }
    } else {
      res.data = res.paramList.map((item, index) => ({
        id: index,
        index: item.paramName,
        type: item.paramType < 3 ? [item.paramType] : ["Enum", item.paramType],
        content: item.paramDesc,
        example:
          item.paramType < 3
            ? item.paramEg
            : item.enums.map((ele, index) => ({
                index: index + 1,
                text: ele.paramValue,
                content: ele.paramDesc,
              })),
      }));
    }
  }
  return res;
};

const handleEdit = async (record) => {
  if (record.status === 0) return false;
  const res = await getTemplateDetail(record);
  emit("detailsChanged", res);
  emit("isListShowChanged", false);
  emit("isDetailsShowChanged", true);
  emit("detailsTypeChanged", "edit");
};

const handleDelete = (record) => {
  if (record.status === 0) return false;
  const title = `确定要删除 ${record.name} 吗？`;
  const content = "此操作将永久删除该数据，请确认是否继续？";
  const onOk = async () => {
    const json = {
      id: record.id,
    };
    const data = await delTemplate(json);
    if (data.message === "成功") {
      message.success("删除成功");
      onSearch("init");
    } else {
      message.error(`删除失败，${data.message}`);
    }
  };
  modalConfirm(title, onOk, content);
};

const startTemplate = (record) => {
  const action = record.status === 0 ? "停用" : "启用";
  const title = `确定要${action} ${record.name} 吗？`;
  const content = "";
  const onOk = async () => {
    const json = {
      id: record.id,
      status: record.status === 0 ? 1 : 0,
    };
    const data = await updateTemplateStatus(json);
    if (data.message === "成功") {
      message.success(`${action}成功`);
      onSearch("init");
    } else {
      message.error(`${action}失败 ${data.message}`);
    }
  };
  modalConfirm(title, onOk, content);
};

const onReset = () => {
  templateId.value = undefined;
  templateState.value = "";
  templateName.value = undefined;
  createType.value = "";
  templateDesc.value = undefined;
  onSearch("init");
};

const handleAdd = () => {
  const details = {
    id: undefined,
    name: undefined,
    desc: undefined,
    data: [],
    schemaId: undefined,
    templateScript: undefined,
    createType: 2,
  };
  emit("detailsChanged", details);
  emit("isListShowChanged", false);
  emit("isDetailsShowChanged", true);
  emit("detailsTypeChanged", "add");
};
const handleCreateModel = (record) => {
  emit("isListShowChanged", false);
  emit("isDetailsShowChanged", false);
  emit("handleCreateModel", record);
  emit("getCategoryList");
};

onMounted(() => {
  onSearch("init");
});
</script>
<style lang="less">
.template-list {
  .table-list-top-item {
    width: calc((100% - 64px) / 4);
  }
  .table-list-bottom {
    .template-table {
      .status-cell {
        display: flex;
        align-items: center;

        .dot {
          opacity: 1;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-right: 8px;
          display: inline-block;
        }

        .publish {
          background: #19be6b;
        }

        .draft {
          // background: #a5aab3;
          background: #f5222d;
        }
      }

      .ant-table-row-cell-break-word,
      .status-text {
        // color: #949dad;
        color: #1d2129;
      }

      .way-slot {
        &-item {
          font-size: 12px;
          padding: 2px 10px;
        }
      }

      .item-config {
        color: #13c2c2;
        background: #e6fffb;
        border: 1px solid #87e8de;
      }

      .item-sql {
        color: #1890ff;
        background: #e6f7ff;
        border: 1px solid #91d5ff;
      }
    }
  }
}

.more-actions {
  .ant-popover-content {
    .ant-popover-inner {
      .ant-popover-inner-content {
        p {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
