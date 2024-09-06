<template>
  <div class="script-template">
    <div class="script-template-item">
      <p class="content-sub-title">模板脚本展示</p>
      <Input.TextArea
        allow-clear
        type="text"
        :auto-size="{ minRows: 8, maxRows: 15 }"
        placeholder="请输入模板脚本"
        :disabled="detailsType === 'check' || isLock"
        v-model:value.trim="details.templateScript"
      />
      <Button
        v-if="detailsType !== 'check'"
        type="primary"
        class="script-template-btn"
        @click="handleSaveScript"
        >{{ isLock ? "修改脚本" : "保存脚本" }}
      </Button>
    </div>
    <div class="script-template-item">
      <p class="content-sub-title">脚本化参数及语句配置展示</p>
      <!-- <Table
        class="templates-table"
        :columns="columns"
        :data-source="details.data"
        :pagination="pagination"
        :rowKey="(record) => record.index"
        bordered
      >
        <template #bodyCell="{ text, record, column }">
          <Cascader
            v-if="column.dataIndex === 'type'"
            allow-clear
            class="slot-input"
            :value="text"
            :options="paramOptions"
            placeholder="参数类型"
            :disabled="detailsType === 'check'"
            @change="(e) => handleChange(e, record.id, column.dataIndex)"
          />
          <Button
            v-else-if="column.dataIndex === 'example' && record.type && record.type[0] === 'Enum'"
            class="slot-btn"
            @click="handleCheckEnum(record, column.dataIndex)"
          >
            {{ detailsType === "add" ? "配置枚举值" : "查看枚举值" }}
          </Button>
          <Input
            v-else
            allow-clear
            class="slot-input"
            :value="text"
            :disabled="detailsType === 'check'"
            :placeholder="
              column.dataIndex === 'content' ? 'e.g.过滤节点的出入度为' : 'e.g.出度填out'
            "
            @change="(e) => handleChange(e.target.value, record.id, column.dataIndex)"
          />
        </template>
      </Table> -->
      <!-- <Table
        class="templates-table"
        :columns="columns"
        :data-source="details.data"
        :pagination="pagination"
        :rowKey="(record) => record.index"
        bordered
      >
        <template v-for="col in ['type', 'content', 'example']">
          <template v-slot:[col]="{ text, record, index }">
            <div :key="col">
              <Cascader
                v-if="col === 'type'"
                allow-clear
                class="slot-input"
                :value="text"
                :options="paramOptions"
                placeholder="参数类型"
                :disabled="detailsType === 'check'"
                @change="(e) => handleChange(e, record.id, col)"
              />
              <Button
                v-else-if="col === 'example' && record.type && record.type[0] === 'Enum'"
                class="slot-btn"
                @click="handleCheckEnum(record, col)"
              >
                {{ detailsType === "add" ? "配置枚举值" : "查看枚举值" }}
              </Button>
              <Input
                v-else
                allow-clear
                class="slot-input"
                :value="text"
                :disabled="detailsType === 'check'"
                :placeholder="col === 'content' ? 'e.g.过滤节点的出入度为' : 'e.g.出度填out'"
                @change="(e) => handleChange(e.target.value, record.id, col)"
              />
            </div>
          </template>
        </template>
      </Table> -->
    </div>
    <Modal
      class="enum-modal"
      :width="600"
      :visible="isEnumModalShow"
      :destroyOnClose="true"
      @cancel="onCancel(true)"
      @ok="handleOk"
      centered
      title="枚举值"
    >
      <div class="enum-modal-content">
        <div class="enum-modal-content-title">
          <div class="title-index">编号</div>
          <div class="title-text">枚举值</div>
          <div class="title-content">展示字段</div>
        </div>
        <div class="enum-modal-content-box">
          <div class="box-item" v-for="item in enumList" :key="item.index">
            <div class="title-index" v-if="item.index < 10">
              {{ `0${item.index}` }}
            </div>
            <div class="title-index" v-else>
              {{ item.index }}
            </div>
            <div class="title-text">
              <Input
                allow-clear
                class="modal-input"
                :value="item.text"
                placeholder="枚举值"
                :disabled="detailsType === 'check'"
                @change="(e) => handleInputChange(e.target.value, item.index, 'text')"
              />
            </div>
            <div class="title-content">
              <Input
                allow-clear
                class="modal-input"
                :value="item.content"
                placeholder="展示字段"
                :disabled="detailsType === 'check'"
                @change="(e) => handleInputChange(e.target.value, item.index, 'content')"
              />
            </div>
            <minus-circle-outlined
              v-if="detailsType !== 'check'"
              class="delete-icon"
              @click="handleDelete(item.index)"
            />
          </div>
          <plus-square-outlined
            v-if="detailsType !== 'check'"
            class="add-icon"
            @click="handleAdd"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>
