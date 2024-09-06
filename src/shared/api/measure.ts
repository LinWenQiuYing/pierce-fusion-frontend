import { del, get, post } from "./index";
const measureUrl = "/pierce/measure";
/* 
    分页查询统计度量
    POST measure/queryMeasureByPage
*/
export async function queryMeasureByPage(json) {
  const res = await post(`${measureUrl}/queryMeasureByPage`, json);
  return res.data;
}

/*
    删除统计度量
    DELETE measure/delMeasure
*/
export async function delMeasure(id) {
  const res = await del(`${measureUrl}/delMeasure?id=${id}`);
  return res;
}

/*
    统计度量复制
    POST measure/measureCopy
*/
export async function measureCopy(json) {
  const res = await post(`${measureUrl}/measureCopy`, json);
  return res;
}

/*
    新增统计度量
    POST measure/addMeasure
*/

export async function addMeasure(json) {
  const res = await post(`${measureUrl}/addMeasure`, json);
  return res;
}

/*
    编辑统计度量
    POST measure/editMeasure
*/

export async function editMeasure(json) {
  const res = await post(`${measureUrl}/editMeasure`, json);
  return res;
}

/*
    查看统计度量详情
    GET measure/queryMeasureDetail
*/

export async function queryMeasureDetail(id) {
  const res = await get(`${measureUrl}/queryMeasureDetail?id=${id}`);
  return res.data;
}

/*
    查看蓝图列表
    post queryGraphSchema/list
*/

export async function queryGraphSchema() {
  const res = await post(`/pierce/graphSchema/queryGraphSchema/list`);
  return res.data;
}
