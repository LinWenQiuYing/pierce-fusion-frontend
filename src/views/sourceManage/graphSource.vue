<template>
  <div class="graph-source">
    <div class="graph-source-header">
      <div class="header-text">图库数据源</div>
      <div class="header-options">
        <div class="header-options-item">
          <div class="item-label">数据源名称：</div>
          <a-input
            type="text"
            allow-clear
            v-model:value="sourceValue"
            placeholder="请输入"
            class="item-input"
          />
        </div>
        <!-- <div class="header-options-item">
          <div class="item-label">数据源类型：</div>
          <a-select
            allow-clear
            v-model:value="sourceType"
            placeholder="请选择"
            class="item-input"
            :options="options"
          />
        </div> -->
        <div class="header-options-item">
          <a-button type="primary" @click="handleSearch" class="item-button"> 查询 </a-button>
          <a-button @click="handleReset" class="item-button">重置</a-button>
        </div>
      </div>
    </div>
    <DataList
      :isLoading="loading"
      className="graph-source-content"
      :dataList="dataList"
      checkType="source"
      @handleAdd="handleAdd"
      @handleEdit="handleEdit"
      @handleSearch="handleSearch"
      type="base"
    />
    <a-pagination
      :size="pagination.size"
      class="graph-source-pagination"
      v-model:current="pagination.current"
      :showQuickJumper="pagination.showQuickJumper"
      :showSizeChanger="pagination.showSizeChanger"
      :total="pagination.total"
      :pageSize="pagination.pageSize"
      :pageSizeOptions="pagination.pageSizeOptions"
      :showTotal="pagination.showTotal"
      @change="pagination.onChange"
      @showSizeChange="pagination.onShowSizeChange"
    />
    <a-modal
      v-model:visible="dsModalShow"
      :title="modalTitle"
      centered
      width="792px"
      @ok="handleAddDs"
      class="add-ds-modal"
      @cancel="handleCancel"
    >
      <div class="content-item">
        <div class="content-item-label">
          <i class="required">*</i>
          数据源名称：
        </div>
        <a-input
          type="text"
          allow-clear
          v-model:value="addParams.addName"
          placeholder="请输入"
          class="content-item-input"
        />
      </div>
      <div class="content-item">
        <div class="content-item-label">
          <i class="required">*</i>
          数据源类型：
        </div>
        <div class="content-item-box">
          <div
            :class="['content-item-box-item', addParams.type === item.value ? 'active' : '']"
            v-for="(item, index) in options"
            :key="index"
            @click="handleClick(item.value)"
          >
            <img class="item-img" :src="item.icon" alt="" />
            <span class="item-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
      <div class="content-item">
        <div class="content-item-label">
          <i class="required">*</i>
          ip：
        </div>
        <a-input
          type="text"
          allow-clear
          v-model:value="addParams.ip"
          placeholder="请输入"
          class="content-item-input"
        />
      </div>
      <div class="content-item">
        <div class="content-item-label">
          <i class="required">*</i>
          端口：
        </div>
        <a-input
          type="text"
          allow-clear
          v-model:value="addParams.port"
          placeholder="请输入"
          class="content-item-input"
        />
      </div>
      <div class="content-item">
        <div class="content-item-label">
          <i class="required">*</i>
          驱动名称：
        </div>
        <a-input
          type="text"
          allow-clear
          v-model:value="addParams.driver"
          placeholder="请输入"
          class="content-item-input"
        />
      </div>
      <div class="content-item">
        <div class="content-item-label">
          <i class="required">*</i>
          用户名：
        </div>
        <a-input
          type="text"
          allow-clear
          v-model:value="addParams.userName"
          placeholder="请输入"
          class="content-item-input"
        />
      </div>
      <div class="content-item">
        <div class="content-item-label">
          <i class="required">*</i>
          密码：
        </div>
        <Password
          allow-clear
          v-model:value="addParams.password"
          placeholder="请输入"
          autoComplete="new-password"
          class="content-item-input"
        />
      </div>
      <div class="content-item">
        <div class="content-item-label">
          <i class="required">*</i>
          服务器地址：
        </div>
        <a-input
          type="text"
          allow-clear
          v-model:value="addParams.url"
          placeholder="请输入"
          class="content-item-input"
        />
      </div>
      <div class="content-item">
        <div class="content-item-label">备注：</div>
        <TextArea
          allow-clear
          v-model:value="addParams.notes"
          placeholder="请输入"
          class="content-item-input"
          :auto-size="{ minRows: 4, maxRows: 4 }"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import StellarDBIcon from "@/assets/images/img/STELLARDB.svg";
