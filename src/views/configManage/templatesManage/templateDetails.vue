<template>
  <div class="template-details" ref="templateDetailsRef">
    <div class="template-details-header">
      <span class="template-details-header-title">
        {{
          detailsType === "add"
            ? "新建模板"
            : detailsType === "edit"
              ? `模板编辑（${details.id}）`
              : `模板详情（${details.id}）`
        }}
      </span>
      <div class="template-details-header-btns">
        <Button @click="handleReturn(false)"> 返回 </Button>
        <Button type="primary" @click="handleCreateModelFunc" v-if="detailsType === 'check'">
          创建模型
        </Button>
      </div>
    </div>
    <div
      class="template-details-content"
      id="template-details-content"
      :style="{
        height: detailsType !== 'check' ? 'calc(100% - 98px)' : '100%',
        paddingBottom: detailsType !== 'check' ? '24px' : '0px',
      }"
    >
      <div class="content-header">
        <span class="content-header-title">基本信息</span>
      </div>
      <div class="content-top">
        <div class="content-top-item">
          <div class="item-box">
            <span class="item-label">模板名称：</span>
            <div class="item-text" v-if="detailsType === 'check'">
              {{ details.name }}
            </div>
            <Input
              v-else
              allow-clear
              class="item-input"
              placeholder="模板名称"
              :disabled="detailsType === 'edit'"
              v-model:value.trim="details.name"
            />
          </div>
          <div class="item-box">
            <span class="item-label long-label">图模式选择：</span>
            <Tooltip placement="left" v-if="detailsType === 'check' && selectItem.length">
              <template v-slot:title>
                <span>{{ selectItem[0].name }}</span>
              </template>
              <span class="item-btn long-btn disabled">{{ selectItem[0].name }}</span>
            </Tooltip>
            <Tooltip placement="left" v-else-if="detailsType === 'check' && details.schemaName">
              <template v-slot:title>
                <span>{{ details.schemaName }}</span>
              </template>
              <span class="item-btn long-btn disabled">{{ details.schemaName }}</span>
            </Tooltip>
            <Tooltip placement="left" v-else-if="selectItem.length && detailsType !== 'check'">
              <template v-slot:title>
                <span>{{ selectItem[0].name }}</span>
              </template>
              <span class="item-btn long-btn" @click="handleSelectSchema">{{
                selectItem[0].name
              }}</span>
            </Tooltip>
            <Tooltip placement="left" v-else-if="details.schemaName && detailsType !== 'check'">
              <template v-slot:title>
                <span>{{ details.schemaName }}</span>
              </template>
              <span class="item-btn long-btn" @click="handleSelectSchema">{{
                details.schemaName
              }}</span>
            </Tooltip>
            <span class="item-btn" @click="handleSelectSchema" v-else>选择Schema</span>
          </div>
        </div>
        <div class="content-top-item">
          <div class="item-box textarea">
            <span class="item-label">模板描述：</span>
            <div class="item-text" v-if="detailsType === 'check'">
              {{ details.desc }}
            </div>
            <Input.TextArea
              v-else
              allow-clear
              type="text"
              :auto-size="{ minRows: 4, maxRows: 4 }"
              class="item-input"
              placeholder="模板描述"
              v-model:value.trim="details.desc"
            />
          </div>
        </div>
      </div>
      <div class="content-header">
        <span class="content-header-title" v-if="detailsType !== 'add' && details.createType === 2"
          >脚本展示</span
        >
        <span
          class="content-header-title"
          v-else-if="detailsType !== 'add' && details.createType === 1"
          >配置化展示</span
        >
        <div class="content-header-radio" v-else>
          <Radio.Group :value="details.createType" @change="onRadioChange">
            <Radio.Button :value="2">
              <icon-svg
                :color="details.createType === 2 ? '#1890FF' : 'rgba(0, 0, 0, 0.45)'"
                icon-class="script"
              />
              脚本化生成
            </Radio.Button>
            <Radio.Button :value="1">
              <icon-svg
                :color="details.createType === 1 ? '#1890FF' : 'rgba(0, 0, 0, 0.45)'"
                icon-class="config"
              />
              配置化生成
            </Radio.Button>
          </Radio.Group>
        </div>
      </div>
      <keep-alive>
        <script-template
          v-if="details.createType === 2"
          :details="details"
          :detailsType="detailsType"
          @detailsChanged="detailsChanged"
        />
      </keep-alive>
      <!-- <keep-alive>
        <config-template
          v-if="details.createType === 1"
          ref="configTemplateRef"
          type="template"
          :selectItem="selectItem"
          :details="details"
          :detailsType="detailsType"
          @detailsChanged="detailsChanged"
        />
      </keep-alive> -->
    </div>
    <div class="content-footer" v-if="detailsType !== 'check'">
      <div class="content-footer-btns">
        <Button @click="handleReturn(false)"> 取消 </Button>
        <Button type="primary" @click="handleConfirm" v-if="detailsType === 'edit'"> 提交 </Button>
        <Button type="primary" @click="handleConfirm" v-else> 生成模板 </Button>
      </div>
    </div>
    <Modal
      class="schema-list-modal"
      width="calc(100% - 96px)"
      :visible="isSchemaListShow"
      :destroyOnClose="true"
      @cancel="onSelectCancel"
      @ok="handleSelected"
      centered
      title="Schema选择"
      :maskClosable="false"
      :getContainer="() => templateDetailsRef"
    >
      <!-- :getContainer="() => $refs.templateDetails" todo -->
      <SchemaList @selectChanged="selectChanged" />
    </Modal>
    <Modal
      :width="648"
      :visible="successModalShow"
      :destroyOnClose="true"
      centered
      class="success-model-modal"
      :closable="false"
      :maskClosable="false"
      :footer="null"
    >
      <div class="success-model-modal-content">
        <img src="@/assets/images/img/success.svg" class="content-img" alt="" />
        <p class="content-text">{{ modalTitle }}</p>
        <button type="primary" @click="onSuccessCancel">确定</button>
      </div>
    </Modal>
  </div>
