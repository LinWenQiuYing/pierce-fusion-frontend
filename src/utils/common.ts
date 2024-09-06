import { StorageType } from "@/types";
import { Modal } from "ant-design-vue";
import { nextTick } from "vue";

export function downloadFile(content: BlobPart | Blob, fileName: string) {
  let blob = null;

  if (!(content instanceof Blob)) {
    blob = new Blob([content]);
  } else {
    blob = content;
  }
  let aLink: HTMLAnchorElement | null = document.createElement("a");
  let evt: MouseEvent | null = new MouseEvent("click", {
    view: window,
    bubbles: false,
    cancelable: true,
  });
  evt.initEvent("click", false, false);
  aLink.href = URL.createObjectURL(blob);
  aLink.download = fileName || "";
  document.body.appendChild(aLink);
  aLink.dispatchEvent(evt);

  window.setTimeout(() => {
    if (aLink) {
      document.body.removeChild(aLink);
      aLink = null;
      evt = null;
    }
  });
}

class Storage {
  //设置缓存
  setItem(params: StorageType) {
    const options: StorageType = {
      name: "",
      value: "",
      expires: 0,
      startTime: new Date().getTime(), //记录何时将值存入缓存，毫秒级
    };
    //将obj和传进来的params合并
    Object.assign(options, params);
    if (options.expires) {
      //如果options.expires设置了的话
      //以options.name为key，options为值放进去
      localStorage.setItem(options.name, JSON.stringify(options));
    } else {
      //如果options.expires没有设置，就判断一下value的类型
      const type = Object.prototype.toString.call(options.value);
      //如果value是对象或者数组对象的类型，就先用JSON.stringify转一下，再存进去
      if (type == "[object Object]" || type == "[object Array]") {
        options.value = JSON.stringify(options.value);
      }
      localStorage.setItem(options.name, options.value);
    }
  }
  //拿到缓存
  getItem(name: string) {
    const item = JSON.parse(localStorage.getItem(name) || "{}");
    //如果有expires的值，说明设置了失效时间
    if (isEmptyObj(item)) return "{}";
    if (item.expires) {
      const date = new Date().getTime();
      //何时将值取出减去刚存入的时间，与item.expires比较，如果大于就是过期了，如果小于或等于就还没过期
      if (date - item.startTime > item.expires) {
        //缓存过期，清除缓存，返回false
        localStorage.removeItem(name);
        return false;
      } else {
        //缓存未过期，返回值
        return item.value;
      }
    } else {
      //如果没有设置失效时间，直接返回值
      return item;
    }
  }
  //移出缓存
  removeItem(name: string) {
    localStorage.removeItem(name);
  }
  //移出全部缓存
  clear() {
    localStorage.clear();
  }
}

export const LocalStorage = new Storage();

export function hideIdCode(idCode: string) {
  return idCode.replace(/^(.{6})(?:\d+)(.{4})$/, "$1********$2");
}

export function hidePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/(\d{3})\d*(\d{4})/, "$1****$2");
}

export function hideName(name: string) {
  return name.replace(/(?<=.)./g, "*");
}

export function getUserInfo() {
  return JSON.parse(LocalStorage.getItem("userInfo"));
}

export function getUserRights() {
  return JSON.parse(LocalStorage.getItem("userRights"));
}

export function strReduct(str: string, len: number) {
  // 按需截取字符串方法
  if (str.length <= len) {
    return str;
  } else {
    return str.split("").splice(0, len).join("") + "...";
  }
}

export function modalConfirm(
  title: string,
  onOk: () => void,
  content: string,
  onCancel: () => void = () => {}
) {
  Modal.confirm({
    title: title,
    // icon: () =>
    //   h("img", {
    //     attrs: {
    //       src: InfoWarningIcon,
    //       class: "confirm-icon",
    //     },
    //   }),
    content: content,
    okText: "是",
    okType: "primary",
    centered: true,
    cancelText: "否",
    onOk: onOk,
    onCancel,
  });
}

// 页面自动滚动到底部
export function scrollToBottom(domId: string, step: number) {
  // step: 每次滚动幅度
  nextTick(() => {
    // 找到是哪个区域在滚动-domId
    const dom = document.getElementById(domId);
    if (!dom) return;
    let scrollTop = dom.scrollTop;
    const clientHeight = dom.clientHeight;
    const scrollHeight = dom.scrollHeight;
    const timer = setInterval(() => {
      if (scrollTop + clientHeight < scrollHeight) {
        dom.scrollTop += step;
        scrollTop += step;
      } else {
        clearInterval(timer);
      }
    }, 10);
  });
}

// 页面自动滚动到顶部
export function scrollToTop(domId: string, step: number) {
  // step: 每次滚动幅度
  nextTick(() => {
    // 找到是哪个区域在滚动-domId
    const dom = document.getElementById(domId);
    if (!dom) return;
    let scrollTop = dom.scrollTop;
    const timer = setInterval(() => {
      if (scrollTop > 0) {
        dom.scrollTop -= step;
        scrollTop -= step;
      } else {
        clearInterval(timer);
      }
    }, 10);
  });
}

// 判断对象是否为空
export function isEmptyObj(obj: object) {
  return JSON.stringify(obj) === "{}" || Object.keys(obj).length === 0;
}

// 将图片转换为base64
export function getBase64Image(imgUrl: string) {
  let base64Url = "";
  const image = new Image();
  image.setAttribute("crossOrigin", "anonymous"); //解决跨域问题
  image.src = imgUrl;
  image.onload = function () {
    //image.onload为异步加载
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    context?.drawImage(image, 0, 0, image.width, image.height);
    //这里的base64Url就是base64类型
    //使用toDataUrl将图片转换成jpeg的格式,不要把图片压缩成png，因为压缩成png后base64的字符串可能比不转换前的长！
    base64Url = canvas.toDataURL("image/jpeg", 1);
  };
  return base64Url;
}

// 重置toRefs导出的响应式变量
export const resetData = (data: any) => {
  const keys = Object.keys(data);
  const obj = {};
  keys.forEach((item) => {
    if (Array.isArray(data[item])) {
      obj[item] = [];
    } else if (data[item] instanceof Object) {
      obj[item] = {};
    } else {
      obj[item] = undefined;
    }
  });
  Object.assign(data, obj);
};
