<!-- 图谱模型 -->
<template>
  <div class="model-manage">
    <div class="model-manage-list" v-if="listShow">
      <TreeList
        listClass="model-manage-list-left"
        treeTitle="模型分类"
        :isCreateRight="userRights.btn_createModelCategory"
        :isDeleteRight="userRights.btn_delModelCategory"
        :list="list"
        :defaultExpandedKeys="['']"
        @addList="addList"
        @addFolder="addFolder"
        @onSelect="onSelect"
        @deleteList="handleDelWarningCategory"
      />
      <TableList
        listClass="model-manage-list-right"
        tableTitle="模型列表"
        isDefaultFold
        :columns="columns"
        :tableValue="modalList"
        :pagination="pagination"
        :tableLoading="searchLoading"
        tableClass="model-table"
        :rowKey="(record) => record.id"
      >
        <template v-slot:searchOptions="{ isFold, handleFold }">
          <div class="table-list-top-item">
            <span class="table-list-top-item-label">模型编号：</span>
            <Input
              allow-clear
              class="table-list-top-item-input"
              type="text"
              v-model:value.trim="modelId"
              placeholder="模型编号"
            />
          </div>
          <div class="table-list-top-item">
            <span class="table-list-top-item-label">模型名称：</span>
            <Input
              allow-clear
              class="table-list-top-item-input"
              type="text"
              v-model:value.trim="modelName"
              placeholder="模型名称"
            />
          </div>
          <div class="table-list-top-item" v-show="!isFold">
            <span class="table-list-top-item-label">模型分类：</span>
            <Select
              class="table-list-top-item-input"
              v-model:value="modelCategory"
              placeholder="模型分类"
              :options="categoryAllOptions"
            />
          </div>
          <div class="table-list-top-item" v-show="!isFold">
            <span class="table-list-top-item-label">生成方式：</span>
            <Select
              class="table-list-top-item-input"
              v-model:value="createType"
              placeholder="生成方式"
            >
              <Select.Option value="">全部</Select.Option>
              <Select.Option :value="1">配置化</Select.Option>
              <Select.Option :value="2">脚本化</Select.Option>
            </Select>
          </div>
          <div class="table-list-top-item" v-show="!isFold">
            <span class="table-list-top-item-label">模型状态：</span>
            <Select
              class="table-list-top-item-input"
              v-model:value="modelState"
              placeholder="请选择状态"
            >
              <Select.Option value="">全部</Select.Option>
              <Select.Option :value="0">发布</Select.Option>
              <Select.Option :value="1">草稿</Select.Option>
            </Select>
          </div>
          <!-- <div class="table-list-top-item" v-show="!isFold">
            <span class="table-list-top-item-label">模型描述：</span>
            <Input
              class="table-list-top-item-input"
              type="text"
              v-model.trim="modelDesc"
              placeholder="描述关键字"
            />
          </div>
          <div class="table-list-top-item" v-show="!isFold"></div> -->
          <div class="table-list-top-item">
            <Button @click="onReset"> 重置 </Button>
            <Button type="primary" @click="onSearch('init')" :loading="searchLoading">
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
          <Button
            class="add-btn"
            @click="addModelShowChange(true)"
            type="primary"
            v-if="userRights.btn_createModelByTempId"
          >
            <template #icon><file-add-outlined /></template>
            新建
          </Button>
        </template>
        <template v-slot:actionsSlot="{ record }">
          <a
            @click="handleCheck(record)"
            v-if="userRights.btn_checkModel"
            style="margin-right: 12px"
            >查看</a
          >
          <!-- <a @click="copyModel(record)" v-if="userRights.btn_duplicateModel"
            >一键复用</a
          > -->
          <a
            @click="handleCheckTemplate(record)"
            v-if="userRights.btn_checkSelfTemplates"
            style="margin-right: 12px"
            >查看所用模板</a
          >
          <a-popover overlayClassName="more-actions">
            <template v-slot:content>
              <p @click="handleEdit(record)" :class="record.state === 0 ? 'disabled' : ''">编辑</p>
              <p @click="handleStop(record)">
                {{ record.state === 0 ? "停用" : "启用" }}
              </p>
              <p :class="record.state === 0 ? 'disabled' : ''" @click="handleDelete(record)">
                删除
              </p>
            </template>
            <a>更多</a>
          </a-popover>
          <a
            v-if="
              !userRights.btn_checkModel &&
              !userRights.btn_checkSelfTemplates &&
              !userRights.btn_editModel &&
              !userRights.btn_deleteModel &&
              !userRights.btn_startOrStopUsingModel
            "
            class="no-action"
          >
            暂无操作权限
          </a>
        </template>
      </TableList>
    </div>
    <!-- <AddModel
      v-if="addModelShow"
      :details="details"
      parentType="model"
      :isSkiped="isSkiped"
      :detailsType="detailsType"
      :categoryOptions="categoryOptions"
      @detailsChanged="detailsChanged"
      @addModelSuccessed="addModelSuccessed"
      @addModelShowChange="addModelShowChange"
      @isListShowChanged="isListShowChanged"
      @isSkipedChanged="isSkipedChanged"
      ref="addModelRef"
    /> -->
    <!-- <Details
      v-if="isTemplateDetailsShow"
      :details="templateDetails"
      detailsType="check"
      @handleCreateModel="handleCreateModel"
      @isListShowChanged="isListShowChanged"
      @isDetailsShowChanged="isDetailsShowChanged"
      @isTemplateDetailsShowChanged="isTemplateDetailsShowChanged"
    /> -->
    <Modal
      title="添加文件夹"
      :visible="showFolder"
      @ok="okFolder"
      @cancel="cancelFolder"
      okText="确定"
      cancelText="取消"
      centered
      :width="450"
    >
      <Input placeholder="请输入需要添加的文件夹名称" v-model:value.trim="folderName" />
    </Modal>
    <Modal
      title="添加分类"
      :visible="showList"
      @ok="okList"
      @cancel="cancelList"
      okText="确定"
      cancelText="取消"
      centered
      class="add-sub-menu"
      :width="450"
    >
      <div>
        <Select v-model:value="defaultKey" class="select-file">
          <Select.Option v-for="item in optionFileName" :key="item.key" :value="item.key">
            {{ item.title }}
          </Select.Option>
        </Select>
        <Input
          placeholder="请输入需要添加的分类名称"
          v-model:value.trim="listName"
          class="input-file"
        />
      </div>
    </Modal>
    <Drawer
      title="模型详情"
      placement="right"
      :closable="false"
      :visible="drawerVisible"
      @close="onDrawerClose"
      :width="modalWidth"
      class="check-drawer"
    >
      <div class="check-drawer-item">
        <span class="check-drawer-item-label">模型编号：</span>
        <div class="check-drawer-item-content">{{ details.code }}</div>
      </div>
      <div class="check-drawer-item">
        <span class="check-drawer-item-label">模型名称：</span>
        <div class="check-drawer-item-content">{{ details.name }}</div>
      </div>
      <div class="check-drawer-item img-content">
        <span class="check-drawer-item-label">模型结构：</span>
        <div class="check-drawer-item-content" v-if="details.imgString && details.createType === 1">
          <img :src="details.imgString" alt="" />
        </div>
        <span
          class="check-drawer-item-content"
          v-else-if="!details.imgString && details.createType === 1"
          >暂无模型图片</span
        >
        <script-results v-else :list="dataList" ref="scriptResults" type="check" />
      </div>
      <div class="check-drawer-item">
        <span class="check-drawer-item-label">模型描述：</span>
        <div class="check-drawer-item-content">{{ details.desc }}</div>
      </div>
      <div class="check-drawer-item">
        <span class="check-drawer-item-label">应用规则：</span>
        <div class="check-drawer-item-content">
          <p
            :class="item === '暂无应用' ? 'rules-item no-apply' : 'rules-item'"
            v-for="item in details.rules"
            :key="item"
          >
            {{ item }}
          </p>
        </div>
      </div>
    </Drawer>
  </div>
