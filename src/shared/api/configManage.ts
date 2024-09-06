import { get, post, put, upload } from "./index.ts";

const ruleUrl = "/pierce/warningRule";
const graphUrl = "/pierce/graphTableResource";
const schemaUrl = "/pierce/graphSchema";
const templateUrl = "/pierce/template";

// 查询可选图谱接口
export async function queryGraphList() {
  // 0:kg 1:本地 null:所有
  const res = await get(`${graphUrl}/queryGraphList`);
  return res.data;
}

// 查看可用图以及版本
export async function getGraphAndVersion() {
  const res = await get(`${graphUrl}/available/list/branch`);
  return res;
}

// 规则与模型接口

// 查询线索规则分类列表
// 0-本地规则分类，1-图联邦规则分类，2-本地模型分类，3-图联邦模型分类
export async function getCategoryList(categoryType: number) {
  const res = await get(`${ruleUrl}/treeRuleCategory?categoryType=${categoryType}`);
  return res.data;
}

// 添加线索规则分类
export async function addListCategory(json: any) {
  const res = await post(`${ruleUrl}/addRuleCategory`, json);
  return res;
}

// 搜索线索规则分类
export async function searchRuleList(json: any) {
  const res = await post(`${ruleUrl}/list`, json);
  return res.data;
}

// 查询风险分类
export async function getRuleCategory() {
  const res = await get(`${ruleUrl}/allRuleCategory`);
  return res.data;
}

// 查询客户类型
export async function getCustomerType() {
  const res = await get(`${ruleUrl}/customerType`);
  return res.data;
}

// 查询行业类型
export async function getIndustryType() {
  const res = await get(`${ruleUrl}/industry`);
  return res.data;
}

// 查询产品分类
export async function getProductCategory() {
  const res = await get(`${ruleUrl}/productCategory`);
  return res.data;
}

// 查询模型
export async function getRuleModel(json: any) {
  const res = await post(`${ruleUrl}/ruleModel`, json);
  return res.data;
}

// 查询模型列表不分页
export async function queryRuleModelList() {
  const res = await get(`${ruleUrl}/queryRuleModelList`);
  return res;
}

// 查询线索关联风险
export async function getWarningRelate() {
  const res = await get(`${ruleUrl}/warningRelate`);
  return res.data;
}

// 编辑线索规则(批处理对象),上传文件
export async function uploadDocument(json: any) {
  const res = await post(`${ruleUrl}/edit/batch`, json);
  return res;
}

// 编辑线索规则(群体对象)
export async function editGroupRules(json: any) {
  const res = await post(`${ruleUrl}/edit/group`, json);
  return res;
}

// 编辑线索规则(单一对象)
export async function editSingleRules(json: any) {
  const res = await post(`${ruleUrl}/edit/single`, json);
  return res;
}

// 删除线索规则(单一对象)
export async function deleteSingleRules(json: any) {
  const res = await post(`${ruleUrl}/del/single`, json);
  return res;
}

// 删除线索分类
export async function deleteWarningCategory(json: any) {
  const res = await post(`${ruleUrl}/delRuleCategory`, json);
  return res;
}

// 启用/停用规则
export async function editWarningRuleStatus(json: any) {
  const res = await put(`${ruleUrl}/editWarningRuleStatus`, json);
  return res;
}
// {
//   timeout: -1,
// }

// 启用/停用模型
export async function editRuleModel(json: any) {
  const res = await post(`${ruleUrl}/editRuleModel`, json);
  return res;
}

// 获取模型详情
export async function getRuleModelDetail(json: any) {
  const res = await post(`${ruleUrl}/ruleModelDetail`, json);
  return res.data;
}

// 删除模型
export async function delRuleModel(json: any) {
  const res = await post(`${ruleUrl}/delRuleModel`, json);
  return res;
}

// 批量上传
export async function batchUpload(formData: any) {
  const res = await upload(`${ruleUrl}/batchUpload`, formData);
  return res;
}

// 查看规则详情
export async function getRuleDetails(id: string) {
  const res = await get(`${ruleUrl}/getRuleDetails?ruleId=${id}`);
  return res.data;
}