import { operationDatasource, queryDatasourceByPage } from "@/shared/api/dataManage";
import { itemDetail, listParams, paginationType, params } from "@/types";
import { resetData } from "@/utils/common";
import { Input, message } from "ant-design-vue";
import { onMounted, reactive, ref } from "vue";
import DataList from "./components/dataList.vue";
import { graphBaseOptions } from "./components/dataSource";
const { TextArea, Password } = Input;

const sourceValue = ref(undefined);
const sourceType = ref(undefined);
const dataList = ref<listParams[]>([]); // 数据源列表
const loading = ref(false); // 是否正在查询
const pagination: paginationType = reactive({
  size: "small",
  total: 0,
  current: 1,
  pageSize: 15,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ["5", "10", "15", "20"],
  showTotal: (total: number) => {
    return `共${total}条记录`;
  },
  onChange: (page: number, pageSize: number) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
    handleSearch("repeat");
  },
  onShowSizeChange: (size: number) => {
    pagination.current = 1;
    pagination.pageSize = size;
    handleSearch("repeat");
  },
});
const options = graphBaseOptions;
let btnType = ref("add"); // 区分是新增还是编辑
let selectedItemId = ref("");

// 顶部查询方法
const handleSearch = async (type: string) => {
  if (type === "init") {
    pagination.current = 1;
  }
  const json = {
    dbName: sourceValue.value,
    dsType: sourceType.value,
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
  };
  loading.value = true;
  const res = await queryDatasourceByPage(json);
  loading.value = false;
  const result: listParams[] = [];
  if (res.message === "成功" && res.data && res.data.dateList && res.data.dateList.length) {
    pagination.total = res?.data?.totalCount;
    res?.data?.dateList.map((item: itemDetail) => {
      //const targetType = find(options.value, (v) => v.value === item.dsType);
      result.push({
        id: item.id,
        name: item.dsName,
        desc: item.notes,
        icon: StellarDBIcon,
        //icon: targetType.icon,
        date: item.updateDate || item.createDate,
        account: item.dsAccount,
        driver: item.dsDriver,
        ip: item.dsIp,
        password: item.dsPassword,
        port: item.dsPort,
        type: item.dsType,
        url: item.dsUrl,
      });
    });
  } else if (
    res.message === "成功" &&
    res.data &&
    !res.data.dateList &&
    !res.data.dateList.length
  ) {
    message.info("暂无数据源信息");
  } else {
    message.error("查询数据源信息失败！");
  }
  dataList.value = result;
};

// 顶部重置方法
const handleReset = () => {
  sourceValue.value = undefined;
  sourceType.value = undefined;
};

/* 新增、详情弹窗数据&方法 */

// 添加、详情弹窗数据
let addParams: params = reactive({
  addName: "",
  baseName: "",
  type: undefined,
  ip: "",
  port: "",
  userName: "",
  password: "",
  url: "",
  notes: "",
  driver: "",
});
let dsModalShow = ref(false); // 弹窗是否展示
let modalTitle = ref(""); // 弹窗标题

// 打开添加数据源弹窗
const handleAdd = () => {
  dsModalShow.value = true;
  btnType.value = "add";
  modalTitle.value = "新增数据源";
};

// 点击编辑按钮打开弹窗
const handleEdit = (target: listParams) => {
  modalTitle.value = "编辑数据源";
  selectedItemId.value = target.id;
  btnType.value = "edit";
  addParams.addName = target.name;
  addParams.baseName = "";
  addParams.type = target.type;
  addParams.ip = target.ip;
  addParams.port = target.port;
  addParams.userName = target.account;
  addParams.password = target.password;
  addParams.url = target.url;
  addParams.driver = target.driver;
  addParams.notes = target.desc;
  // addParams = reactive({
  //   addName: target.name,
  //   baseName: "",
  //   type: target.type,
  //   ip: target.ip,
  //   port: target.port,
  //   userName: target.account,
  //   password: target.password,
  //   url: target.url,
  //   notes: target.desc,
  // });
  dsModalShow.value = true;
};

