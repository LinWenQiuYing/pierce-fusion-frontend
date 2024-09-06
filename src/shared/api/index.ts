import router from "@/router";
import { getUserInfo, LocalStorage } from "@/utils/common";
import { useUserStore } from "@store/user";
import { message } from "ant-design-vue";
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import qs from "qs";

const axiosInstance: AxiosInstance = axios.create({
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
  timeout: 0, // 请求超时时间，单位毫秒
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

// 添加请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送请求之前做些什么
    const store = useUserStore();
    if (store.userInfo && store.userInfo.token && config.headers) {
      config.headers["authentication"] = getUserInfo().token;
    }
    return config;
  },
  (error: any) => {
    // 处理请求错误
    return Promise.reject(error);
  }
);

// 添加响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 对响应数据做点什么
    const store = useUserStore();
    if (response.data.code === 30025 || response.data.message === "登录超时") {
      store.userInfo.token = undefined;
      LocalStorage.removeItem("userInfo");
      message.destroy();
      message.error("登录超时，请重新登录！", 2);
      setTimeout(() => {
        store.setTarget(window.location.pathname);
        router.replace("/login");
      }, 1000);
      return;
    } else {
      return response.data;
    }
  },
  (error: any) => {
    // 处理响应错误
    let errorMessage = "";
    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorMessage = "错误请求";
          break;
        case 401:
          /* TODO 待调整 */
          location.href = `${location.protocol}//${location.host}/gateway/user/api/users/login`;
          return;
        case 403:
          errorMessage = "拒绝访问";
          break;
        case 404:
          errorMessage = "请求错误,未找到该资源";
          break;
        case 405:
          errorMessage = "请求方法未允许";
          break;
        case 408:
          errorMessage = "请求超时";
          break;
        case 500:
          errorMessage = "服务器端出错";
          break;
        case 501:
          errorMessage = "网络未实现";
          break;
        case 502:
          errorMessage = "网络错误";
          break;
        case 503:
          errorMessage = "服务不可用";
          break;
        case 504:
          errorMessage = "网络超时";
          break;
        case 505:
          errorMessage = "http版本不支持该请求";
          break;
        default:
          errorMessage = `连接错误${error.response.status}`;
      }
    } else {
      errorMessage = "请求超时";
    }
    message.destroy();
    console.error(errorMessage);
    return Promise.reject(errorMessage);
  }
);

export default axiosInstance;

export interface ApiResult {
  code: number;
  message: string;
  data: any;
}
export async function get(url: string, params?: any): Promise<ApiResult> {
  const response: ApiResult = await axiosInstance.get(url, { params });
  return response;
}
export async function post(url: string, data?: any): Promise<ApiResult> {
  const response: ApiResult = await axiosInstance.post(url, data, { timeout: -1 });
  return response;
}
export async function upload(url: string, data?: any): Promise<ApiResult> {
  const response: ApiResult = await axiosInstance.post(url, data, { timeout: 30000 });
  return response;
}
export async function put(url: string, data?: any): Promise<ApiResult> {
  const response: ApiResult = await axiosInstance.put(url, data);
  return response;
}
export async function del(url: string, params?: any): Promise<ApiResult> {
  const response: ApiResult = await axiosInstance.delete(url, { params });
  return response;
}