<script setup lang="ts">
import { Button, Input, message, Modal } from "ant-design-vue";
//import { Button, Cascader, Input, message } from "ant-design-vue";
import { scrollToBottom } from "@/utils/common.ts";
import { find, intersection } from "lodash";
//import { cloneDeep, find, intersection } from "lodash";
import { reactive, ref } from "vue";
import { paginationType } from "@/types/templatesManage.ts";

const props = defineProps({
  detailsType: {
    type: String,
    default: () => "",
  },
  details: {
    type: Object,
    default: () => {},
  },
});

const details = reactive(props.details);
// const { details } = toRefs(props);

// const columns = ref([
//   {
//     title: "参数编号",
//     dataIndex: "index",
//     key: "index",
//     width: "15%",
//   },
//   {
//     title: "参数类型",
//     dataIndex: "type",
//     key: "type",
//     width: "20%",
//     scopedSlots: { customRender: "type" },
//   },
//   {
//     title: "参数语句",
//     dataIndex: "content",
//     key: "content",
//     width: "30%",
//     scopedSlots: { customRender: "content" },
//   },
//   {
//     title: "示例语句",
//     dataIndex: "example",
//     key: "example",
//     width: "35%",
//     scopedSlots: { customRender: "example" },
//   },
// ]);

const pagination: paginationType = reactive({
  size: "small",
  total: 0,
  current: 1,
  pageSize: 5,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ["5", "10", "15", "20"],
  showTotal: (total, current) => {
    return `共${total}条记录，当前第${Math.ceil(current[0] / pagination.pageSize)}页`;
  },
  onChange: (page: number, pageSize: number) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
    //getSchemaList("");
  },
  onShowSizeChange: (current: number, size: number) => {
    pagination.current = current;
    pagination.pageSize = size;
    //getSchemaList("");
  },
});

// const paramOptions = ref([
//   {
//     label: "整数",
//     value: 1,
//   },
//   {
//     label: "字符串",
//     value: 2,
//   },
//   {
//     label: "枚举值",
//     value: "Enum",
//     children: [
//       {
//         label: "整数",
//         value: 3,
//       },
//       {
//         label: "字符串",
//         value: 4,
//       },
//     ],
//   },
// ]);
const isEnumModalShow = ref(false);
const isLock = ref(false);
const enumList = ref([]);
const enumBaseList = ref([]);
const list = ref([]); // 存放变量的名字
const data = ref([]); // 存放已经配置好的参数信息
//const id = ref(undefined);
// const col = ref(undefined);

const handleSaveScript = () => {
  if (details && details.templateScript) {
    isLock.value = !isLock.value;
    if (!isLock.value) return false;
    const reg = /\$\{(.+?)\}/;
    const reg_g = /\$\{(.+?)\}/g;
    const result = details.templateScript.match(reg_g);
    const listArr = [];
    if (result) {
      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        listArr.push(item.match(reg)[1]);
        if (result.indexOf(item) !== i) {
          message.error("参数编号重复，请修改!");
          details.data = [];
          //this.$set(this.details, "data", []);
          return false;
        }
      }
      const newList = intersection(list.value, listArr); // 交集
      list.value = listArr; // 保存是为了下一次做比较
      const dataArr = [];
      list.value.map((item, index) => {
        if (newList.indexOf(item) !== -1) {
          // 在交集中
          const target = find(this.data, (v) => v.index === item);
          data.value.push(target);
        } else {
          // 其余的在差集中
          dataArr.push({
            id: index,
            index: item,
            type: undefined,
            content: undefined,
            example: undefined,
          });
        }
      });
      data.value = dataArr; // 保存是为了下一次做比较
      details.data = dataArr;
      //this.$set(this.details, "data", data);
      if (isLock.value) {
        scrollToBottom("template-details-content", 10);
      }
    } else {
      message.error("请输入正确的模板");
      isLock.value = !isLock.value;
      return false;
    }
  } else {
    message.error("请先输入脚本内容！");
  }
};