// 下载批量上传文件
export async function getDownloadFiles(path: any) {
  const res = await get(
    encodeURI(`${ruleUrl}/batchDownLoad?path=${path}`, {
      responseType: "blob",
      headers: {
        "Content-Type": "application/octet-stream;charset=UTF-8",
      },
    })
  );
  return res;
}

// 下载示例
export async function downloadSampleFile() {
  const res = await get(
    encodeURI(`${ruleUrl}/batchDownLoad?path=/media/rule-file/批量查询示例文件.csv`)
  );
  return res;
}

// 图谱管理接口

// 分页查询接口
export async function queryGraphByPage(json: any) {
  const res = await post(`${graphUrl}/queryGraphByPage`, json);
  return res.data;
}

// 启用/停用接口
export async function updateStatus(json: any) {
  const res = await post(`${graphUrl}/updateStatus`, json);
  return res;
}
// 删除接口
export async function deleteGraphTable(json: any) {
  const res = await post(`${graphUrl}/deleteGraphTable`, json);
  return res;
}

// schema相关接口

// 分页查询接口
export async function queryGraphSchemaByPage(json: any) {
  const res = await post(`${schemaUrl}/queryGraphSchemaByPage`, json);
  return res.data;
}

// 预览接口
export async function graphPreview(id: string) {
  // 预览接口，目前id为schemaId
  const res = await get(`${schemaUrl}/graphPreview?id=${id}`);
  return res.data;
}

// 获取函数列表和操作符列表的接口
export async function queryDicList(type: string) {
  const res = await get(`${schemaUrl}/queryDicList?dicType=${type}`);
  return res.data;
}

// 生成cypher语句接口
export async function createCypher(json: any) {
  const res = await post(`${schemaUrl}/createCypher`, json);
  return res;
}

// 保存新增模型接口
export async function addRuleModel(json: any) {
  const res = await post(`${ruleUrl}/addRuleModel`, json);
  return res;
}

// 保存新增模型图片接口
export async function saveModelImg(json: any) {
  const res = await post(`${ruleUrl}/saveModelImg`, json);
  return res;
}

// 获取模型完整详情接口
export async function getRuleModelDetails(id: string) {
  const res = await get(`${ruleUrl}/getRuleModelDetails?id=${id}`);
  return res;
}

// 新增/编辑规则
export async function addOrEditWarningRule(json: any) {
  const res = await post(`${ruleUrl}/addOrEditWarningRule`, json);
  return res;
}

// 模型图谱检查
// export async function checkWarnOrNot(json) {
//   const res = await axiosInstance.post(`${ruleUrl}/checkWarnOrNot`, json, {
//     timeout: -1,
//   });
//   return res;
// }

// 查询图谱对应蓝图的点边信息
export async function getGraphMeta(graphId: string) {
  // 本地图谱用schemaId，kg图谱用graphId
  const res = await get(`${schemaUrl}/graphLabel?id=${graphId}`);
  return res.data;
}

// 分页查询模板列表
export async function queryTemplateByPage(json: any) {
  const res = await post(`${templateUrl}/queryTemplateByPage`, json);
  return res.data;
}

// 启用/停用模板
export async function updateTemplateStatus(json: any) {
  const res = await post(`${templateUrl}/updateTemplateStatus`, json);
  return res;
}

// 删除模板
export async function delTemplate(json: any) {
  const res = await post(`${templateUrl}/delTemplate`, json);
  return res;
}

// 新增模板
export async function addTemplate(json: any) {
  const res = await post(`${templateUrl}/addTemplate`, json);
  return res;
}

// 编辑模板
export async function editTemplate(json: any) {
  const res = await post(`${templateUrl}/editTemplate`, json);
  return res;
}

// 根据模板创建模型
export async function createModelByTempId(json: any) {
  const res = await post(`${templateUrl}/createModelByTempId`, json);
  return res;
}

// 模型编辑
export async function updateRuleModel(json: any) {
  const res = await post(`${ruleUrl}/updateRuleModel`, json);
  return res;
}

// 查询模板详情
export async function getTemplateDetails(id: string, type: number) {
  const res = await get(`${templateUrl}/getTemplateDetails?id=${id}&type=${type}`);
  return res.data;
}
