<!-- 模板管理 -->
<template>
  <div class="template-manage">
    <TemplateList
      v-if="isListShow"
      ref="templateListRef"
      @detailsChanged="detailsChanged"
      @modelDetailsChanged="modelDetailsChanged"
      @isListShowChanged="isListShowChanged"
      @detailsTypeChanged="detailsTypeChanged"
      @isDetailsShowChanged="isDetailsShowChanged"
      @addModelShowChange="addModelShowChange"
      @handleCreateModel="handleCreateModel"
    />
    <TemplateDetails
      v-if="isDetailsShow"
      :details="params.details"
      :detailsType="detailsType"
      @detailsChanged="detailsChanged"
      @isListShowChanged="isListShowChanged"
      @isDetailsShowChanged="isDetailsShowChanged"
      @handleCreateModel="handleCreateModel"
    />
    <!-- <AddModel
      v-if="addModelShow"
      parentType="template"
      :isSkiped="isSkiped"
      :details="modelDetails"
      :detailsType="detailsType"
      :categoryOptions="categoryOptions"
      @modelDetailsChanged="modelDetailsChanged"
      @addModelShowChange="addModelShowChange"
      @getCategoryList="getCategoryListFunc"
      @detailsChanged="detailsChanged"
      @isSkipedChanged="isSkipedChanged"
      ref="addModel"
    /> -->
    <!-- <div class="template-manage-success" v-if="isSuccessShow">
      <div class="success-img">
        <img src="@/assets/images/img/success.jpg" alt="" />
      </div>
      <p class="title" v-if="detailsType === 'add'">模板创建成功</p>
      <p class="title" v-if="detailsType === 'edit'">模板修改成功</p>
      <p class="subtitle" v-if="detailsType === 'add'">
        模板已经成功创建，你可以选择在此模板上新建模型；或者可以选择返回模板列表
      </p>
      <p class="subtitle" v-if="detailsType === 'edit'">
        模板已经修改创建，你可以选择在此模板上新建模型；或者可以选择返回模板列表！
      </p>
      <div class="success-btns">
        <a-button type="primary" @click="handleCreateModel(details)">
          新建模型
        </a-button>
        <a-button @click="handleReturn"> 返回模板列表 </a-button>
      </div>
    </div> -->
  </div>
</template>
<script setup lang="ts">
//import AddModel from "../modelsManage/addModel";
import TemplateDetails from "./templateDetails.vue";
import TemplateList from "./templateList.vue";
// import { Button } from "ant-design-vue";
import { nextTick, reactive, ref } from "vue";

const params = reactive({
  details: {
    id: undefined,
    name: undefined,
    desc: undefined,
    data: [],
    schemaId: undefined,
    templateScript: undefined,
    createType: 2,
  },
});

const isListShow = ref(true);
const isDetailsShow = ref(false);
//const isSuccessShow = ref(false);
const addModelShow = ref(false);
const isSkiped = ref(false); // 是否是模板跳转过来的
const detailsType = ref("");
const modelDetails = ref({});
//const categoryOptions = ref([]);
const templateListRef = ref(null);

const detailsChanged = (value) => {
  params.details = value;
};
const modelDetailsChanged = (value) => {
  modelDetails.value = value;
};
//todo  isListShowChanged这里子组件只传入1个值
// const isListShowChanged = (value: boolean) => {
//   isListShow.value = value;
//   // if (isSearch) {
//   //   nextTick(() => {
//   //     templateListRef.value.onSearch("init");
//   //   });
//   // }
// };
const isListShowChanged = (value, isSearch) => {
  isListShow.value = value;
  if (isSearch) {
    nextTick(() => {
      templateListRef.value.onSearch("init");
    });
  }
};
const isDetailsShowChanged = (value: boolean) => {
  isDetailsShow.value = value;
};
// isSuccessShowChanged(value) {
//   this.isSuccessShow = value;
// },
const detailsTypeChanged = (value: string) => {
  detailsType.value = value;
  isSkiped.value = true;
};
// const onDrawerClose = () => {
//   drawerVisible.value = false;
// };
const handleCreateModel = (record) => {
  console.log("handleCreateModel", record);
  record.list = record.paramList.map((item) => ({
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
  addModelShowChange(true, record);
};
// const handleReturn = () => {
//   // this.isSuccessShowChanged(false);
//   isListShowChanged(true);
//   nextTick(() => {
//     templateListRef.value.onSearch("init");
//   });
// };
const addModelShowChange = (value, record) => {
  modelDetails.value = {
    id: undefined,
    name: undefined,
    createType: record.createType,
    desc: undefined,
    template: {
      schemaId: record.schemaId,
    },
    list: record.list || [],
    templateId: record.id,
    templateName: record.name,
    categoryId: undefined,
    status: undefined,
  };
  addModelShow.value = value;
  isListShow.value = !value;
  detailsType.value = "add";
  isSkiped.value = true;
};
// const getCategoryListFunc = async () => {
//   const listData = await getCategoryList(2);
//   const categoryOptionsArr = [];
//   if (listData && listData.length) {
//     listData.map((item) => {
//       if (item.diff === 1) {
//         categoryOptionsArr.push({
//           value: item.id,
//           label: item.categoryName,
//         });
//       }
//       item.children.map((ele) => {
//         categoryOptionsArr.push({
//           value: ele.id,
//           label: ele.categoryName,
//         });
//       });
//     });
//     categoryOptions.value = categoryOptionsArr;
//   } else if (listData && !listData.length) {
//     message.info("暂无模型分类，请先添加！");
//   } else {
//     message.error("获取模型分类失败");
//   }
// };
// const isSkipedChanged = (value) => {
//   isSkiped.value = value;
// };
</script>
<style lang="less">
.template-manage {
  height: 100%;
  border-radius: 5px;

  &-success {
    text-align: center;
    padding: 100px 0 24px;
    height: 100%;
    background: #fff;

    .success-img {
      width: 70px;
      height: 70px;
      margin: 0 auto;
      margin-bottom: 30px;
    }

    .title {
      font-size: 20px;
      font-weight: 600;
      line-height: 28px;
      margin-bottom: 5px;
      color: rgba(0, 0, 0, 0.85);
    }

    .subtitle {
      width: 425px;
      margin: 0 auto;
      font-size: 14px;
      line-height: 22px;
      margin-bottom: 24px;
      color: rgba(0, 0, 0, 0.45);
    }

    .success-btns {
      .ant-btn {
        &:first-child {
          margin-right: 10px;
        }
      }
    }
  }
}

.check-drawer {
  .ant-drawer-wrapper-body {
    .ant-drawer-header {
      .ant-drawer-title {
        font-size: 20px;
        font-weight: 600;
      }
    }

    .ant-drawer-body {
      .check-drawer-item {
        display: flex;
        margin-bottom: 16px;
        justify-content: space-between;

        &-label {
          width: 75px;
        }

        &-content {
          color: #949dad;
          width: calc(100% - 80px);

          .desc-content {
            height: 190px;
            padding: 12px;
            border: 1px solid #e6e6e6;
            border-radius: 5px;
          }

          .rules-item {
            color: #1890ff;
            margin-bottom: 10px;

            &.no-apply {
              color: #949dad;
            }
          }
        }
      }
    }
  }
}
</style>
