import { post, get } from "./index.ts";
import { UserLoginType, UserResType, ResType } from "@/types";

const loginUrl = "/pierce/login";
const resUrl = "/pierce/resource";

// 生成验证码
export async function getVerCode() {
  const res = await post(`${loginUrl}/verCode`);
  return res.data;
}

// 登录
export async function userLogin(json: UserLoginType) {
  const res = await post(`${loginUrl}/`, json);
  return res;
}

// 登出
export async function userLogout(token: string) {
  const res = await get(`${loginUrl}/clear/${token}`);
  return res;
}

// 获取账号权限资源列表
export async function getUserPermission(roleId: string) {
  const res = await get(`${resUrl}/queryImpowerResource?roleId=${roleId}`);
  return res.data;
}

// 角色授权
export async function impowerResource(json: UserResType) {
  const res = await post(`${resUrl}/impowerResource`, json);
  return res;
}

// 资源管理列表查询
export async function getResourceList(json: ResType) {
  const res = await post(`${resUrl}/query`, json);
  return res.data;
}
