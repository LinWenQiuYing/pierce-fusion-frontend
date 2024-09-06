<template>
  <div :class="[listClass, 'table-list']" ref="tableList">
    <div class="table-list-top" :style="{ height: isFold ? '80px' : '128px' }">
      <slot name="searchOptions" :isFold="isFold" :handleFold="handleFold"></slot>
    </div>

    <div
      class="table-list-bottom"
      :style="{ height: isFold ? 'calc(100% - 104px)' : 'calc(100% - 152px)' }"
    >
      <div class="bottom-header">
        <span class="bottom-header-title">{{ tableTitle }}</span>
        <div class="bottom-header-btns">
          <slot name="tableBtns"></slot>
        </div>
      </div>
      <Table
        :columns="columns"
        :data-source="tableValue"
        :rowKey="rowKey"
        :pagination="pagination"
        :loading="tableLoading"
        :class="[tableClass, 'bottom-table']"
        :scroll="{ x: 'max-content', y: `${tableHeight}px` }"
      >
        <!-- :rowSelection="rowSelection"    todo:不需要选择项-->
        <!-- 其他表格columns里的slot尽量写在columns里，因为actions比较复杂，并且重复率高，故单独拿出来 -->
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'actions'">
            <slot name="actionsSlot" :record="record"></slot>
          </template>
        </template>
      </Table>
    </div>
    <slot name="otherPart"></slot>
  </div>
</template>

<script setup lang="ts">
import { Table } from "ant-design-vue";
import type { TablePaginationConfig, TableRowSelection } from "ant-design-vue/es/table/interface";
import { onMounted, reactive, ref, toRefs, watch } from "vue";

interface TableProps {
  listClass: string;
  tableClass: string;
  tableTitle: string;
  columns: any[];
  tableValue: any[];
  tableLoading: boolean;
  rowKey: string | ((record: any) => string);
  pagination: TablePaginationConfig;
  rowSelection?: TableRowSelection<any>;
  isDefaultFold: boolean;
}

const tableList = ref<HTMLElement | null>(null);

const props = withDefaults(defineProps<TableProps>(), {
  listClass: "",
  tableClass: "",
  tableTitle: "",
  columns: () => [],
  tableValue: () => [],
  tableLoading: false,
  rowKey: (record: any) => record.rowKey,
  pagination: () => ({
    size: "small",
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["5", "10", "15", "20"],
  }),
  rowSelection: () => ({}),
  isDefaultFold: false,
});
console.log("props", props);

const tableState = reactive({
  isFold: false,
  tableHeight: 0,
  clientHeight: 0,
});

const { isFold, tableHeight } = toRefs(tableState);

onMounted(() => {
  if (props.isDefaultFold) {
    tableState.isFold = props.isDefaultFold;
  }
  setTimeout(() => {
    if (!tableList.value) return;
    tableState.clientHeight = tableList.value.clientHeight;
    tableState.tableHeight = tableState.clientHeight - 349;
    window.onresize = () => {
      if (!tableList.value) return;
      tableState.clientHeight = tableList.value.clientHeight;
    };
  }, 100);
});

watch(
  () => tableState.isFold,
  (newValue) => {
    tableState.isFold = newValue;
    if (tableState.isFold) {
      tableState.tableHeight = tableState.clientHeight - 301;
    } else {
      tableState.tableHeight = tableState.clientHeight - 349;
    }
  }
);

watch(
  () => tableState.clientHeight,
  (newValue) => {
    tableState.clientHeight = newValue;
    if (tableState.isFold) {
      tableState.tableHeight = tableState.clientHeight - 301;
    } else {
      tableState.tableHeight = tableState.clientHeight - 349;
    }
  }
);

const handleFold = () => {
  tableState.isFold = !tableState.isFold;
};
</script>
<style lang="less">
.table-list {
  height: 100%;

  &-top {
    padding: 24px 24px 8px;
    display: flex;
    flex-wrap: wrap;
    background: #fff;
    margin-bottom: 24px;
    transition: all 0.3s;
    justify-content: space-between;

    &-item {
      display: flex;
      margin-bottom: 16px;
      align-items: center;
      justify-content: flex-start;
      width: calc((100% - 64px) / 3); // 默认一行三个，可添加覆盖样式

      &:last-child {
        justify-content: flex-end;
      }

      &-label {
        width: 75px;
      }

      &-input {
        // max-width: 400px;
        width: calc(100% - 75px);

        .ant-input {
          padding-right: 30px;
        }
      }

      .fold-btn {
        border: 0 !important;
        color: #1776ff;
        padding: 0;

        &::after {
          content: none;
        }
      }

      .ant-btn {
        &:not(:last-child) {
          margin-right: 10px;
        }
      }
    }
  }

  &-bottom {
    background: #fff;
    transition: all 0.3s;

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

      .ant-btn {
        &:not(:last-child) {
          margin-right: 8px;
        }
      }
    }

    .bottom-table {
      padding: 0 24px;
      height: calc(100% - 78px);
    }
  }
}
</style>
