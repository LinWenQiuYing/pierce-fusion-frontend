import type { Rule } from "ant-design-vue/es/form";

export interface LoginParamsType {
  verCodeImg: string;
  loading: boolean;
  verCodeValue: string;
  rules: Record<string, Rule[]>;
}

export interface LoginStateType {
  verCode: string;
  userName: string;
  userPassword: string;
}

export interface UserLoginType {
  account: string;
  password: string;
  verCode: string;
  loginType: number; // 登录方式。1：账号登录；2：手机登录；3：邮箱登录
}

export interface UserResType {
  id: string;
  roleId: string;
  resId: string;
}

export interface ResType {
  resCode: string;
  resName: string;
  menuName: string;
}
