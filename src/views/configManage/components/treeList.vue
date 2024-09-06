<template>
  <div :class="[listClass, 'tree-list']">
    <div class="tree-list-title">
      <span class="tree-list-title-text" v-show="treeTitle">{{ treeTitle }}</span>
    </div>
    <div class="tree-list-content">
      <div class="tree-list-content-icon">
        <plus-square-outlined
          v-if="isCreateRight"
          class="plus"
          @click="
            (e) => {
              addList(e, '0-0');
            }
          "
        />
        <folder-add-outlined
          v-if="isCreateRight"
          class="folder"
          @click="
            (e) => {
              addFolder(e);
            }
          "
        />
        <!-- <a-icon
          type="plus-square"
          v-if="isCreateRight"
          class="plus"
          @click="
            (e) => {
              addList(e, '0-0');
            }
          "
        /> -->
        <!-- <a-icon
          type="folder-add"
          v-if="isCreateRight"
          class="folder"
          @click="
            (e) => {
              addFolder(e);
            }
          "
        /> -->
      </div>
      <a-tree
        show-icon
        :default-expanded-keys="defaultExpandedKeys"
        @select="onSelect"
        :tree-data="list"
        blockNode
      >
        <template #icon="{ isLeaf, expanded }">
          <file-outlined v-if="isLeaf" />
          <folder-open-outlined v-if="!isLeaf && expanded" />
          <folder-outlined v-if="!isLeaf && !expanded" />
        </template>
        <template #title="{ dataRef, isLeaf }">
          <div class="tree-view">
            <span class="tree-view-left" :title="dataRef.title">{{ dataRef.title }}</span>
            <div class="tree-view-right" v-if="dataRef.title !== '全部'">
              <plus-square-outlined
                v-if="isCreateRight && !isLeaf"
                class="btn"
                @click="
                  (e) => {
                    addList(e, dataRef.key);
                  }
                "
              />
              <delete-outlined
                v-if="isDeleteRight"
                class="btn"
                @click="
                  (e) => {
                    deleteList(dataRef, e);
                  }
                "
              />
            </div>
          </div>
        </template>
      </a-tree>
    </div>
  </div>
</template>
<script setup lang="ts">
import { FileOutlined, FolderOpenOutlined, FolderOutlined } from "@ant-design/icons-vue";
const props = defineProps({
  // 当前组件的类名
  listClass: {
    type: String,
    default: () => "",
  },
  // 树状列表上方标题
  treeTitle: {
    type: String,
    default: () => "",
  },
  // 新增权限
  isCreateRight: {
    type: Boolean,
    default: () => false,
  },
  // 删除权限
  isDeleteRight: {
    type: Boolean,
    default: () => false,
  },
  // 树状图数据源
  list: {
    type: Array,
    default: () => [],
  },
  // 默认展开的key
  defaultExpandedKeys: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["addList", "addFolder", "onSelect", "deleteList"]);
const addList = (e, key) => {
  emit("addList", e, key);
};
const addFolder = (e) => {
  emit("addFolder", e);
};
const onSelect = (selectedKeys, e) => {
  emit("onSelect", selectedKeys, e);
};
const deleteList = (item, e) => {
  emit("deleteList", item, e);
};

console.log("treeList", props);
</script>
<style lang="less">
.tree-list {
  padding: 10px;
  max-width: 312px;
  overflow: hidden;
  border-radius: 5px;
  background: @contentColor;

  &-title {
    height: 54px;
    font-size: 20px;
    font-weight: 600;
    line-height: 54px;
    padding-left: 5px;
    position: relative;
  }

  &-content {
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    height: calc(100% - 54px);

    &-icon {
      //top: 10px;
      top: 4px;
      right: 10px;
      z-index: 10;
      display: flex;
      position: absolute;

      .folder {
        margin-left: 10px;
        color: @activeFontColor;
        font-size: 18px;
      }
      .plus {
        font-size: 16px;
        margin-top: 1px;
        color: @activeFontColor;
      }
    }

    .ant-tree {
      position: relative;

      .ant-tree-title,
      .tree-view-left {
        user-select: none;
      }

      .ant-tree-switcher {
        .ant-tree-switcher-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%) !important;
        }
      }

      .ant-tree-child-tree {
        li,
        .ant-tree-treenode-switcher-open,
        .ant-tree-treenode-switcher-close {
          .ant-tree-node-content-wrapper {
            width: calc(100% - 24px);

            .ant-tree-title {
              width: calc(100% - 24px);
              display: inline-block;

              .tree-view-item {
                .tree-view-left {
                  overflow: hidden;
                  white-space: nowrap;
                  display: inline-block;
                  width: calc(100% - 33px);
                  text-overflow: ellipsis;
                }

                .tree-view-right {
                  //display: none;
                  float: right;

                  .btn {
                    color: @activeFontColor;

                    &:last-child {
                      margin-left: 5px;
                    }
                  }
                }
              }
            }

            &:hover {
              .tree-view-right {
                display: block !important;
              }
            }
          }
        }
      }

      //todo hover时候背景色修改
      .ant-tree-node-content-wrapper {
        display: flex;
        .ant-tree-title {
          width: 100%;
          .tree-view {
            display: flex;
            justify-content: space-between;
            &-left {
              width: calc(100% - 40px);
            }
            &-right {
              display: none;
              .anticon {
                margin-left: 4px;
                color: @activeFontColor;
              }
            }
          }
        }
        &:hover {
          .tree-view-right {
            display: block !important;
          }
        }
      }
    }
  }
}
</style>