</template>
<script setup lang="ts">
import { addTemplate, editTemplate } from "@/shared/api/configManage.ts";
import { modalConfirm } from "@/utils/common.ts";
import { Button, Input, Modal, Radio, Tooltip, message } from "ant-design-vue";
// import ConfigTemplate from "./configTemplate.vue";
import ScriptTemplate from "./scriptTemplate.vue";
import SchemaList from "../components/schemaList.vue";
import { reactive, ref } from "vue";

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
const emit = defineEmits([
  "isListShowChanged",
  "isDetailsShowChanged",
  "isTemplateDetailsShowChanged",
  "addModelShowChange",
  "getCategoryList",
]);

const details = reactive(props.details);
const isSchemaListShow = ref(false);
const successModalShow = ref(false);
const selectItem = ref([]);
const selectBaseItem = ref([]);
const modalTitle = ref("");
const configTemplateRef = ref(null);
const templateDetailsRef = ref(null);

const handleReturn = (isSearch) => {
  emit("isListShowChanged", true, isSearch);
  emit("isDetailsShowChanged", false);
  emit("isTemplateDetailsShowChanged", false);
};

const handleCreateModelFunc = () => {
  emit("isListShowChanged", false);
  emit("isDetailsShowChanged", false);
  emit("addModelShowChange", false);
  emit("handleCreateModel", details);
  emit("getCategoryList");
};