</template>
<script setup lang="ts">
//import AddModel from "./addModel";
//import Details from "../templatesManage/details";
import ScriptResults from "./scriptResults.vue";
import TableList from "@/components/tableList.vue";
import TreeList from "../components/treeList.vue";
import { Button, Input, Modal, message, Select, Drawer } from "ant-design-vue";
//import { Badge, Button, Input, Popover, Modal, message } from "ant-design-vue";
import {
  getRuleModel,
  editRuleModel,
  delRuleModel,
  getRuleModelDetail,
  getRuleModelDetails,
  deleteWarningCategory,
  addListCategory,
  getCategoryList,
  getTemplateDetails,
} from "@/shared/api/configManage.ts";
import { modalConfirm } from "@/utils/common.ts";
import { useUserStore } from "@store/user";
import { computed, h, onMounted, reactive, ref, nextTick } from "vue";

const userStore = useUserStore();
const userRights = computed(() => {
  return userStore.userRights;
});

const modelId = ref("");
const modelState = ref("");
const modelCategory = ref("");
const createType = ref("");
const modelName = ref(undefined);
const searchLoading = ref(false);
//todo
const columns = ref([
  {
    title: "模型编号",
    dataIndex: "code",
    key: "code",
    width: 180,
  },
  {
    title: "模型名称",
    dataIndex: "name",
    key: "name",
    width: 180,
  },
  {
    title: "模型分类",
    dataIndex: "category",
    key: "category",
    width: 120,
  },
  {
    title: "模型描述",
    dataIndex: "desc",
    key: "desc",
    width: 240,
  },
  {
    title: "生成方式",
    dataIndex: "createType",
    key: "createType",
    width: 120,
    customRender: (text) => {
      if (text.text === 2) {
        return h("span", { class: "way-slot-item item-sql" }, "脚本化");
      } else {
        return h("span", { class: "way-slot-item item-config" }, "配置化");
      }
    },
  },
  {
    title: "状态",
    dataIndex: "stateText",
    key: "stateText",
    width: 120,
    //todo
    // customRender: (text) => {
    //   return <Badge color={text === "草稿" ? "#f5222d" : "#52c41a"} text={text} />;
    // },
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
const modalList = ref([]);
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
    onSearch("repeat");
  },
  onShowSizeChange: (current: number, size: number) => {
    pagination.current = current;
    pagination.pageSize = size;
    onSearch("repeat");
  },
});
const details = ref({});
const addModelShow = ref(false);
const process = ref(false); // 表示是否正在过程中，节流作用
const detailsType = ref(undefined);
const list = ref([
  {
    title: "全部",
    key: "",
    children: [],
  },
]);
const showList = ref(false);
const showFolder = ref(false);
const folderName = ref(undefined);
const listName = ref(undefined);
const defaultKey = ref("");
const optionFileName = ref([{ title: "全部", key: "" }]);
const categoryAllOptions = ref([
  {
    value: "",
    label: "全部",
  },
]);
const categoryOptions = ref([]);
const modelDesc = ref(undefined);
const drawerVisible = ref(false);
const listShow = ref(true);
const isTemplateDetailsShow = ref(false);
const templateDetails = ref({});
const dataList = ref([]);
const modalWidth = ref(0);
const isSkiped = ref(false); // 是否是模板跳转过来的
const addModelRef = ref(null);
const ruleClass = ref(undefined);

