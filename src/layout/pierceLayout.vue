<template>
  <Layout class="pierce-layout" id="pierce-layout">
    <Layout.Header class="pierce-layout-header">
      <div class="logo" v-if="collapsed" style="width: 64px">
        <icon-svg icon-class="pierce-logo-small" className="pierce-logo" />
      </div>
      <div class="logo" v-else>
        <icon-svg icon-class="pierce-logo" className="pierce-logo" />
      </div>
      <div
        class="pierce-layout-header-right"
        :style="{
          width: collapsed ? 'calc(100% - 64px)' : 'calc(100% - 160px)',
        }"
      >
        <Tabs
          class="pierce-tabs"
          v-model:activeKey="activeKey"
          hide-add
          type="editable-card"
          @edit="onEdit"
          @change="handleChangeTab"
        >
          <Tabs.TabPane
            v-for="pane in panes"
            :key="pane.key"
            :tab="pane.title"
            :closable="pane.closable"
          >
          </Tabs.TabPane>
        </Tabs>
        <div class="user-info">
          <div class="info-item time">{{ nowTime }}</div>
          <!-- <Popover
            overlayClassName="theme-popover"
            trigger="hover"
            placement="bottom"
          >
            <template #content>
              <div
                class="theme-popover-item"
                @click="handleChangeTheme(item.value)"
                v-for="item in themeList"
                :key="item.value"
              >
                <p class="item-content">
                  <a-icon v-if="item.value === theme" type="check" />
                  <span class="item-content-text">{{ item.title }}</span>
                </p>
              </div>
            </template>
            <div class="info-item theme">
              <icon-svg icon-class="skin" className="theme-icon" />
            </div>
          </Popover> -->
          <div class="info-item message">
            <icon-svg alt="消息" className="message-icon" icon-class="bell" />
          </div>
          <Popover overlayClassName="user-info-part" trigger="hover" placement="bottomRight">
            <template #content>
              <div class="logout-btn" @click="logout">退出登录</div>
            </template>
            <div class="info-item user-info-content">{{ userName }}</div>
          </Popover>
        </div>
      </div>
    </Layout.Header>
    <Layout class="pierce-layout-content">
      <Layout.Sider
        class="pierce-layout-content-left"
        v-model:collapsed="collapsed"
        :trigger="null"
        collapsible
        :width="160"
        :collapsedWidth="64"
      >
        <Menu
          theme="dark"
          mode="inline"
          :default-selected-keys="['1']"
          :inline-collapsed="collapsed"
          :selectedKeys="selectedKeys"
          :open-keys="openKeys"
          @openChange="handleOpenChange"
          :inlineIndent="24"
        >
          <Menu.SubMenu key="1" v-if="userRights.sourceManage">
            <template #title>
              <span class="sub-menu-title">
                <div class="menu-icon">
                  <icon-svg icon-class="icon_dataSource" />
                </div>
                <span class="menu-text">数据源管理</span>
              </span>
            </template>
            <Menu.Item
              key="1.1"
              @click="handleChangeLink('source-manage/create-source', '1.1', 'menu')"
              v-if="userRights.createSource"
            >
              <span class="menu-text">构图数据源</span>
            </Menu.Item>
            <Menu.Item
              key="1.2"
              @click="handleChangeLink('source-manage/graph-source', '1.2', 'menu')"
              v-if="userRights.graphSource"
            >
              <span class="menu-text">图库数据源</span>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu key="2" v-if="userRights.creatGraph">
            <template #title>
              <span class="sub-menu-title">
                <div class="menu-icon">
                  <icon-svg icon-class="icon_creatGraph" />
                </div>
                <span class="menu-text">图谱构建</span>
              </span>
            </template>
            <Menu.Item
              key="2.1"
              @click="handleChangeLink('graphs-structure/blueprint', '2.1', 'menu')"
              v-if="userRights.schemaManage"
            >
              <span class="menu-text">蓝图管理</span>
            </Menu.Item>
            <Menu.Item
              key="2.2"
              @click="handleChangeLink('graphs-structure/graphs', '2.2', 'menu')"
              v-if="userRights.graphManage"
            >
              <span class="menu-text">图谱管理</span>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.Item
            key="3"
            @click="handleChangeLink('templates', '3', 'menu')"
            v-if="userRights.templatesManage"
          >
            <div class="menu-icon">
              <icon-svg icon-class="icon_templatesManage" />
            </div>
            <span class="menu-text">模板管理</span>
          </Menu.Item>
          <Menu.Item
            key="4"
            @click="handleChangeLink('models', '4', 'menu')"
            v-if="userRights.modelsManage"
          >
            <div class="menu-icon">
              <icon-svg icon-class="icon_modelsManage" />
            </div>
            <span class="menu-text">图谱模型</span>
          </Menu.Item>
          <Menu.Item
            key="5"
            @click="handleChangeLink('rules', '5', 'menu')"
            v-if="userRights.rulesManage"
          >
            <div class="menu-icon">
              <icon-svg icon-class="icon_rulesManage" />
            </div>
            <span class="menu-text">图谱规则</span>
          </Menu.Item>
          <Menu.Item
            key="6"
            @click="handleChangeLink('statistical-measure', '6', 'menu')"
            v-if="userRights.statisticameasure"
          >
            <div class="menu-icon">
              <icon-svg icon-class="icon_statisticalMeasure" />
            </div>
            <span class="menu-text">统计度量</span>
          </Menu.Item>
          <Menu.Item
            key="7"
            @click="handleChangeLink('risk-warning', '7', 'menu')"
            v-if="userRights.riskWarning"
          >
            <div class="menu-icon">
              <icon-svg icon-class="icon_riskWarning" />
            </div>
            <span class="menu-text">线索管理</span>
          </Menu.Item>
          <Menu.Item
            key="8"
            @click="handleChangeLink('affair-graph', '8', 'menu')"
            v-if="userRights.affairGraph"
          >
            <div class="menu-icon">
              <icon-svg icon-class="icon_affairGraph" />
            </div>
            <span class="menu-text">图谱探索</span>
          </Menu.Item>
          <Menu.Item
            key="9"
            @click="handleChangeLink('direct-analysis', '9', 'menu')"
            v-if="userRights.directAnalysis"
          >
            <div class="menu-icon">
              <icon-svg icon-class="icon_directAnalysis" />
            </div>
            <span class="menu-text">隐藏关系发现</span>
          </Menu.Item>
        </Menu>
        <div class="menu-footer">
          <div class="footer-left" v-if="!collapsed">
            <div class="footer-left-img">
              <icon-svg color="#1C5B8F" icon-class="pierce-logo-small" />
            </div>
            <span class="footer-text">Transwarp</span>
          </div>
          <MenuUnfoldOutlined v-if="collapsed" @click="() => (collapsed = !collapsed)" />
          <MenuFoldOutlined v-else @click="() => (collapsed = !collapsed)" />
        </div>
      </Layout.Sider>
      <Layout.Content class="pierce-layout-content-right">
        <keep-alive>
          <router-view v-slot="{ Component }" v-if="route.meta.keepAlive">
            <transition>
              <component :is="Component" />
            </transition>
          </router-view>
        </keep-alive>
        <router-view v-slot="{ Component }" v-if="!route.meta.keepAlive">
          <transition name="fade">
            <component :is="Component" />
          </transition>
        </router-view>
      </Layout.Content>
    </Layout>
  </Layout>
