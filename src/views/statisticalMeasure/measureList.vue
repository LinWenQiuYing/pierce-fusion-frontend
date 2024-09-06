<template>
  <div class="measure-list-wrapper">
    <TableList
      listClass="measure-list"
      tableClass="measure-table"
      isDefaultFold
      tableTitle="统计度量列表"
      :columns="columns"
      :tableValue="tableValue"
      :pagination="pagination"
      :tableLoading="tableLoading"
      :rowKey="(record) => record.id"
    >
      <template v-slot:searchOptions>
        <!-- <header class="hd">
          <icon-svg icon-class="icon_statisticalMeasure" class="title-icon" />
          <h2 class="title">统计度量管理</h2>
        </header> -->
        <div class="table-list-top-item">
          <span class="table-list-top-item-label">统计度量编号：</span>
          <Input
            allow-clear
            class="table-list-top-item-input"
            type="text"
            v-model:value.trim="measureCode"
            placeholder="请输入统计度量编号"
          />
        </div>
        <div class="table-list-top-item">
          <span class="table-list-top-item-label">蓝图结构：</span>
          <Select
            class="table-list-top-item-input"
            placeholder="请选择蓝图"
            v-model:value.trim="schemaId"
            allowClear
          >
            <Select.Option :value="id" :key="id" v-for="id in Object.keys(schemaMap)">{{
              schemaMap[id]
            }}</Select.Option>
          </Select>
        </div>
        <div class="table-list-top-item">
          <span class="table-list-top-item-label">创建人：</span>
          <Input
            allow-clear
            class="table-list-top-item-input"
            type="text"
            v-model:value.trim="createUser"
            placeholder="请输入创建人"
          />
        </div>
        <div class="table-list-top-item">
          <Button @click="onReset"> 重置 </Button>
          <Button type="primary" @click="onSearch('init')" v-if="userRights.btn_queryMeasureByPage">
            查询
          </Button>
        </div>
      </template>
      <template v-slot:tableBtns>
        <Button @click="onSearch('repeat')">
          <template #icon>
            <SyncOutlined />
          </template>
          刷新
        </Button>
        <Button icon="file-add" type="primary" @click="onAdd" v-if="userRights.btn_addMeasure">
          新建
        </Button>
      </template>
      <template v-slot:actionsSlot="{ record }">
        <a @click="onCheck(record)" v-if="userRights.btn_detailMeasure">查看</a>

        <a @click="onEdit(record)" v-if="userRights.btn_editMeasure">编辑</a>

        <a @click="onCopy(record)" v-if="userRights.btn_copyMeasure">复制</a>

        <a class="del" @click="onDel(record)" v-if="userRights.btn_delMeasure">删除</a>
        <a class="no-action" v-if="noAction">暂无操作权限</a>
      </template>
    </TableList>
    <Modal
      v-model:visible="isCopyModalshow"
      title="统计度量复制"
      width="572px"
      dialogClass="copy-dialog"
      centered
      @ok="handleOk"
      @cancel="copyFormReset"
    >
      <Form ref="copyFormRef" layout="vertical" :model="copyForm" :rules="copyRules">
        <Form.Item label="度量名称：" name="name">
          <Input v-model:value="copyForm.name" placeholder="度量名称" defaultValue="" />
        </Form.Item>
        <Form.Item label="图谱选择：" name="schemaId">
          <Select v-model:value="copyForm.schemaId">
            <Select.Option :value="id" :key="id" v-for="id in Object.keys(schemaMap)">{{
              schemaMap[id]
            }}</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="度量描述：" name="desc">
          <Input.Textarea
            v-model:value="copyForm.desc"
            placeholder="这是一段关于该统计度量的描述..."
            :auto-size="{ minRows: 6, maxRows: 8 }"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import {
  delMeasure,
  measureCopy,
  queryGraphSchema,
  queryMeasureByPage,
} from "@/shared/api/measure";
import { MeasureListItemType, MeasureListStateType } from "@/types";
import { modalConfirm } from "@/utils/common";
import { SyncOutlined } from "@ant-design/icons-vue";
import { useUserStore } from "@store/user";
import type { FormInstance } from "ant-design-vue";
import { Button, Form, Input, Modal, Select, message } from "ant-design-vue";
import type { Rule } from "ant-design-vue/es/form";
import { computed, onMounted, reactive, ref, toRefs } from "vue";

