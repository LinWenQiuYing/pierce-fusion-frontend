/* 
  pinia优势
  1.vue2/3都可以用。
  2.pinia中只有state、getter、action，抛弃了Vuex中的Mutation，用法更简单了。
  3.pinia 中 action支持同步和异步
  4.pinia 不用在使用模块（module）对store进行分割。
  5.pinia 支持插件来扩展自身功能。
  6.支持服务端渲染 (SSR)
*/

import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  /* 
    修改state——直接修改 || $patch({}) || $patch((state)=>{})
    想撤销修改，回到初始值使用store.$reset
  */
  /*
    $subscribe
    当state中的值任意一个发生变化的时候，就会触发该函数
  
    args: 里面会记录新旧值
    state：就是当前操作的state的实例
    options: 是一个对象，比如detached，这是一个boolean参数，当这个参数为true时，表明即使当前组件销毁后，也继续监控state里面值的变化，可选
    goodsStore.$subscribe((args, state) => {
      console.log('args', args)
      console.log('state', state)
    },{
      detached: true
    })
   */
  state: () => ({
    name: "张三",
    avatar: "头像",
    age: 18,
  }),
  /*
    当调用actions里面的函数的时候，就会触发改函数
   
    args：接收参数，里面封装了多个api：
      args.after：当$onAction里面的逻辑执行完成之后才会执行args.after函数逻辑，所以args.after放置的位置于执行顺序无关
      args.onError：当调用actions里面的函数发生错误时，args.onError函数也会执行
      args.args：接收调用actions里面的函数传递的参数，是一个数组
      args.name：执行的actions里面的函数的名称
    detached: 这是一个boolean参数，当这个参数为true时，表明即使当前组件销毁时，也继续监控actions里面的函数调用，可选
    goodsStore.$onAction((args) => {
      args.after(() => console.log("args.after", "===="));
      console.log("args", args);
    }, true);
   */
  actions: {
    saveName(name: string) {
      this.name = name;
    },
    // 同步更新 name 值
    updateNameSync(newName: string) {
      this.name = newName;
      return "同步修改state中的name值完成";
    },

    // 异步更新 name 值
    async updateName(newName: string) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 这里的 this 是当前的 Store 实例
          this.name = newName;
          resolve("异步修改完成");
        }, 3000);
      });
    },
  },
  getters: {
    getAddAge: (state) => {
      // getter传参
      return (num: number) => state.age + num;
    },
    getNameAndAge(): string {
      return this.name + this.getAddAge; // 调用其它getter
    },
  },
  /* 
    组合式api
    const defaultSize = ref(16)

    const getBigSize = computed(() => {
      return  defaultSize.value + 10
    })

    const changeSize = (size) => {
      defaultSize.value = size
    }
    return {
      defaultSize,
      getBigSize,
      changeSize
    }
  */
  /* 
    开启后默认有以下配置：
    使用 localStorage 进行存储
    store.$id 作为 storage 默认的 key
    使用 JSON.stringify/JSON.parse 进行序列化/反序列化
    整个 state 默认将被持久化

    注意：引用数据不会被持久化！
 */
  persist: true, // 开启数据持久化
  // store.$persist() // 手动持久化
  // persist: {
  //   // 指定持久化的key
  //   key: "my-custom-key",
  //   // 指定要持久化的数据
  //   paths: ["user.name", "company"],
  //   // 指定持久化的存储方式，默认 localStorage
  //   storage: sessionStorage,
  // },

  // 强制恢复数据
  // store.$hydrate({ runHooks: false })
});
