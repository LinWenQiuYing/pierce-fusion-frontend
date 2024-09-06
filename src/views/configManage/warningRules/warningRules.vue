<!-- 图谱规则 -->
<template>
  <div class="risk-warning-rules">
    <TreeList
      v-if="!addRuleVisible"
      listClass="rules-left"
      treeTitle="策略规则分类"
      :isCreateRight="userRights.btn_createRuleCategory"
      :isDeleteRight="userRights.btn_delRuleCategory"
      :list="treeList"
      :defaultExpandedKeys="['0-0']"
      @addList="addList"
      @addFolder="addFolder"
      @onSelect="onSelect"
      @deleteList="handleDelWarningCategory"
    />
    <TableList
      v-if="!addRuleVisible"
      isDefaultFold
      listClass="rules-right"
      tableTitle="规则列表"
      :columns="columns"
      :tableValue="tableValue"
      :pagination="pagination"
      :tableLoading="tableLoading"
      tableClass="rule-table"
      :rowKey="(record) => record.id"
    >
      <template v-slot:searchOptions="{ isFold, handleFold }">
        <div class="table-list-top-item">
          <span class="table-list-top-item-label">规则分类：</span>
          <Select
            class="table-list-top-item-input"
            :options="warningClassOption"
            v-model:value="warningClass"
            placeholder="规则分类"
          />
        </div>
        <div class="table-list-top-item">
          <span class="table-list-top-item-label">规则等级：</span>
          <Select
            v-model:value="warningLevel"
            placeholder="规则等级"
            class="table-list-top-item-input"
          >
            <Select.Option value="">全部</Select.Option>
            <Select.Option :value="1">一级</Select.Option>
            <Select.Option :value="2">二级</Select.Option>
            <Select.Option :value="3">三级</Select.Option>
          </Select>
        </div>
        <div class="table-list-top-item">
          <span class="table-list-top-item-label">规则状态：</span>
          <Select
            class="table-list-top-item-input"
            v-model:value="warningState"
            placeholder="规则状态"
          >
            <Select.Option value="">全部</Select.Option>
            <Select.Option :value="0">上线</Select.Option>
            <Select.Option :value="1">草稿</Select.Option>
          </Select>
        </div>
        <div class="table-list-top-item" v-show="!isFold">
          <span class="table-list-top-item-label">生成方式：</span>
          <Select
            class="table-list-top-item-input"
            v-model:value="warningType"
            placeholder="生成方式"
          >
            <Select.Option value="">全部</Select.Option>
            <Select.Option :value="1">内置</Select.Option>
            <Select.Option :value="0">自定义</Select.Option>
          </Select>
        </div>
        <div class="table-list-top-item" v-show="!isFold">
          <span class="table-list-top-item-label">规则名称：</span>
          <Input
            type="text"
            class="table-list-top-item-input"
            v-model:value.trim="warningName"
            placeholder="规则名称"
          />
        </div>
        <div class="table-list-top-item" v-show="!isFold">
          <span class="table-list-top-item-label">规则编号：</span>
          <Input
            type="text"
            class="table-list-top-item-input"
            v-model:value.trim="warningId"
            placeholder="规则ID/流水号"
          />
        </div>
        <div class="table-list-top-item" v-show="!isFold"></div>
        <div class="table-list-top-item">
          <Button @click="onReset('init')"> 重置 </Button>
          <Button type="primary" @click="onSearch('init')" :loading="tableLoading"> 查询 </Button>
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
          @click="handleAddRule"
          type="primary"
          v-if="userRights.btn_createRule"
        >
          <template #icon><file-add-outlined /></template>
          新建
        </Button>
      </template>
      <template v-slot:actionsSlot="{ record }">
        <a
          @click="detailInfo(record)"
          v-if="userRights.btn_checkRuleDetail"
          style="margin-right: 12px"
          >详情</a
        >
        <a
          v-if="record.status === '草稿' && userRights.btn_updateRule"
          @click="editInfo(record)"
          style="margin-right: 12px"
          >编辑</a
        >
        <Popover overlayClassName="more-actions">
          <template v-slot:content>
            <p @click="startRule(record)" v-if="userRights.btn_startOrStopUsingRule">
              {{ record.status === "上线" ? "停用" : "启用" }}
            </p>
            <p
              v-if="record.status === '上线' && userRights.btn_doRuleTask"
              @click="testInfo(record)"
            >
              立即检测
            </p>
            <p @click="checkInfo(record)" v-if="userRights.btn_resultsCheck">结果查询</p>
            <p
              v-if="
                record.ruleType !== '内置' && record.status === '草稿' && userRights.btn_deleteRule
              "
              @click="handleDelete(record)"
            >
              删除
            </p>
          </template>
          <a>更多</a>
        </Popover>
      </template>
    </TableList>
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
    <a-modal
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
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {
  deleteWarningCategory,
  getCategoryList,
  searchRuleList,
  getWarningRelate,
  queryGraphList,
  addListCategory,
} from "@/shared/api/configManage.ts";
import { modalConfirm } from "@/utils/common";
import { useUserStore } from "@store/user";