// 弹窗确认提交方法
const handleAddDs = async () => {
  if (!addParams.addName) {
    return message.warning("数据源名称不能为空！");
  }
  if (!addParams.type) {
    return message.warning("请选择数据源类型！");
  }
  if (!addParams.ip) {
    return message.warning("ip不能为空！");
  }
  if (!addParams.port) {
    return message.warning("端口不能为空！");
  }
  if (!addParams.driver) {
    return message.warning("驱动名称不能为空！");
  }
  if (!addParams.userName) {
    return message.warning("用户名不能为空！");
  }
  if (!addParams.password) {
    return message.warning("密码不能为空！");
  }
  if (!addParams.url) {
    return message.warning("服务器地址不能为空！");
  }
  const json = {
    id: btnType.value === "edit" ? selectedItemId.value : undefined, // 有值为编辑，空值为新增
    dsName: addParams.addName,
    dsType: addParams.type,
    notes: addParams.notes,
    dsUrl: addParams.url,
    dsIp: addParams.ip,
    dsPort: addParams.port,
    dsDriver: addParams.driver,
    dsAccount: addParams.userName,
    dsPassword: addParams.password,
  };
  const tip = btnType.value === "add" ? "添加" : "修改";
  const loading = message.loading(`正在${tip}`, 0);
  const res = await operationDatasource(json);
  loading();
  if (res.message === "成功") {
    message.success(`${tip}成功`);
    handleCancel();
    handleSearch("");
  } else {
    message.error(res.message);
  }
};

// 点击数据源类型选项事件
const handleClick = (value: number) => {
  addParams.type = value;
};

// 弹窗关闭方法
const handleCancel = () => {
  dsModalShow.value = false;
  resetData(addParams);
};

onMounted(() => {
  handleSearch("init");
});
</script>
<style lang="less" scoped>
.graph-source {
  width: 100%;
  height: 100%;
  padding: 16px;
  background: #fff;
  position: relative;

  &-header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    justify-content: space-between;

    .header-text {
      color: #3c485c;
      font-weight: 600;
      font-size: 20px;
      line-height: 28px;
    }

    .header-options {
      display: flex;
      align-items: center;

      &-item {
        display: flex;
        align-items: center;

        &:not(:last-child) {
          margin-right: 24px;
        }

        .item-label {
          color: #3c485c;
          margin-right: 8px;
        }

        .item-input {
          width: 200px;
        }

        .item-button {
          &:first-child {
            margin-right: 8px;
          }
        }
      }
    }
  }

  &-pagination {
    display: flex;
    justify-content: flex-end;
    position: absolute;
    bottom: 16px;
    right: 16px;
  }
}
.add-ds-modal {
  .content-item {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    &:not(:last-child) {
      margin-bottom: 16px;
    }

    &-label {
      width: 120px;
      text-align: right;
      color: #3c485c;
      margin-right: 8px;
      line-height: 32px;
    }

    &-input,
    &-select {
      width: 454px;
    }

    &-input {
      border-radius: 6px;
      border: 1px solid #d6dbe3;
    }

    &-select {
      .ant-select-selector {
        border-radius: 6px;
        border: 1px solid #d6dbe3;
      }
    }

    &-box {
      gap: 8px;
      width: 454px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;

      &-item {
        width: 146px;
        height: 44x;
        display: flex;
        padding: 0 4px;
        cursor: pointer;
        border-radius: 6px;
        align-items: center;
        border: 1px solid #d6dbe3;

        &.active {
          background-image: url("@/assets/images/img/selected.svg");
          background-repeat: no-repeat;
          background-position: right top;
          background-size: 16px;
          border-color: #1776ff;
        }

        .item-label {
          color: #3c485c;
          font-size: 12px;
        }

        .item-img {
          margin-right: 6px;
        }
      }
    }
  }
}
</style>
./components/dataSource