onMounted(async () => {
  await getCategoryListFunc();
  await onSearch("init");
});

//todo
// watch: {
//   $route(to) {
//     if (to.name === "modelsManage" && to.params.isSearch) {
//       this.onSearch("init");
//     }
//   },
// },

const onSearch = async (type) => {
  if (type === "init") {
    pagination.current = 1;
  }
  searchLoading.value = true;
  const json = {
    modelCode: modelId.value === "" ? null : modelId.value,
    modelName: modelName.value === "" ? null : modelName.value,
    categoryId: modelCategory.value ? modelCategory.value : null,
    modelType: createType.value ? createType.value : null,
    desc: modelDesc.value ? modelDesc.value : null,
    status: modelState.value,
    pageSize: pagination.pageSize,
    pageNo: pagination.current,
  };
  const data = await getRuleModel(json);
  if (!data) {
    message.error("获取模型列表失败");
  } else {
    const tableValue = [];
    data.dateList &&
      data.dateList.map((item) => {
        tableValue.push({
          id: item.id,
          code: item.modelCode,
          name: item.modelName,
          desc: item.desc,
          state: item.status,
          category: item.categoryName,
          createType: item.modelType,
          templateId: item.tempId,
          stateText: item.status === 0 ? "发布" : "草稿",
        });
      });
    modalList.value = tableValue;
    pagination.total = data.totalCount;
  }
  searchLoading.value = false;
};

const onReset = () => {
  modelId.value = "";
  modelState.value = "";
  modelName.value = "";
  modelCategory.value = "";
  createType.value = "";
  modelDesc.value = undefined;
  onSearch("init");
};