const handleConfirm = async () => {
  if (!details.name) {
    message.error("请输入模板名称！");
    return false;
  }
  if (!details.schemaId && !details.graphId) {
    message.error("请选择schema！");
    return false;
  }
  const json = {
    name: details.name,
    desc: details.desc,
    schemaId:
      // 如果是kg的图，则取graphId，如果是自建的图，则取schemaId
      details.graphSource === 0 ? details.graphId : details.schemaId,
    createType: details.createType,
  };
  if (details.createType === 2) {
    // 脚本化
    if (!details.templateScript) {
      message.error("请输入模板脚本！");
      return false;
    }
    if (details.data && details.data.length) {
      let flag = false;
      for (let i = 0; i < details.data.length; i++) {
        const element = details.data[i];
        if (!element.content || !element.example || !element.type || !element.type.length) {
          message.error("请填写完整的语句配置！");
          flag = true;
          break;
        } else if (element.type === "Enum") {
          for (let i = 0; i < element.example.length; i++) {
            const ele = element.example[i];
            if (!ele.content || !ele.text) {
              message.error("请配置完整的枚举值！");
              flag = true;
              break;
            }
          }
        }
      }
      if (flag) {
        return false;
      }
    } else {
      message.error("请配置枚举值！");
      return false;
    }
    json.templateScript = details.templateScript;
    const paramList = [];
    details.data.map((item) => {
      switch (item.type.at(-1)) {
        case 1:
          paramList.push({
            paramType: 1,
            paramDesc: item.content,
            paramEg: item.example,
            paramName: item.index,
          });
          break;
        case 2:
          paramList.push({
            paramType: 2,
            paramDesc: item.content,
            paramEg: item.example,
            paramName: item.index,
          });
          break;
        case 3:
          paramList.push({
            paramType: 3,
            paramDesc: item.content,
            paramName: item.index,
            enums: item.example.map((ele) => ({
              tempScript: details.templateScript,
              paramValue: ele.text,
              paramDesc: ele.content,
            })),
          });
          break;
        case 4:
          paramList.push({
            paramType: 4,
            paramDesc: item.content,
            paramName: item.index,
            enums: item.example.map((ele) => ({
              tempScript: details.templateScript,
              paramValue: ele.text,
              paramDesc: ele.content,
            })),
          });
          break;

        default:
          break;
      }
    });
    json.paramList = paramList;
  } else {
    // 配置化
    const cy = configTemplateRef.value.$refs.modelGraph.$schema2.cy;
    //const cy = this.$refs.configTemplate.$refs.modelGraph.$schema2.cy;
    const modelInfo = {
      vertexMetas: [],
      edgeMetas: [],
    };
    const condition = {
      matchList: configTemplateRef.value.matchList,
      rulesGroup: configTemplateRef.value.rulesGroup,
    };
    cy.nodes((node) => {
      const nodeData = node.data();
      modelInfo.vertexMetas.push({
        x: node.json().position.x,
        y: node.json().position.y,
        id: nodeData.id,
        label: nodeData.label,
        name: nodeData.name,
        property: {},
        nodeType: nodeData.nodeType,
        icon: nodeData.icon,
      });
    });
    cy.edges((edge) => {
      const edgeData = edge.data();
      modelInfo.edgeMetas.push({
        srcId: edgeData.source,
        dstId: edgeData.target,
        id: edgeData.id,
        label: edgeData.label,
        name: edgeData.name,
        property: {},
        nodeType: edgeData.nodeType,
      });
    });
    json.schemaInfo = JSON.stringify(modelInfo); // 模型结构-点边信息
    json.condition = JSON.stringify(condition); // match和where条件
  }
  let res = undefined;
  // return false;
  if (props.detailsType === "edit") {
    json.id = details.id;
    res = await editTemplate(json);
  } else {
    res = await addTemplate(json);
  }
  if (res.message === "成功") {
    modalTitle.value = props.detailsType === "edit" ? "模板修改成功！" : "模板创建成功！";
    successModalShow.value = true;
    // this.$emit("isDetailsShowChanged", false);
    // this.$emit("isSuccessShowChanged", true);
  } else {
    message.error(`${res.message}`);
  }
};

const handleSelectSchema = () => {
  isSchemaListShow.value = true;
};

const selectChanged = (list) => {
  selectBaseItem.value = list;
};

