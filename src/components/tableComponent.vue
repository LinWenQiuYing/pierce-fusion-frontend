<template>
  <Table
    :class="border ? 'border-table table-component' : 'table-component'"
    :columns="columns"
    :data-source="tableValue"
    :rowKey="rowKey"
    :pagination="pagination"
    :loading="tableLoading"
    :rowSelection="rowSelection"
    :scroll="{ x: 'max-content', y: 'calc(100vh - 430px)' }"
  >
    <template #bodyCell="{ record, column, text }">
      <template v-if="column.dataIndex === 'result'">
        <slot name="result" :record="record" :text="text"></slot>
      </template>
      <template v-if="column.dataIndex === 'edition'">
        <slot name="edition" :record="record" :text="text"></slot>
      </template>
      <template v-if="column.dataIndex === 'actions'">
        <slot name="actions" :record="record" :text="text"></slot>
      </template>
    </template>
  </Table>
</template>
<script setup lang="ts">
import { Table } from "ant-design-vue";
import type { TablePaginationConfig, TableRowSelection } from "ant-design-vue/es/table/interface";
interface TableProps {
  columns: any[];
  tableValue: any[];
  tableLoading?: boolean;
  rowKey: string | ((record: any) => string);
  pagination: TablePaginationConfig;
  rowSelection?: TableRowSelection<any>;
  border?: boolean;
}

const props = withDefaults(defineProps<TableProps>(), {
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
  border: false,
});
console.log("props", props);
</script>
<style lang="less">
.table-component {
  height: 100%;

  .ant-spin-nested-loading {
    height: 100%;

    .ant-spin-container {
      height: 100%;

      .ant-table {
        border: none;
        border-radius: 0;
        color: @primaryTextColor;
        height: calc(100% - 72px);

        .ant-table-content {
          height: 100%;

          .ant-table-scroll {
            height: 100%;

            .ant-table-placeholder {
              border-top: 0;
            }
          }

          .ant-table-header {
            // width: calc(100% + 5px);

            &::-webkit-scrollbar {
              border: 0;
            }

            .ant-table-fixed {
              border-radius: 0;

              .ant-table-thead {
                tr {
                  border-bottom-color: @dividersColor;
                }

                .ant-table-row-cell-break-word,
                .ant-table-selection-column {
                  font-weight: 600;
                  padding: 12px 16px;
                  color: @primaryTextColor;
                  background: @tableHeaderColor;
                  border-bottom-color: @dividersColor;
                  border-top: 1px solid @dividersColor;

                  &.ant-table-column-has-sorters {
                    .ant-table-header-column {
                      width: 100%;

                      .ant-table-column-sorters {
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;

                        .ant-table-column-sorter {
                          .ant-table-column-sorter-inner {
                            margin-top: -6px;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          .ant-table-body,
          .ant-table-body-inner {
            background: @contentColor;

            .ant-table-fixed {
              border-bottom: 1px solid @dividersColor;
            }

            .ant-table-tbody {
              .ant-table-row {
                .ant-table-row-cell-break-word {
                  padding: 12px 16px;
                  color: @primaryTextColor;
                  border-bottom-color: @dividersColor;

                  .no-action {
                    color: rgba(0, 0, 0, 0.65);
                    user-select: none;
                    cursor: not-allowed;
                  }

                  a {
                    color: @activeFontColor;
                    margin-right: 12px;

                    &:last-child {
                      margin-right: 0;
                    }

                    &.disabled {
                      cursor: not-allowed;
                      color: @disabledColor;
                    }
                  }
                }
              }
            }
          }
        }
      }

      .ant-pagination {
        margin: 24px 0;
      }
    }
  }
}

.border-table {
  .ant-table {
    .ant-table-content {
      border-right: 0 !important;

      .ant-table-header {
        border-radius: 0 !important;

        .ant-table-row-cell-break-word,
        .ant-table-selection-column {
          border-top: 1px solid @dividersColor !important;
          border-right: 1px solid @dividersColor !important;
          border-bottom: 1px solid @dividersColor !important;
          border-radius: 0 !important;
        }
      }

      .ant-table-fixed {
        border-bottom: 0 !important;
        border-left: 1px solid @dividersColor !important;
      }
      .ant-table-fixed,
      .ant-table-body-outer {
        .ant-table-row-cell-break-word,
        .ant-table-selection-column {
          border-right: 1px solid @dividersColor !important;
          border-bottom: 1px solid @dividersColor !important;
          color: @primaryTextColor !important;
        }
      }
    }
  }
}
</style>