const handleCheck = async (record) => {
  if (process.value) {
    return false;
  }
  process.value = true;
  const loading = message.loading("正在获取模型详情", 0);
  const json = {
    id: record.id,
  };
  const data = await getRuleModelDetail(json);
  loading();
  process.value = false;
  if (!data) {
    message.error("获取模型详情失败");
    return false;
  }
  if (data.modelType === 1) {
    // 配置化
    record.imgString = data.imgString;
  } else {
    dataList.value = data.detailsDto.paramList.map((item) => ({
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
    const paramValue = JSON.parse(data.paramValue);
    dataList.value.map((item) => {
      if (item.type[0] === 2 || (item.type[0] === "Enum" && item.type[1] === 4)) {
        // 字符串
        item.value = paramValue[item.index].slice(1, paramValue[item.index].length - 1);
      } else {
        item.value = paramValue[item.index];
      }
    });
    console.log("dataList.value", dataList.value);
  }
  record.rules = data.ruleNameList && data.ruleNameList.length ? data.ruleNameList : ["暂无应用"];
  details.value = record;
  console.log("details.value", details.value);
  if (data.modelType === 1) {
    modalWidth.value = 360;
  } else {
    modalWidth.value = 460;
  }
  drawerVisible.value = true;
};

const handleCheckTemplate = async (record) => {
  const res = await getTemplateDetail(record);
  templateDetails.value = res;
  listShow.value = false;
  isTemplateDetailsShow.value = true;
};

const getTemplateDetail = async (record) => {
  const loading = message.loading("正在查询", 0);
  const res = await getTemplateDetails(record.templateId, record.createType);
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
  if (record.state === 0) return false;
  if (process.value) {
    return false;
  }
  process.value = true;
  const loading = message.loading("正在获取模型详情", 0);
  if (record.createType === 1) {
    const res = await getRuleModelDetails(record.id);
    loading();
    process.value = false;
    if (!res.data) {
      message.error("获取模型详情信息失败！");
      return false;
    }
    // 配置化
    const condition = JSON.parse(res.data.condition) || undefined;
    const modelInfo = JSON.parse(res.data.schemaInfo) || undefined;
    if (condition && modelInfo) {
      addModelShow.value = true;
      listShow.value = false;
      const template = {};
      template.matchList = condition.matchList;
      template.rulesGroup = condition.rulesGroup;
      template.sentenceContent = res.data.modelScripts;
      template.modelInfo = modelInfo;
      template.schemaId = res.data.schemaId;
      template.sentenceShow = true;

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
      template.nodeIndex = nodeIndex;
      template.edgeIndex = edgeIndex + 1;
      template.pathIndex = condition.matchList.length - 1;
      const detailsNew = record;
      detailsNew.template = template;
      detailsNew.templateId = res.data.tempId;
      detailsNew.templateName = res.data.tempName;
      detailsNew.createType = res.data.modelType;
      detailsNew.categoryId = res.data.categoryId;
      detailsNew.schemaId = res.data.schemaId;
      details.value = detailsNew;
    } else {
      message.error("获取模型结构信息失败！");
      return false;
    }
  } else {
    const json = {
      id: record.id,
    };
    const res = await getRuleModelDetail(json);
    loading();
    process.value = false;
    if (!res) {
      message.error("获取模型详情失败！");
      return false;
    }
    addModelShow.value = true;
    listShow.value = false;
    nextTick(() => {
      record.list = res.detailsDto.paramList.map((item) => ({
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
      const paramValue = JSON.parse(res.paramValue);
      record.list.map((item) => {
        if (item.type[0] === 2 || (item.type[0] === "Enum" && item.type[1] === 4)) {
          // 字符串
          item.value = paramValue[item.index].slice(1, paramValue[item.index].length - 1);
        } else {
          item.value = paramValue[item.index];
        }
      });
      record.templateName = res.detailsDto.name;
      record.categoryId = res.categoryId;
      details.value = record;
      addModelRef.value.list = record.list;
    });
  }
  detailsType.value = "edit";
  isSkiped.value = true;
};

const handleDelete = (record) => {
  if (record.state === 0) return false;

  const title = `确定要删除 ${record.name} 吗？`;
  const content = "此操作将永久删除，请确认是否继续？";
  const onOk = async () => {
    const json = {
      id: record.id,
    };
    const data = await delRuleModel(json);
    if (data.message === "成功") {
      onSearch("init");
      message.success("删除成功");
    } else {
      message.error(`删除失败，${data.message}`);
    }
  };
  modalConfirm(title, onOk, content);
};

const handleStop = (record) => {
  const action = record.state === 0 ? "停用" : "启用";
  const title = `确定要${action} ${record.name} 吗？`;
  const content = "此操作将永久删除，请确认是否继续？";
  const onOk = async () => {
    const json = {
      id: record.id,
      status: record.state === 0 ? 1 : 0,
    };
    const data = await editRuleModel(json);
    if (data.message === "成功") {
      message.success(`${action}成功`);
      onSearch("init");
    } else {
      message.error(`${action}失败 ${data.message}`);
    }
  };
  modalConfirm(title, onOk, content);
};

const addModelShowChange = (value, templateId, templateName, createType, schemaId) => {
  details.value = {
    id: undefined,
    name: undefined,
    createType,
    desc: undefined,
    schemaId,
    templateId,
    templateName,
    categoryId: undefined,
    status: undefined,
  };
  listShow.value = !value;
  detailsType.value = "add";
  if (templateId) {
    isSkiped.value = true;
  }
  addModelShow.value = value;
};

// async copyModel(record) {
//   if (this.process) {
//     return false;
//   }
//   this.process = true;
//   const res = await getRuleModelDetails(record.id);
//   const condition = JSON.parse(res.data.condition) || undefined;
//   this.modelInfo = JSON.parse(res.data.schemaInfo) || undefined;
//   if (res.message === "成功" && condition && this.modelInfo) {
//     this.addModelShow = true;
//     const params = {};
//     params.matchList = condition.matchList;
//     params.rulesGroup = condition.rulesGroup;
//     params.sentenceContent = res.data.modelScripts;
//     params.sentenceShow = true;

//     // 重置nodeIndex、edgeIndex与pathIndex
//     let nodeIndex = 0;
//     let edgeIndex = 0;
//     this.modelInfo.vertexMetas.map((node) => {
//       const index = parseInt(node.name.slice(1));
//       if (index > nodeIndex) {
//         nodeIndex = index;
//       }
//     });
//     this.modelInfo.edgeMetas.map((edge) => {
//       const index = parseInt(edge.name.slice(1));
//       if (index > edgeIndex) {
//         edgeIndex = index;
//       }
//     });
//     params.nodeIndex = nodeIndex;
//     params.edgeIndex = edgeIndex + 1;
//     params.pathIndex = condition.matchList.length - 1;

//     this.params = params;
//     this.$nextTick(async () => {
//       this.$refs.addModel.current = 1;
//       this.schemaId = res.data.schemaId;
//       const loading = this.$message.loading("正在获取图谱结构信息", 0);
//       await this.$refs.addModel.handleSetModel(this.schemaId);
//       loading();
//       this.$refs.addModel.handleLock();
//     });
//   } else {
//     this.$message.error("一键复用失败");
//   }
//   this.process = false;
// },

// const addModelSuccessed = () => {
//   addModelShowChange(false);
//   onSearch("init");
// };

// const detailsChanged = (value) => {
//   details.value = value;
// };

const onSelect = (selectedKeys, e) => {
  //todo 不生效
  // if (!e.node.isLeaf) {
  //   e.node.onExpand();
  // }
  const target = categoryOptions.value.filter((item) => {
    if (item.value === selectedKeys[0]) {
      return item;
    }
  });
  if (selectedKeys.length) {
    if (target.length) {
      defaultKey.value = target[0].value;
    } else {
      defaultKey.value = "";
    }
  } else {
    defaultKey.value = "";
  }
  const rules = categoryAllOptions.value.filter((item) => {
    if (item.value === selectedKeys[0]) {
      return item;
    }
  });

  // 更新表格内容
  if (rules.length) {
    // 如果rules的长度存在，说明是点击了分类，更新表格内容
    //todo 这里rules[0]为啥加.value
    if (rules[0].value === "") {
      modelCategory.value = "";
    }
    if (e.node.isLeaf) {
      details.value.categoryId = rules[0].value;
      //this.$set(this.details, "categoryId", rules[0].value);
      ruleClass.value = rules[0].value;
      modelCategory.value = rules[0].value;
    } else {
      details.value.categoryId = undefined;
      //this.$set(this.details, "categoryId", undefined);
      modelCategory.value = "";
    }
    onSearch("init");
  }
};

const addList = (e, key) => {
  e.stopPropagation();
  defaultKey.value = key;
  showList.value = true;
};

const handleDelWarningCategory = (item, e) => {
  e.stopPropagation();
  const title = `确定要删除 ${item.title} 吗？`;
  const content = "此操作将永久删除，请确认是否继续？";
  const onOk = async () => {
    const json = {
      id: item.key,
    };
    const data = await deleteWarningCategory(json);
    if (data.message === "成功") {
      message.success("删除成功");
      getCategoryListFunc();
    } else {
      message.error(`删除失败，${data.message}`);
    }
  };
  modalConfirm(title, onOk, content);
};

const okFolder = async () => {
  if (folderName.value) {
    showFolder.value = false;
    const json = {
      categoryName: folderName.value,
      parentId: -1,
      categoryType: 2,
    };
    const data = await addListCategory(json);
    if (data.message === "成功") {
      message.success("添加成功");
      getCategoryListFunc();
    } else {
      message.info(`添加失败 ${data.message}`);
    }
  } else {
    message.warning("文件夹名字不可为空！");
    folderName.value = undefined;
  }
};

const cancelFolder = () => {
  showFolder.value = false;
};

const okList = async () => {
  if (listName.value !== "" && defaultKey.value !== "") {
    showList.value = false;
    const json = {
      categoryName: listName.value,
      parentId: defaultKey.value === "" ? -1 : defaultKey.value,
      status: 0,
      categoryType: 2,
    };
    const data = await addListCategory(json);
    if (data.message === "成功") {
      message.success("添加成功");
      getCategoryListFunc();
    } else {
      message.info(`添加失败 ${data.message}`);
    }
  } else if (defaultKey.value === "") {
    message.warning("请选择添加至哪个文件夹");
  } else {
    message.warning("分类名称不可为空！");
    listName.value = "";
  }
};
const cancelList = () => {
  showList.value = false;
};

const getCategoryListFunc = async () => {
  const listData = await getCategoryList(2);
  let categoryAllOptionsArr = [
    // 统计全部模型分类 + 全部
    {
      value: "",
      label: "全部",
    },
  ]; // 统计全部模型分类
  const categoryOptionsArr = [];
  if (listData && listData.length) {
    const nowList = [{ title: "全部", key: "" }];
    const listArr = listData.map((item) => {
      if (item.diff === 0) {
        // diff:区分分类和文件夹，0：文件夹，1：分类
        nowList.push({
          title: item.categoryName,
          key: item.id,
        });
      } else {
        categoryOptionsArr.push({
          value: item.id,
          label: item.categoryName,
        });
      }
      const children = item.children.map((ele) => {
        categoryOptionsArr.push({
          value: ele.id,
          label: ele.categoryName,
        });
        return {
          key: ele.id,
          isLeaf: true,
          title: ele.categoryName,
          scopedSlots: { title: "leaf" },
        };
      });
      return {
        key: item.id,
        isLeaf: item.diff === 0 ? false : true,
        title: item.categoryName,
        children,
        scopedSlots: { title: item.diff === 0 ? "folder" : "leaf" },
      };
    });
    categoryAllOptionsArr = [...categoryAllOptionsArr, ...categoryOptionsArr];
    categoryAllOptions.value = categoryAllOptionsArr;
    optionFileName.value = nowList;
    list.value[0].children = listArr;
    categoryOptions.value = categoryOptionsArr;
  } else if (listData && !listData.length) {
    list.value = [
      {
        title: "全部",
        key: "",
        children: [],
      },
    ];
    message.info("暂无模型分类，请先添加！");
  } else {
    message.error("获取模型分类失败");
  }
};
const addFolder = (e) => {
  e.stopPropagation();
  showFolder.value = true;
};

const onDrawerClose = () => {
  drawerVisible.value = false;
};

// const isListShowChanged = (value, isSearch) => {
//   listShow.value = value;
//   if (isSearch) {
//     onSearch("init");
//   }
// };
// const isDetailsShowChanged = (value) => {
//   addModelShow.value = value;
// };
// const isTemplateDetailsShowChanged = (value) => {
//   isTemplateDetailsShow.value = value;
// };

// const handleCreateModel = (record) => {
//   isTemplateDetailsShow.value = false;
//   addModelShowChange(true, record.id, record.name, record.createType, record.schemaId);
// };
// const isSkipedChanged = (value) => {
//   isSkiped.value = value;
// };
</script>
<style lang="less">
@import url("./index.less");
</style>
