import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const layout = () => import("@/layout/pierceLayout.vue");

const pierceLogin = () => import("@views/pierceLogin/pierceLogin.vue");
const sourceManage = () => import("@views/sourceManage/sourceManage.vue");
const createSource = () => import("@views/sourceManage/createSource.vue");
const graphSource = () => import("@views/sourceManage/graphSource.vue");
const graphsStructure = () => import("@views/graphsStructure/graphsStructure.vue");
const blueprintManage = () => import("@views/graphsStructure/blueprintManage/blueprintManage.vue");
const graphsManage = () => import("@views/graphsStructure/graphsManage/graphsManage.vue");
const templatesManage = () => import("@views/configManage/templatesManage/templatesManage.vue");
const modelsManage = () => import("@views/configManage/modelsManage/modelsManage.vue");
const rulesManage = () => import("@views/configManage/warningRules/warningRules.vue");

// const riskOverview = () => import("@/views/riskOverview");
// const entityInsight = () => import("@/views/entityInsight");
// const enterpriseInsight = () =>
//   import("@/views/entityInsight/enterpriseInsight");
// const personInsight = () => import("@/views/entityInsight/personInsight");
// const employeeInsight = () => import("@/views/entityInsight/employeeInsight");
// const affairGraph = () => import("@/views/affairGraph");
// const affairGraphSearch = () => import("@/views/affairGraph/graphSearch");
// const affairGraphAnalysis = () => import("@/views/affairGraph/graphAnalysis");
// const riskWarning = () => import("@/views/riskWarning");
// const riskWarningInfo = () => import("@/views/riskWarning/riskWarningInfo");
// const riskWarningStatistics = () =>
//   import("@/views/riskWarning/riskWarningStatistics");
// const configManage = () => import("@/views/configManage");
// const modelsManage = () => import("@/views/configManage/modelsManage");
// const rostersManage = () => import("@/views/configManage/namesManage");
// const rulesManage = () => import("@/views/configManage/warningRules");
// const templatesManage = () => import("@/views/configManage/templatesManage");
// const rightsManage = () => import("@/views/rightsManage");
// const organizationManage = () =>
//   import("@/views/rightsManage/organizationManage");
// const rolesManage = () => import("@/views/rightsManage/rolesManage");
// const usersManage = () => import("@/views/rightsManage/usersManage");
// const resourcesManage = () => import("@/views/rightsManage/resourcesManage");

const directAnalysis = () => import("@/views/directAnalysis/directAnalysis.vue");
const statisticalMeasure = () => import("@/views/statisticalMeasure/statisticalMeasure.vue");

export const baseRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "layout",
    component: layout,
    redirect: () => {
      let test = "";
      const layoutChildren = router.options.routes[0].children;
      if (layoutChildren && layoutChildren.length) {
        test =
          layoutChildren[0].children && layoutChildren[0].children.length
            ? layoutChildren[0].children[0].path === ""
              ? `${layoutChildren[0].path}`
              : `${layoutChildren[0].path}/${layoutChildren[0].children[0].path}`
            : layoutChildren[0].path;
      } else {
        test = "";
      }
      console.log("test---router", test);
      return test;
    },
    children: [
      {
        path: "source-manage",
        name: "sourceManage",
        component: sourceManage,
        children: [
          {
            path: "create-source",
            name: "createSource",
            component: createSource,
            meta: {
              keepAlive: true,
            },
          },
          {
            path: "graph-source",
            name: "graphSource",
            component: graphSource,
            meta: {
              keepAlive: true,
            },
          },
        ],
      },
      {
        path: "graphs-structure",
        name: "graphsStructure",
        component: graphsStructure,
        children: [
          {
            path: "blueprint",
            name: "blueprintManage",
            component: blueprintManage,
            meta: {
              keepAlive: true,
            },
          },
          {
            path: "graphs",
            name: "graphsManage",
            component: graphsManage,
            meta: {
              keepAlive: true,
            },
          },
        ],
      },
      {
        path: "templates",
        name: "templatesManage",
        component: templatesManage,
        meta: {
          keepAlive: true,
        },
      },
      {
        path: "models",
        name: "modelsManage",
        component: modelsManage,
        meta: {
          keepAlive: true,
        },
      },
      {
        path: "rules",
        name: "rulesManage",
        component: rulesManage,
        meta: {
          keepAlive: true,
        },
      },

      {
        path: "statistical-measure",
        name: "statisticalMeasure",
        component: statisticalMeasure,
      },
      // {
      //   path: "risk-warning",
      //   name: "riskWarning",
      //   component: riskWarning,
      // },
      // {
      //   path: "affair-graph",
      //   name: affairGraph,
      //   component: affairGraph,
      //   children: [
      //     {
      //       path: "",
      //       name: "affairGraphSearch",
      //       component: affairGraphSearch,
      //       meta: {
      //         keepAlive: true,
      //       },
      //     },
      //     {
      //       path: "details",
      //       name: "affairGraphAnalysis",
      //       component: affairGraphAnalysis,
      //       meta: {
      //         keepAlive: true,
      //       },
      //     },
      //   ],
      // },
      {
        path: "direct-analysis",
        name: "directAnalysis",
        component: directAnalysis,
      },
    ],
  },
  {
    path: "/login",
    name: "pierceLogin",
    component: pierceLogin,
  },
  {
    path: "/:pathMatch(.*)*", // 使用 ":pathMatch" 参数及自定义正则表达式 ".+*" 来匹配任意路径
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: baseRoutes,
});

export default router;

// 全局路由守卫
router.beforeEach((to, from, next) => {
  next();
  return;
});

router.afterEach(() => {
  NProgress.done();
});
