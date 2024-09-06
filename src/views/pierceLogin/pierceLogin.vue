<template>
  <div class="pierce-login">
    <div class="pierce-login-content">
      <div class="pierce-login-content-left">
        <p class="left-title">PIERCE金融风控平台</p>
        <p class="left-subtitle">Pierce Financial Risk Control Platform</p>
        <p class="left-desc">星环科技，构建明日数据世界</p>
      </div>
      <div class="pierce-login-content-right">
        <div class="pierce-login-content-right-header">
          <img src="@/assets/images/img/transwarp.png" alt="星环科技" />
        </div>
        <Form :wrapper-col="{ span: 24 }" class="pierce-login-content-right-form">
          <Form.Item name="userName" class="right-form-item" v-bind="validateInfos.userName">
            <Input
              v-model:value="loginState.userName"
              placeholder="用户名"
              @change="validate('userName', { trigger: 'change' }).catch(() => {})"
            >
              <template #prefix>
                <UserOutlined type="user" />
              </template>
            </Input>
          </Form.Item>

          <Form.Item
            name="userPassword"
            class="right-form-item"
            v-bind="validateInfos.userPassword"
          >
            <Password
              v-model:value="loginState.userPassword"
              placeholder="密码"
              @change="validate('userPassword', { trigger: 'change' }).catch(() => {})"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </Password>
          </Form.Item>

          <Form.Item name="verCode" class="right-form-item vercode" v-bind="validateInfos.verCode">
            <Input
              v-model:value="loginState.verCode"
              class="verify-input"
              placeholder="验证码"
              autoComplete="off"
              @blur="validate('verCode', { trigger: 'blur' }).catch(() => {})"
            >
              <template #prefix>
                <SafetyCertificateOutlined />
              </template>
            </Input>
            <div class="verify-img" @click="handleVerCode">
              <img :src="verCodeImg" alt="验证码" />
            </div>
          </Form.Item>

          <Form.Item name="btn" class="right-form-item">
            <Button class="pierce-login-btn" :loading="loading" @click.prevent="onFinish"
              >登录</Button
            >
          </Form.Item>
        </Form>
      </div>
    </div>
    <!-- 使用方法参见：https://www.npmjs.com/package/particles.vue3 -->
    <ParticlesComponent className="pierce-login-background" />
  </div>
</template>

<script setup lang="ts">
import { LockOutlined, SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons-vue";
import ParticlesComponent from "@components/particlesComponent.vue";
import { useUserStore } from "@store/user";
import { Button, Form, Input, message } from "ant-design-vue";
import { onBeforeUnmount, onMounted, reactive, toRefs } from "vue";
import { RouteRecordRaw, useRouter } from "vue-router";

import { baseRoutes } from "@/router/index.ts";
import { getVerCode, userLogin } from "@/shared/api/login";
import { LoginParamsType, LoginStateType, UserLoginType } from "@/types";
import { LocalStorage, isEmptyObj } from "@/utils/common";
import type { Rule } from "ant-design-vue/es/form";
import { cloneDeep } from "lodash-es";

const { Password } = Input;
const useForm = Form.useForm;

const router = useRouter();
const store = useUserStore();
const target = store.target;

const loginState: LoginStateType = reactive({
  verCode: "",
  userName: "",
  userPassword: "",
});

const loginParams: LoginParamsType = reactive({
  verCodeImg: "",
  loading: false,
  verCodeValue: "",
  rules: {
    userName: [{ required: true, message: "请输入用户名" }],
    userPassword: [{ required: true, message: "请输入密码" }],
    verCode: [
      {
        validator: (_rule: Rule, value: string) => {
          if (!value) {
            return Promise.reject("请输入验证码");
          } else if (value.toLowerCase() !== loginParams.verCodeValue.toLowerCase()) {
            handleVerCode();
            loginState.verCode = "";
            return Promise.reject("验证码输入有误");
          } else {
            return Promise.resolve();
          }
        },
        trigger: "blur",
      },
    ],
  },
});

const { verCodeImg, loading, rules } = toRefs(loginParams);
const { validate, validateInfos } = useForm(loginState, rules);

const handleVerCode = async () => {
  const data = await getVerCode();

  if (data) {
    loginParams.verCodeImg = data.base64ImageCode;
    loginParams.verCodeValue = data.code;
  }
};

const onFinish = async () => {
  // 手动触发form校验
  await validate().catch((err) => {
    return Promise.reject(err);
  });
  loginParams.loading = true;
  const json: UserLoginType = {
    account: loginState.userName,
    password: loginState.userPassword,
    verCode: loginState.verCode,
    loginType: 1,
  };
  const res = await userLogin(json);
  if (res.message === "成功") {
    loginParams.loading = false;
    message.success("登录成功");
    const rights = res.data.resourcesCode; // 保存资源权限
    const userRights = cloneDeep(store.userBaseRights);
    rights.map((right: string) => {
      userRights[right] = true;
    });
    // userRights.graphsStructure = true;
    // userRights.blueprintManage = true;
    userRights.sourceManage = true;
    userRights.createSource = true;
    userRights.graphSource = true;
    userRights.directAnalysis = true;
    userRights.statisticameasure = true;
    const routes = [...baseRoutes];
    routes[0] &&
      routes[0].children &&
      routes[0].children.map((item: RouteRecordRaw) => {
        if (item.name) {
          const flag = userRights[String(item.name)];
          if (flag) {
            if (item.children && item.children.length) {
              const carr: RouteRecordRaw[] = [];
              item.children.map((citem: RouteRecordRaw) => {
                const cflag = userRights[String(citem.name)];
                if (!cflag) {
                  router.removeRoute(String(citem.name));
                }
              });
              item.children = carr;
            }
          } else {
            router.removeRoute(String(item.name));
          }
        } else {
          const flag = userRights["affairGraph"];
          if (!flag) {
            router.removeRoute("affairGraph");
          }
        }
      });

    // 判断登录用户的角色是否包含超级管理员角色
    let isRoot = false;
    for (let i = 0; i < res.data.roles.length; i++) {
      const role = res.data.roles[i];
      if (role.roleCode === "root") {
        isRoot = true;
        break;
      }
    }
    if (isRoot) {
      userRights.btn_doRuleTask = true;
    }
    // 一切就绪，保存用户信息与用户权限信息
    const userInfo = {
      token: res.data.token,
      roles: res.data.roles,
      userId: res.data.id,
      userName: res.data.account,
    };
    LocalStorage.setItem({
      name: "userInfo",
      value: JSON.stringify(userInfo),
      expires: 259200000, // 三天
    });
    store.setUserInfo(userInfo);
    LocalStorage.setItem({
      name: "userRights",
      value: JSON.stringify(userRights),
      expires: 259200000, // 三天
    });
    store.setUserRights(userRights);
    // 登录成功，跳转主界面路由
    console.log("target", target);
    router.replace(target);
  } else {
    loginParams.loading = false;
    message.error(`${res.message}`);
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  e.stopPropagation();
  if (e.key === "Enter") {
    onFinish();
  }
};

onMounted(() => {
  if (isEmptyObj(store.userBaseRights)) {
    store.setUserBaseRights();
  }
  handleVerCode();
  if (store.userInfo.token) {
    router.replace(target);
  }
  document.body.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  document.body.removeEventListener("keydown", handleKeyDown);
});
</script>

<style lang="less" scoped>
@import "./index.less";
</style>