</template>

<script setup lang="ts">
import { queryGraphList } from "@/shared/api/configManage";
import { userLogout } from "@/shared/api/login";
import { GraphItemType, GraphOptionType, Key, LayoutParamsType, PaneType } from "@/types";
import { LocalStorage, isEmptyObj } from "@/utils/common";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons-vue";
import { useGraphStore } from "@store/graph";
import { useUserStore } from "@store/user";
import { Layout, Menu, Popover, Tabs } from "ant-design-vue";
import dayjs from "dayjs";
import { computed, onBeforeUnmount, onMounted, reactive, toRefs, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const userStore = useUserStore();
const graphStore = useGraphStore();
const route = useRoute();
const router = useRouter();

const layoutParams: LayoutParamsType = reactive({
  activeKey: "1",
  selectedKeys: [],
  openKeys: [],
  openKeysCopy: [],
  panes: [],
  nowTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  timer: null,
  themeList: [
    {
      title: "明亮",
      value: "light",
    },
    {
      title: "暗黑",
      value: "black",
    },
  ],
  collapsed: false,
});

const { activeKey, selectedKeys, openKeys, panes, nowTime, collapsed } = toRefs(layoutParams);

const userName = computed(() => {
  return userStore.userInfo.userName;
});

const userRights = computed(() => {
  return userStore.userRights;
});

const onEdit = (targetKey: Key | MouseEvent | KeyboardEvent) => {
  remove(targetKey as string);
};

const remove = (targetKey: string) => {
  const panes = layoutParams.panes;
  for (let i = 0; i < panes.length; i++) {
    if (panes[i].key === targetKey) {
      const { path } = panes[i];
      panes.splice(i, 1);
      if (route.path === `/${path}`) {
        // 想要删除的tab的path为当前路径,则切换router为前一个tab
        if (i === 0) {
          layoutParams.selectedKeys = [panes[i].key];
          router.push(`/${panes[i].path}`);
          layoutParams.activeKey = panes[i].key;
        } else {
          layoutParams.selectedKeys = [panes[i - 1].key];
          router.push(`/${panes[i - 1].path}`);
          layoutParams.activeKey = panes[i - 1].key;
        }
      }
      if (panes.length === 1) {
        panes[0].closable = false;
      }
      break;
    }
  }
};

const handleChangeLink = (url: string, key: string, type: string) => {
  if (route.path === `/${url}`) {
    // 跳转路由与当前路由相同
    return;
  } else {
    layoutParams.selectedKeys = [key];
    router.push(`/${url}`);
  }
  if (type === "menu") {
    // 如果从左侧菜单点击跳转，则清除缓存
  }
};

const handleChangeTab = (activeKey: Key) => {
  const panes = layoutParams.panes;
  let target: PaneType = {
    key: "",
    title: "",
    closable: false,
    path: "",
  };
  for (let i = 0; i < panes.length; i++) {
    if (panes[i].key === activeKey) {
      target = panes[i];
      break;
    }
  }
  const { path, key } = target;
  handleChangeLink(path, key, "tab");
};

const handleOpenChange = (keys: Key[]) => {
  layoutParams.openKeys = keys.slice(-1) as string[];
  layoutParams.openKeysCopy = layoutParams.openKeys;
};

const handleUpdataTabs = (
  url: string,
  title: string,
  selectKey: string,
  activeKey: string,
  fromUrl: string | undefined
) => {
  if (!fromUrl) return;
  const panes = layoutParams.panes;
  layoutParams.selectedKeys = [selectKey];
  // 跳转路由与当前路由不同
  let flag = false; // 表示没有重复路由
  for (let i = 0; i < panes.length; i++) {
    if (title === panes[i].title) {
      // tabs中已经存在
      flag = true;
      layoutParams.activeKey = activeKey;
      break;
    }
  }
  if (!flag) {
    // tabs中不存在
    panes.push({
      title,
      key: activeKey,
      path: url,
      closable: true,
    });
    layoutParams.panes = panes;
    layoutParams.activeKey = activeKey;
  }
  if (panes.length > 1) {
    panes[0].closable = true;
  }
};

const logout = () => {
  userLogout(userStore.userInfo.token as string);
  LocalStorage.removeItem("userInfo");
  LocalStorage.removeItem("userRights");
  userStore.setUserInfo({
    userName: "",
    token: undefined,
    userId: "",
  });
  // 重置用户权限
  userStore.setUserRights({
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
    rostersManage: true,
    rightsManage: true,
    organizationManage: true,
    root_mn_sm_user_query: true,
    root_mn_sm_roles_query: true,
    root_mn_sm_resource_query: true,
    pierceLogin: true,
  });
  userStore.setTarget(window.location.pathname);
  router.replace("/login");
};

const getGraphList = async () => {
  const graphList = await queryGraphList();
  const graphOptions: GraphOptionType[] = [];
  if (graphList) {
    graphList.map((graph: GraphItemType) => {
      graphOptions.push({
        label: graph.graphChName,
        value: graph.id,
        branchId: graph.branchId,
        schemaId: graph.schemaId,
        graphSource: graph.source,
      });
    });
    if (graphOptions.length) {
      graphStore.setGraphId(graphOptions[0].value);
      graphStore.setSchemaId(graphOptions[0].schemaId);
      graphStore.setGraphSource(graphOptions[0].graphSource);
      sessionStorage.setItem("graphId", graphOptions[0].value);
      sessionStorage.setItem("schemaId", graphOptions[0].schemaId);
      sessionStorage.setItem("graphSource", graphOptions[0].graphSource.toString());
    } else {
      graphStore.setGraphId("");
      graphStore.setSchemaId("");
      graphStore.setGraphSource(1);
      sessionStorage.setItem("graphId", "");
      sessionStorage.setItem("schemaId", "");
      sessionStorage.setItem("graphSource", "1");
    }
  }
};

watch(
  () => router.currentRoute.value.path,
  (to, from) => {
    //要执行的方法
    console.log("to-from", to, from);
    const url = to.slice(1);
    const fromUrl = from?.slice(1);
    let title = "";
    let selectKey = "0";
    let activeKey = "0";
    switch (url) {
      case "source-manage/create-source":
        title = "构图数据源";
        selectKey = "1.1";
        activeKey = "1.1";
        if (layoutParams.collapsed) {
          layoutParams.openKeys = [];
        } else {
          layoutParams.openKeys = ["1"];
        }
        layoutParams.openKeysCopy = ["1"];
        break;
      case "source-manage/graph-source":
        title = "图库数据源";
        selectKey = "1.2";
        activeKey = "1.2";
        if (layoutParams.collapsed) {
          layoutParams.openKeys = [];
        } else {
          layoutParams.openKeys = ["1"];
        }
        layoutParams.openKeysCopy = ["1"];
        break;
      case "graphs-structure/blueprint":
        title = "蓝图管理";
        selectKey = "2.1";
        activeKey = "2.1";
        if (layoutParams.collapsed) {
          layoutParams.openKeys = [];
        } else {
          layoutParams.openKeys = ["2"];
        }
        layoutParams.openKeysCopy = ["2"];
        break;
      case "graphs-structure/graphs":
        title = "图谱管理";
        selectKey = "2.2";
        activeKey = "2.2";
        if (layoutParams.collapsed) {
          layoutParams.openKeys = [];
        } else {
          layoutParams.openKeys = ["2"];
        }
        layoutParams.openKeysCopy = ["2"];
        break;
      case "templates":
        title = "模板管理";
        selectKey = "3";
        activeKey = "3";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        break;
      case "models":
        title = "模型管理";
        selectKey = "4";
        activeKey = "4";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        break;
      case "rules":
        title = "规则管理";
        selectKey = "5";
        activeKey = "5";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        break;
      case "statistical-measure":
        title = "统计度量";
        selectKey = "6";
        activeKey = "6";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        break;
      case "risk-warning":
        title = "线索列表";
        selectKey = "7";
        activeKey = "7";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        break;
      case "affair-graph":
        title = "图谱探索";
        selectKey = "8";
        activeKey = "8";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        break;
      case "affair-graph/details":
        title = "图谱详情";
        selectKey = "8";
        activeKey = "8.1";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        break;
      case "direct-analysis":
        title = "隐藏关系发现";
        selectKey = "9";
        activeKey = "9";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        break;

      default:
        break;
    }
    if (url === "affair-graph/details") {
      // 在图谱详情页阻止浏览器右键事件
      document.oncontextmenu = function () {
        return false;
      };
    } else {
      // 在其他页面放开浏览器右键事件
      document.oncontextmenu = function () {
        return true;
      };
    }
    handleUpdataTabs(url, title, selectKey, activeKey, fromUrl);
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  if (isEmptyObj(userStore.userBaseRights)) {
    userStore.setUserBaseRights();
  }
  layoutParams.timer = setInterval(() => {
    layoutParams.nowTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  }, 1000);
  if (!graphStore.graphId || !graphStore.schemaId) {
    await getGraphList();
  }
  setTimeout(() => {
    const panes = [];
    switch (route.path) {
      case "/source-manage/create-source":
        layoutParams.selectedKeys = ["1.1"];
        layoutParams.activeKey = "1.1";
        layoutParams.openKeys = ["1"];
        layoutParams.openKeysCopy = ["1"];
        panes.push({
          title: "构图数据源",
          key: "1.1",
          path: "source-manage/create-source",
          closable: true,
        });
        break;
      case "/source-manage/graph-source":
        layoutParams.selectedKeys = ["1.2"];
        layoutParams.activeKey = "1.2";
        layoutParams.openKeys = ["1"];
        layoutParams.openKeysCopy = ["1"];
        panes.push({
          title: "图库数据源",
          key: "1.2",
          path: "source-manage/graph-source",
          closable: true,
        });
        break;
      case "/graphs-structure/blueprint":
        layoutParams.selectedKeys = ["2.1"];
        layoutParams.activeKey = "2.1";
        layoutParams.openKeys = ["2"];
        layoutParams.openKeysCopy = ["2"];
        panes.push({
          title: "蓝图管理",
          key: "2.1",
          path: "graphs-structure/blueprint",
          closable: true,
        });
        break;
      case "/graphs-structure/graphs":
        layoutParams.selectedKeys = ["2.2"];
        layoutParams.activeKey = "2.2";
        layoutParams.openKeys = ["2"];
        layoutParams.openKeysCopy = ["2"];
        panes.push({
          title: "图谱管理",
          key: "2.2",
          path: "graphs-structure/graphs",
          closable: true,
        });
        break;
      case "/templates":
        layoutParams.selectedKeys = ["3"];
        layoutParams.activeKey = "3";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        panes.push({
          title: "模板管理",
          key: "3",
          path: "templates",
          closable: true,
        });
        break;
      case "/models":
        layoutParams.selectedKeys = ["4"];
        layoutParams.activeKey = "4";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        panes.push({
          title: "图谱模型",
          key: "4",
          path: "models",
          closable: true,
        });
        break;
      case "/rules":
        layoutParams.selectedKeys = ["5"];
        layoutParams.activeKey = "5";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        panes.push({
          title: "图谱规则",
          key: "5",
          path: "rules",
          closable: true,
        });
        break;
      case "/statistical-measure":
        layoutParams.selectedKeys = ["6"];
        layoutParams.activeKey = "6";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        panes.push({
          title: "统计度量",
          key: "6",
          path: "statistical-measure",
          closable: true,
        });
        break;
      case "/risk-warning":
        layoutParams.selectedKeys = ["7"];
        layoutParams.activeKey = "7";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        panes.push({
          title: "线索列表",
          key: "7",
          path: "risk-warning",
          closable: true,
        });
        break;
      case "/affair-graph":
        layoutParams.selectedKeys = ["8"];
        layoutParams.activeKey = "8";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        panes.push({
          title: "图谱探索",
          key: "8",
          path: "affair-graph",
          closable: true,
        });
        break;
      case "/affair-graph/details":
        layoutParams.selectedKeys = ["8"];
        layoutParams.activeKey = "8.1";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        panes.push({
          title: "图谱详情",
          key: "8.1",
          path: "affair-graph/details",
          closable: true,
        });
        break;
      case "/direct-analysis":
        layoutParams.selectedKeys = ["9"];
        layoutParams.activeKey = "9";
        layoutParams.openKeys = [];
        layoutParams.openKeysCopy = [];
        panes.push({
          title: "隐藏关系发现",
          key: "9",
          path: "direct-analysis",
          closable: true,
        });
        break;

      default:
        break;
    }
    if (panes.length === 1) {
      panes[0].closable = false;
    }
    layoutParams.panes = panes;
  }, 300);
});

onBeforeUnmount(() => {
  if (!layoutParams.timer) return;
  clearInterval(layoutParams.timer);
  layoutParams.timer = null;
});
</script>

<style lang="less">
@import url("./index.less");
</style>
