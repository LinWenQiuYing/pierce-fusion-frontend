import { del, get, post } from "./index.ts";

const graphUrl = "/pierce/graphSchema";
const tableUrl = "/pierce/graphTableResource";

// 获取蓝图详情
export async function getSchemaDetail(id: string) {
  const res = await get(`${graphUrl}/getSchemaDetail?id=${id}`);
  return res;
}

// 查询蓝图列表
export async function queryGraphSchemaList() {
  const res = await post(`${graphUrl}/queryGraphSchema/list`);
  return res.data;
}

// 分页查询蓝图信息
export async function querySchemaList(json: any) {
  const res = await post(`${graphUrl}/SchemaQueryByPage`, json);
  return res;
}

//删除
export async function deleteSchema(id: string) {
  const res = await get(`${graphUrl}/deleteSchemaByPk?id=${id}`);
  return res;
}

// 图谱接口
// 获取可创建图谱的蓝图
export async function getUsefulSchema(json: any) {
  const res = await post(`${tableUrl}/getUserfulSchema`, json);
  return res;
}

// 查询图谱版本
export async function queryGraphVersion(json: any) {
  const res = await post(`${tableUrl}/queryGraphBranByPage`, json);
  return res;
}

// 分页查询图谱更新日志
export async function graphUpdateDetail(json: any) {
  const res = await post(`${tableUrl}/graphUpdateDetail`, json);
  return res;
}

// 删除图谱分支
export async function delGraphBranch(branchId: string) {
  const res = await del(`${tableUrl}/delGraphBranch?branchId=${branchId}`);
  return res;
}

// 设置图谱更新策略
export async function updateGraphTable(json: any) {
  const res = await post(`${tableUrl}/updateGraphTable`, json);
  return res;
}

// 图谱版本选择
export async function selectGraphBranch(json: any) {
  const res = await post(`${tableUrl}/selectGraphBranch`, json);
  return res;
}

// 查询图谱是否正在更新
export async function getGraphState(id: string) {
  const res = await get(`${tableUrl}/getTwpCompositionLogStatue?id=${id}`);
  return res;
}

// 创建图谱
export async function createGraph(json: any) {
  const res = await post(`${tableUrl}/creatGraphBySchema`, json);
  return res;
}