// const handleChange = (value, id, column) => {
//   const newData = [...details.data];
//   // return false;
//   const target = find(newData, (v) => v.id === id);
//   if (target) {
//     target[column] = value;
//     if (column === "type") {
//       if (value.length) {
//         switch (value.at(-1)) {
//           case 1:
//             target.typeText = "整数";
//             break;
//           case 2:
//             target.typeText = "字符串";
//             break;
//           case 3:
//             target.typeText = "整数枚举值";
//             break;
//           case 4:
//             target.typeText = "字符串枚举值";
//             break;

//           default:
//             break;
//         }
//       } else {
//         target.typeText = undefined;
//         target.content = undefined;
//         target.example = undefined;
//       }
//     }
//     details.data = newData;
//     //this.$set(this.details, "data", newData);
//   }
// };

// const handleCheckEnum = (record, col) => {
//   id.value = record.id;
//   col.value = col;
//   const target = details.data[record.id].example;
//   if (!target || !target.length) {
//     handleChange(
//       [
//         {
//           index: 1,
//           text: undefined,
//           content: undefined,
//         },
//       ],
//       record.id,
//       col
//     );
//   }
//   enumList.value = details.data[record.id][col];
//   enumBaseList.value = cloneDeep(enumList.value);
//   isEnumModalShow.value = true;
// };

const onCancel = (flag) => {
  if (flag) {
    details.data[this.id][this.col] = enumBaseList.value;
  }
  isEnumModalShow.value = false;
};

const handleOk = () => {
  let flag = false;
  if (enumList.value.length) {
    for (let i = 0; i < enumList.value.length; i++) {
      const element = enumList.value[i];
      if (!element.text || !element.content) {
        message.error("请填写完整的枚举值！");
        flag = true;
        break;
      }
    }
  } else {
    message.error("请至少填写一个完整的枚举值！");
    flag = true;
  }
  if (!flag) {
    onCancel(false);
  }
};

const handleInputChange = (value, index, type) => {
  enumList.value[index - 1][type] = value;
};

const handleDelete = (index) => {
  if (props.detailsType === "check") return false;
  enumList.value.splice(index - 1, 1);
  enumList.value.map((item, index) => {
    item.index = index + 1;
  });
};

const handleAdd = () => {
  if (props.detailsType === "check") return false;
  enumList.value.push({
    index: this.enumList.length ? enumList.value.at(-1).index + 1 : 1,
    text: undefined,
    content: undefined,
  });
};

// watch: {
//   details: {
//     handler(newValue) {
//       this.details = newValue;
//     },
//     deep: true,
//   },
// },
</script>
<style lang="less">
.script-template {
  padding: 16px;
  background: #fff;

  &-item {
    overflow: hidden;
  }

  .ant-input,
  .templates-table {
    margin: 0 36px;
    width: calc(100% - 72px);

    .slot-input {
      width: 100%;
      margin: -5px 0;
      color: @primaryTextColor !important;

      .ant-input[disabled] {
        text-align: center;
        background-color: #fff !important;
        color: @primaryTextColor !important;
      }
    }

    .slot-btn {
      border: 0;
      width: 100%;
      color: @blue;
      margin: 0 auto;
    }
  }

  .ant-table-bordered .ant-table-thead > tr > th,
  .ant-table-bordered .ant-table-tbody > tr > td {
    padding: 10px;
  }

  .ant-input {
    margin-bottom: 16px;

    .ant-input .script-template-input {
      margin-bottom: 0;
    }

    .ant-input-disabled {
      background-color: #fff;
      color: @primaryTextColor;
    }

    .anticon-close-circle {
      top: 50%;
      transform: translateY(-50%);
    }
  }

  &-btn {
    float: right;
    margin-right: 36px;
    margin-bottom: 16px;
  }
}

.enum-modal {
  &-content {
    max-height: 500px;

    &-title {
      display: flex;
      align-items: center;
      margin-bottom: 14px;
      padding-bottom: 12px;
      color: @primaryTextColor;
      border-bottom: 1px solid #d9d9d9;
    }

    &-box {
      overflow: auto;
      max-height: 452px;
      color: @primaryTextColor;

      .box-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
      }
    }

    .title-index {
      width: 40px;
      margin-right: 60px;
      text-align: center;
    }

    .title-text {
      width: 180px;
      text-align: center;
      margin-right: 60px;
    }

    .modal-input {
      .ant-input[disabled] {
        text-align: center;
        background-color: #fff !important;
        color: @primaryTextColor !important;
      }
    }

    .title-content {
      width: 180px;
      text-align: center;
    }

    .add-icon {
      width: 40px;
      color: @blue;
    }

    .delete-icon {
      color: @blue;
      margin-left: 10px;
    }
  }
}
</style>
