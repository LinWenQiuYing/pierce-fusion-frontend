<template>
  <div class="schemList">
    <List :data-source="listData" :pagination="pagination" :loading="searchLoading">
      <template #renderItem="{ item }">
        <List.Item
          :class="selectItem[0] && selectItem[0].id == item.id ? 'list-item-active' : ''"
          @click="onSelect(item)"
        >
          <p class="list-item-title">
            <Tooltip>
              <template v-slot:title>
                <span>{{ item.name }}</span>
              </template>
              <span class="item-name"> {{ item.name }} </span>
            </Tooltip>
            <span
              class="check-graph"
              @click="
                (e) => {
                  checkGraph(e, item);
                }
              "
              >预览</span
            >
          </p>
          <p class="list-item-text">
            <span class="text-label">编号：</span>
            <Tooltip placement="topLeft">
              <template v-slot:title>
                <span>{{ item.id }}</span>
              </template>
              <span class="text-content single-line">{{ item.id }}</span>
            </Tooltip>
          </p>
          <p class="list-item-text">
            <span class="text-label">同步：</span>
            <Tooltip placement="topLeft">
              <template v-slot:title>
                <span>{{ item.time }}</span>
              </template>
              <span class="text-content single-line">{{ item.time }}</span>
            </Tooltip>
          </p>
          <p class="list-item-text">
            <span class="text-label">描述：</span>
            <Tooltip placement="topLeft">
              <template v-slot:title>
                <span>{{ item.desc }}</span>
              </template>
              <span class="text-content multiple-line">{{ item.desc }}</span>
            </Tooltip>
          </p>
        </List.Item>
      </template>
    </List>
    <Modal
      class="check-graph-modal"
      :width="900"
      :visible="checkGraphVisible"
      :closable="true"
      :destroyOnClose="true"
      @cancel="onModalCancel"
      :footer="null"
      centered
    >
      <div class="check-graph-modal-content">
        <!-- <SchemaGraph
          v-if="schemaData.vertexMetas.length"
          :pathData="schemaData"
          graphId="schema-graph-canvas0"
          :isModel="false"
          :schemaId="schemaId"
        /> -->
      </div>
    </Modal>
  </div>
</template>
<script setup lang="ts">
import { graphPreview, queryGraphSchemaByPage } from "@/shared/api/configManage.ts";
import { List, message, Modal, Tooltip } from "ant-design-vue";
//todo 预览
//import SchemaGraph from "./schemaGraph";
import { paginationType } from "@/types/templatesManage.ts";
import { onMounted, reactive, ref } from "vue";

const emit = defineEmits(["selectChanged"]);

const listData = ref([]);
const selectItem = ref([]);
const searchLoading = ref(false);
const checkGraphVisible = ref(false);
const schemaData = reactive({
  edgeMetas: [],
  vertexMetas: [],
});
const schemaId = ref(undefined); // 预览的蓝图的id——kg:id,本地:schemaId
const pagination: paginationType = reactive({
  size: "small",
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ["5", "10", "15", "20"],
  showTotal: (total, current) => {
    return `共${total}条记录，当前第${Math.ceil(current[0] / pagination.pageSize)}页`;
  },
  onChange: (page: number, pageSize: number) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
    getSchemaList("");
  },
  onShowSizeChange: (current: number, size: number) => {
    pagination.current = current;
    pagination.pageSize = size;
    getSchemaList("");
  },
});

onMounted(() => {
  getSchemaList("");
});

const getSchemaList = async (searchValue) => {
  searchLoading.value = true;
  const json = {
    fuzzyParameter: searchValue,
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
    // source: 1, // pierce自己的图
  };
  const data = await queryGraphSchemaByPage(json);
  if (!data) {
    message.error("获取schema数据失败，请重试！");
    return false;
  }
  pagination.total = parseInt(data.totalCount);

  listData.value = data.dateList.map((item) => {
    return {
      id: item.id,
      name: item.graphChName,
      time: item.updateDate || item.createDate,
      desc: item.graphDesc,
      schemaId: item.bluePrintId,
      graphSource: item.source,
    };
  });
  searchLoading.value = false;
};

const onSelect = (item) => {
  selectItem.value = [item];
  emit("selectChanged", [item]);
};

const checkGraph = async (e, item) => {
  e.stopPropagation();
  schemaId.value = item.graphSource === 0 ? item.id : item.schemaId;
  const loading = message.loading("正在获取图谱结构信息", 0);
  const data = await graphPreview(schemaId.value);
  loading();
  if (data.vertexMetas.length) {
    schemaData.value = data;
    checkGraphVisible.value = true;
  } else {
    message.destroy();
    message.info("暂无图谱结构信息");
  }
};

const onModalCancel = () => {
  checkGraphVisible.value = false;
};
</script>
<style lang="less">
.schemList {
  .ant-list {
    .ant-spin-nested-loading {
      min-height: 173px;

      .ant-spin-container {
        .ant-list-items {
          display: flex;
          flex-wrap: wrap;

          .ant-list-item {
            padding: 16px;
            display: block;
            cursor: pointer;
            position: relative;
            margin-right: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
            border: 1px solid #d9d9d9;
            width: calc((100% - 80px) / 5);

            &:nth-child(5n) {
              margin-right: 0;
            }

            .list-item-title {
              display: flex;
              align-items: center;
              padding-bottom: 16px;
              justify-content: space-between;

              .item-name {
                font-size: 16px;
                color: #515a6e;
                font-weight: 600;
                max-width: calc(100% - 30px);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .check-graph {
                font-size: 14px;
                color: @activeFontColor;
                cursor: pointer;
                width: 30px;
              }
            }

            .list-item-text {
              &:not(:last-child) {
                height: 29px;
                padding-bottom: 8px;
              }

              .text-label {
                color: #515a6e;
                width: 45px;
                display: block;
                float: left;
              }

              .text-content {
                color: #999;
                word-break: break-all;
                display: inline-block;
                max-width: calc(100% - 45px);

                &.single-line {
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }

                &.multiple-line {
                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 2;
                  overflow: hidden;
                }
              }
            }

            .list-item-tag {
              right: 10px;
              bottom: 4px;
              color: @orange;
              position: absolute;
            }

            &.list-item-active,
            &:hover {
              border-color: @activeFontColor;
            }
          }
        }
      }
    }

    .ant-list-pagination {
      margin: 0;
    }
  }
}

.check-graph-modal {
  .ant-modal-wrap {
    .ant-modal {
      .ant-modal-content {
        background: #f8fbff;

        .ant-modal-body {
          padding: 18px 56px;
        }
      }
    }
  }
  &-content {
    height: 500px;
  }
}
</style>