import { computed, onMounted, reactive, ref } from "vue";
import TreeList from "../components/treeList.vue";
import TableList from "@/components/tableList.vue";
import { Button, Input, Popover, Select, message, Modal } from "ant-design-vue";

const userStore = useUserStore();
const userRights = computed(() => {
  return userStore.userRights;
});
const userInfo = computed(() => {
  return userStore.userInfo;
});

//------右侧列表
const tableLoading = ref<boolean>(false);
const warningClassOption = ref([
  {
    value: "0-0",
    label: "全部",
  },
]); // 所有叶子节点的分类 + 全部选项
const optionFileName = ref([]); // 所有分类名称
const ruleTypeOptions = ref([]); // 所有叶子节点的分类（不包括全部选项）
const warningId = ref("");
const warningName = ref("");
const warningState = ref("");
const warningLevel = ref("");
const warningClass = ref("0-0");
const warningType = ref("");
//const ruleName = ref("");
//const ruleModel = ref(undefined);
//const ruleLevel = ref(undefined);
const ruleClass = ref(undefined);
const pagination = reactive({
  size: "small",
  total: 0,
  current: 1,
  pageSize: 15,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ["5", "10", "15", "20"],
  showTotal: (total: number, current: number) => {
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
const columns = ref([
  {
    title: "规则编号",
    dataIndex: "id",
    key: "id",
    width: 100,
  },
  {
    title: "规则名称",
    dataIndex: "ruleName",
    key: "ruleName",
    width: 100,
  },
  {
    title: "规则分类",
    dataIndex: "ruleCategory",
    key: "ruleCategory",
    width: 90,
  },
  {
    title: "生成方式",
    dataIndex: "ruleType",
    key: "ruleType",
    width: 90,
  },
  {
    title: "状态",
    key: "status",
    dataIndex: "status",
    width: 70,
  },
  {
    title: "最新更新日期",
    key: "lastTime",
    dataIndex: "lastTime",
    width: 120,
  },
  {
    title: "操作",
    key: "actions",
    dataIndex: "actions",
    scopedSlots: { customRender: "actions" },
    width: 98,
  },
]);
const tableValue = ref([]);
//const modelOptions = ref([]);

//------左侧列表树
const addRuleVisible = ref<boolean>(false);
const treeList = ref([
  {
    title: "全部",
    key: "0-0",
    children: [],
  },
]);
const defaultKey = ref("0-0"); // 当前所选分类
const showList = ref(false); //添加分类弹框
const showFolder = ref(false); //添加分类弹框
const folderName = ref("");
const listName = ref("");
const plainOptions = ref([]);
const graphOptions = ref([]);

//------右侧列表事件
const onSearch = (type) => {
  tableLoading.value = true;
  if (type === "init") {
    pagination.current = 1;
  }
  const json = {
    currentUser: userInfo.value.userId,
    id: warningId.value,
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
    ruleStatus: warningState.value,
    warningLevel: warningLevel.value,
    warningRuleName: warningName.value,
    warningType: warningType.value,
    categoryId: warningClass.value === "0-0" ? "" : warningClass.value,
  };
  getRuleList(json);
  ruleClass.value = undefined;
  defaultKey.value = "0-0";
};
const getRuleList = async (json) => {
  const data = await searchRuleList(json);
  if (!data) {
    message.error("获取规则列表失败");
  } else {
    pagination.total = parseInt(data.totalCount);
    tableValue.value = data.dateList.map((item) => {
      return {
        ...item,
        ruleType: item.ruleType === "1" ? "内置" : "自定义",
        status: item.ruleStatus === "0" ? "上线" : "草稿",
      };
    });
  }
  tableLoading.value = false;
};

//-----左侧事件获取左侧策略规则分类
const init = async () => {
  // 规则列表
  const listData = await getCategoryList(0);
  const ruleTypeOptionsArr: any = []; // 统计全部规则分类
  const ruleOptionsArr: any = [];
  let warningClassOptionArr = [
    // 统计全部规则分类 + 全部
    {
      value: "0-0",
      label: "全部",
    },
  ];
  if (listData && listData.length) {
    const nowList = [{ title: "全部", key: "0-0" }];
    const list = listData.map((item) => {
      if (item.diff === 0) {
        nowList.push({
          title: item.categoryName,
          key: item.id,
        });
      }
      if (!item.children.length) {
        ruleOptionsArr.push({
          value: item.id,
          label: item.categoryName,
        });
      }
      const children = item.children.map((ele) => {
        ruleTypeOptionsArr.push({
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
        isLeaf: item.children.length ? false : true,
        title: item.categoryName,
        children,
        scopedSlots: { title: item.children.length ? "folder" : "leaf" },
      };
    });
    warningClassOptionArr = [...warningClassOptionArr, ...ruleTypeOptionsArr, ...ruleOptionsArr];
    warningClassOption.value = warningClassOptionArr;
    optionFileName.value = nowList;
    console.log("21212121212,", treeList.value);
    treeList.value[0].children = list;
    ruleTypeOptions.value = [...ruleTypeOptionsArr, ...ruleOptionsArr];
  } else {
    message.error("获取规则分类失败");
  }
  onSearch("init");

  // 关联线索
  const warningRelate = await getWarningRelate();
  if (!warningRelate) {
    message.error("获取关联线索失败");
  } else {
    plainOptions.value = warningRelate.map((item) => {
      return {
        value: item.id,
        label: item.warningName,
      };
    });
  }

  // 可选图谱
  const graphList = await queryGraphList();
  if (!graphList) {
    message.error("获取可选图谱失败");
  } else {
    graphOptions.value = graphList.map((graph) => {
      return {
        label: graph.graphChName,
        value: graph.id,
        schemaId: graph.schemaId,
      };
    });
  }
};

const addList = (e, key) => {
  e.stopPropagation();
  defaultKey.value = key;
  showList.value = true;
};

const addFolder = (e) => {
  e.stopPropagation();
  showFolder.value = true;
};

const okList = async () => {
  if (listName.value !== "" && defaultKey.value !== "") {
    showList.value = false;
    const json = {
      categoryName: listName.value,
      parentId: defaultKey.value === "0-0" ? -1 : defaultKey.value,
      status: 0,
      categoryType: 0,
    };
    const data = await addListCategory(json);
    if (data.message === "成功") {
      message.success("添加成功");
      init();
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
const okFolder = async () => {
  if (folderName.value !== "") {
    showFolder.value = false;
    const json = {
      categoryName: folderName.value,
      parentId: -1,
      categoryType: 0,
    };
    const data = await addListCategory(json);
    if (data.message === "成功") {
      message.success("添加成功");
      init();
    } else {
      message.info(`添加失败 ${data.message}`);
    }
  } else {
    message.warning("文件夹名字不可为空！");
    folderName.value = "";
  }
};
const cancelFolder = () => {
  showFolder.value = false;
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
      init();
    } else {
      message.error(`删除失败，${data.message}`);
    }
  };
  modalConfirm(title, onOk, content);
};

const onSelect = (selectedKeys, e) => {
  //todo 不生效！
  // if (!e.node.isLeaf) {
  //   // 如果不是叶子节点，则展开或者收起
  //   e.node.onExpand();
  // }
  const target = optionFileName.value.find((item) => item.key === selectedKeys[0]);
  if (selectedKeys.length) {
    if (target) {
      defaultKey.value = target.key;
    } else {
      defaultKey.value = "0-0";
    }
  } else {
    defaultKey.value = "0-0";
  }
  const rules = warningClassOption.value.find((item) => item.value === selectedKeys[0]);

  // 更新表格内容
  if (rules) {
    onReset("repeat");
    if (rules.value === "0-0") {
      warningClass.value = "0-0";
    }
    if (e.node.isLeaf) {
      ruleClass.value = rules.value;
      warningClass.value = rules.value;
    } else {
      ruleClass.value = undefined;
      warningClass.value = "0-0";
    }
    tableLoading.value = true;
    pagination.current = 1;
    const json = {
      currentUser: userInfo.value.userId,
      id: "",
      pageNo: 1,
      pageSize: pagination.pageSize,
      ruleStatus: "",
      warningLevel: "",
      warningRuleName: "",
      warningType: "",
      categoryId: rules.value === "0-0" ? "" : rules.value,
    };
    console.log("getRuleList(json)", json);
    getRuleList(json);
  }
};

const onReset = (type: string) => {
  warningId.value = "";
  warningName.value = "";
  warningState.value = "";
  warningLevel.value = "";
  warningClass.value = "0-0";
  warningType.value = "";
  ruleClass.value = undefined;
  if (type === "init") {
    //this.onSearch("init");
  }
};

onMounted(() => {
  init();
});
</script>
<style scoped>
@import url("./index.less");
</style>