const handleSelected = () => {
  if (selectBaseItem.value.length) {
    selectItem.value = selectBaseItem.value;
    details.graphId = selectItem.value[0].id;
    details.schemaId = selectItem.value[0].schemaId;
    details.graphSource = selectItem.value[0].graphSource;
    // this.$set(this.details, "graphId", this.selectItem[0].id);
    // this.$set(this.details, "schemaId", this.selectItem[0].schemaId);
    // this.$set(this.details, "graphSource", this.selectItem[0].graphSource);
    detailsChanged(details);
    onSelectCancel();
  } else {
    message.error("请选择一个schema！");
  }
};

const onSelectCancel = () => {
  isSchemaListShow.value = false;
};

const onRadioChange = (e) => {
  if (details.createType !== e.target.value) {
    const details = this.details;
    const title = `是否确定更换模板生成方式？`;
    const content = "";
    const onOk = () => {
      if (selectItem.value.length) {
        details.createType = e.target.value;
      } else {
        message.error("请先选择Schema！");
        return false;
      }
    };
    modalConfirm(title, onOk, content);
    detailsChanged(details);
  }
};

const detailsChanged = (value) => {
  emit("detailsChanged", value);
};

const onSuccessCancel = () => {
  successModalShow.value = false;
  handleReturn(true);
};
</script>
<style lang="less">
.template-details {
  height: 100%;
  display: flex;
  overflow: auto;
  flex-direction: column;

  .script-template,
  .config-template-config {
    flex: 1;
  }

  &-header {
    top: 0;
    left: 0;
    right: 0;
    z-index: 9;
    height: 74px;
    padding: 24px;
    display: flex;
    position: absolute;
    background: #fff;
    align-items: center;
    justify-content: space-between;

    &-title {
      font-size: 20px;
      font-weight: 600;
    }
  }

  &-content {
    display: flex;
    overflow: auto;
    margin-top: 74px;
    flex-direction: column;

    .content-top {
      margin-bottom: 24px;
      background: #fff;
      padding: 12px 16px 8px;

      &-item {
        display: flex;
        margin-bottom: 16px;

        .item-box {
          display: flex;
          max-width: 360px;
          line-height: 35px;
          margin-right: 100px;
          width: calc(50% - 22.5px);

          &:nth-child(2) {
            margin-right: 0;
          }

          &.textarea {
            width: 100%;
            margin-right: 0;
            max-width: 820px;
          }
        }

        .item-label {
          width: 75px;

          &.long-label {
            width: 90px;
          }
        }

        .item-btn {
          color: @blue;
          cursor: pointer;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;

          &.long-btn {
            width: calc(100% - 90px);
          }

          &.disabled {
            cursor: not-allowed;
            color: @disabledColor;
          }
        }

        .item-input,
        .item-text {
          width: calc(100% - 75px);

          .anticon-close-circle {
            top: 50%;
            margin-top: 0;
            transform: translateY(-50%);
          }
        }
      }
    }

    .content-header {
      height: 56px;
      padding: 0 16px;
      line-height: 56px;
      background: #fff;
      border-bottom: 1px solid #d9d9d9;

      &-title {
        font-size: 16px;
        font-weight: 600;
        color: @primaryTextColor;
      }

      &-radio {
        .icon-svg {
          width: 16px;
          margin-bottom: 2px;
        }

        .ant-radio-button-wrapper {
          user-select: none;

          &:hover {
            .svg-icon {
              fill: @blue !important;
            }
          }
        }
      }
    }
  }

  .content-footer {
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    height: 53px;
    display: flex;
    padding: 0 24px;
    line-height: 52px;
    position: absolute;
    background: #fff;
    align-items: center;
    justify-content: flex-end;

    .ant-btn {
      margin-left: 8px;
    }
  }

  .schema-list-modal {
    .ant-modal {
      max-width: 1200px;
    }
  }
}

.success-model-modal-content {
  text-align: center;
  padding: 30px 24px 24px;

  .content-img {
    width: 70px;
    height: 70px;
    margin-bottom: 30px;
  }

  .content-text {
    height: 28px;
    font-size: 20px;
    line-height: 28px;
    padding-left: 16px;
    margin-bottom: 60px;
    color: @primaryTextColor;
  }
}
</style>
