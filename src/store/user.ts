import { setTheme } from "@/assets/theme/theme";
import { getResourceList } from "@/shared/api/login";
import { ResListItemType, SourceType } from "@/types";
import { getUserInfo, getUserRights } from "@/utils/common";
import { defineStore } from "pinia";

interface UserState {
  userInfo: UserInfo;
  userRights: Record<string, boolean>;
  userBaseRights: Record<string, boolean>;
  resourceList: SourceType[];
  theme: string;
  collapsed: boolean;
  target: string;
}

interface UserInfo {
  userName: string;
  token: string | undefined;
  userId: string;
}

const getChildResources = (
  list: ResListItemType[],
  userRights: Record<string, boolean>
): {
  children: SourceType[];
  userRights: Record<string, boolean>;
} => {
  const arr = list.map((ele) => {
    let children: SourceType[] = [];
    userRights[ele.resCode] = false;
    if (ele.childResources) {
      const result = getChildResources(ele.childResources, userRights);
      children = result.children;
      userRights = result.userRights;
    }
    return {
      key: ele.id,
      isLeaf: ele.childResources && ele.childResources.length ? false : true,
      title: ele.resName,
      children,
      resName: ele.resName,
      resCode: ele.resCode,
    };
  });
  return {
    children: arr,
    userRights: userRights,
  };
};

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    userInfo: getUserInfo() || {},
    userRights: getUserRights() || {
      riskOverview: true,
      entityInsight: true,
      enterpriseInsight: true,
      personInsight: true,
      employeeInsight: true,
      riskWarning: true,
      riskWarningInfo: true,
      riskWarningStatistics: true,
      affairGraph: true,
      configManage: true,
      rulesManage: true,
      modelsManage: true,
      creatGraph: true,
      graphManage: true,
      schemaManage: true,
      templatesManage: true,
      rostersManage: true,
      rightsManage: true,
      organizationManage: true,
      root_mn_sm_user_query: true,
      root_mn_sm_roles_query: true,
      root_mn_sm_resource_query: true,
      pierceLogin: true,
    },
    userBaseRights: {},
    resourceList: [],
    theme: localStorage.getItem("theme") || "light",
    collapsed: false,
    target: "/",
  }),
  actions: {
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo;
    },
    setUserRights(userRights: Record<string, boolean>) {
      this.userRights = userRights;
    },
    async setUserBaseRights() {
      const res = await getResourceList({
        resCode: "",
        resName: "",
        menuName: "",
      });
      if (res) {
        let userRights: Record<string, boolean> = {};
        const list = res.map((item: ResListItemType) => {
          let children = null;
          userRights[item.resCode] = false;
          if (item.childResources) {
            const result = getChildResources(item.childResources, userRights);
            children = result.children;
            userRights = result.userRights;
          }
          return {
            key: item.id,
            isLeaf: false,
            title: item.resName,
            children,
            resName: item.resName,
            resCode: item.resCode,
          };
        });
        this.setResourceList(list);
        this.userBaseRights = userRights;
      } else {
        this.userBaseRights = {};
      }
    },
    setResourceList(resourceList: SourceType[]) {
      this.resourceList = resourceList;
    },
    setTheme(theme: string) {
      this.theme = theme;
      setTheme(theme);
    },
    setCollapsed(collapsed: boolean) {
      this.collapsed = collapsed;
    },
    setTarget(target: string) {
      this.target = target;
    },
  },
  getters: {},
});
