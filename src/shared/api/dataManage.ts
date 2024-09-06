import { del, get, post } from "./index.ts";

const baseUrl = "/flowEngine/database";
const sourceUrl = "/flowEngine/datasource";

// 分页查询数据库列表
export async function queryDataBaseByPage(json: any) {
  const res = await post(`${baseUrl}/queryDataBaseByPage`, json);
  return res;
}

// 分页查询数据源列表
export async function queryDatasourceByPage(json: any) {
  const res = await post(`${sourceUrl}/queryDatasourceByPage`, json);
  return res;
}

// 新增/编辑数据源
export async function operationDatasource(json: any) {
  const res = await post(`${sourceUrl}/operationDatasource`, json);
  return res;
}

// 新增/编辑数据库
export async function operationDatabase(json: any) {
  const res = await post(`${baseUrl}/operationDatabase`, json);
  return res;
}

// 查询指定组件参数
export async function getDsList() {
  const res = await get(`${sourceUrl}/queryDatasourceList`);
  return res;
}

// 删除数据源
export async function delDatasource(id: string) {
  const res = await del(`${sourceUrl}/delDatasource?id=${id}`, null);
  return res;
}

// 删除数据库
export async function delDatabase(id: string) {
  const res = await del(`${baseUrl}/delDatabase?id=${id}`, null);
  return res;
}