const store = useUserStore();

const emit = defineEmits<{
  (event: "update:checkType", value: string): any;
  (event: "update:record", record: MeasureListItemType | null): any;
  (event: "update:isListShow", value: boolean): any;
}>();

const userRights = computed(() => {
  return store.userRights;
});

const copyRules: Record<string, Rule[]> = {
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

const copyFormRef = ref<FormInstance>();

const listState: MeasureListStateType = reactive({
  record: null,
  // table
  measureCode: undefined,
  measureName: undefined,
  createUser: undefined,
  schemaId: undefined,
  schemaMap: {},
  tableLoading: false,
  tableValue: [],
  graghMap: {},
  pagination: {
    size: "small",
    total: 0,
    current: 1,
    pageSize: 15,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["5", "10", "15", "20"],
    showTotal: (total, current) => {
      return `共${total}条记录，当前第${Math.ceil(current[0] / (listState.pagination.pageSize as number))}页`;
    },
    onChange: (page, pageSize) => {
      listState.pagination.current = page;
      listState.pagination.pageSize = pageSize;
      onSearch("repeat");
    },
    onShowSizeChange: (current, size) => {
      listState.pagination.current = current;
      listState.pagination.pageSize = size;
      onSearch("repeat");
    },
  },
  // show
  isCopyModalshow: false,
  // copyForm
  copyForm: {
    name: undefined,
    schemaId: undefined,
    desc: undefined,
  },
});

const {
  tableLoading,
  tableValue,
  pagination,
  measureCode,
  schemaId,
  schemaMap,
  createUser,
  isCopyModalshow,
  copyForm,
} = toRefs(listState);

const columns = [
  {
    title: "序号",
    dataIndex: "num",
    key: "num",
    customRender: (_text: number, _record: MeasureListItemType, index: number) => {
      return (
        ((listState.pagination.current as number) - 1) * (listState.pagination.pageSize as number) +
        1 +
        index
      );
    },
    // customRender: (_text: number, _record: MeasureListItemType, index: number) => {
    //   return (
    //     ((listState.pagination.current as number) - 1) * (listState.pagination.pageSize as number) +
    //     1 +
    //     index
    //   );
    // },
    width: 60,
  },
  {
    title: "统计度量名称",
    dataIndex: "name",
    key: "name",
    width: 160,
  },
  {
    title: "统计度量编号",
    dataIndex: "measureCode",
    key: "measureCode",
    width: 200,
  },
  {
    title: "蓝图结构",
    dataIndex: "schemaName",
    key: "schemaName",
    width: 160,
  },
  {
    title: "统计度量描述",
    dataIndex: "desc",
    key: "desc",
    width: 236,
  },
  {
    title: "创建人",
    dataIndex: "createPerson",
    key: "createPerson",
    width: 160,
  },
  {
    title: "创建日期",
    dataIndex: "createDate",
    key: "createDate",
    width: 200,
  },
  {
    title: "操作",
    dataIndex: "actions",
    key: "actions",
    width: 208,
    fixed: "right",
  },
];

onMounted(() => {
  // onSearch("init");
  getGraphSchemaList();
});

const noAction = computed(() => {
  return (
    !userRights.value.btn_detailMeasure &&
    !userRights.value.btn_editMeasure &&
    !userRights.value.btn_copyMeasure &&
    !userRights.value.btn_delMeasure
  );
});

const onCheck = (record: MeasureListItemType) => {
  emit("update:checkType", "check");
  emit("update:record", record);
  emit("update:isListShow", false);
};

const onAdd = () => {
  emit("update:checkType", "add");
  emit("update:record", null);
  emit("update:isListShow", false);
};

const onEdit = (record: MeasureListItemType) => {
  emit("update:checkType", "edit");
  emit("update:record", record);
  emit("update:isListShow", false);
};

const onSearch = async (type: string) => {
  listState.tableLoading = true;
  if (type === "init") {
    listState.pagination.current = 1;
  }
  const json = {
    schemaId: listState.schemaId,
    measureCode: listState.measureCode,
    measureName: listState.measureName,
    createUser: listState.createUser,
    pageNo: listState.pagination.current,
    pageSize: listState.pagination.pageSize,
  };
  const data = await queryMeasureByPage(json);
  if (!data.dateList.length) {
    listState.tableValue = [];
    message.warn("列表为空！");
  } else {
    listState.pagination.total = parseInt(data.totalCount);
    const tableValue: MeasureListItemType[] = [];
    const graghMap = {};
    data.dateList.map((item: any) => {
      tableValue.push({
        id: item.id,
        createPerson: item.createUser,
        createDate: item.createDate,
        desc: item.notes,
        name: item.measureName,
        code: item.measureCode,
        schemaId: item.schemaId,
        schemaName: item.schemaName,
        updateUser: item.updateUser,
        updateDate: item.updateDate,
        measureCode: item.measureCode,
      });
      graghMap[item.id] = item.schemaId;
    });
    listState.graghMap = graghMap;
    listState.tableValue = tableValue;
  }
  listState.tableLoading = false;
};

const onReset = () => {
  listState.measureCode = undefined;
  listState.measureName = undefined;
  listState.createUser = undefined;
  listState.schemaId = undefined;
  onSearch("init");
};

const onCopy = (record: MeasureListItemType) => {
  const { name, id } = record;
  listState.copyForm.name = name + "_copy";
  listState.copyForm.schemaId = listState.graghMap[id];
  listState.record = record;
  listState.isCopyModalshow = true;
};

const onDel = async (record: MeasureListItemType) => {
  const title = `确定要删除 ${record.name} 吗？`;
  const content = `${record.name}的度量统计信息将被删除，且操作无法撤销，请确认是否删除？`;
  const onOk = async () => {
    let res = await delMeasure(record.id);
    console.log(res);
    res.code === 0 ? message.success("删除成功！") : message.error(res.message);
    onSearch("init");
  };
  modalConfirm(title, onOk, content);
};

const handleOk = async () => {
  const json = {
    id: listState.record.id,
    schemaId: listState.copyForm.schemaId,
    measureName: listState.copyForm.name,
    notes: listState.copyForm.desc,
  };
  const data = await measureCopy(json);
  if (data.message === "成功") {
    message.success("复制成功！");
    copyFormReset();
    onSearch("init");
  } else {
    message.error(data.message);
  }
};

const copyFormReset = () => {
  listState.isCopyModalshow = false;
  copyFormRef.value.resetFields();
};

const getGraphSchemaList = async () => {
  const data = await queryGraphSchema();
  const schemaMap = {};
  if (data && data.length) {
    data.map((item) => (schemaMap[item.id] = item.graphName));
    console.log(schemaMap);
    listState.schemaMap = schemaMap;
  }
  console.log("SchemaList", data);
};
</script>

<style lang="less">
.measure-list-wrapper {
  height: inherit;
  // background-color: @contentColor;

  .measure-list {
    .table-list-top {
      &-item {
        width: calc((100% - 94px) / 4);
        &-label {
          width: fit-content;
          white-space: nowrap;
        }
      }
    }
  }
}
.copy-dialog {
  .ant-modal-body {
    padding: 24px 86px;

    .ant-form-vertical .ant-form-item {
      padding: 0;
    }

    .ant-form-vertical .ant-form-item-label {
      padding: 0 0 4px;
    }

    .ant-form-item {
      margin-bottom: 16px;
      &:last-child {
        margin: 0;
      }
    }
  }
}
</style>
