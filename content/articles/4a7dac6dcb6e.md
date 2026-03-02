---
title: 深入浅出 UniApp：从 UI 组件到数据交互的完整项目配置
id: 39e71bbb-1f68-4c66-8f66-055dc12ce923
date: 2025-05-30 22:17:16
auther: root
cover: 
excerpt: 摘要 在日常的前端开发中，框架总是一波接着一波的出现。为了不落后在这个快节奏的更新中，学习框架要抓住重点。 这个框架是干什么的 uniapp是 dcloud 出品的一个跨越多端的前端框架，基于vue开发。使得用户可以编写vue一套代码部署在微信小程序、支付宝小程序、钉钉、app 和网页端。怎么听起来
permalink: /archives/4a7dac6dcb6e
categories:
 - share
tags: 
 - uniapp
---

## 摘要

在日常的前端开发中，框架总是一波接着一波的出现。为了不落后在这个快节奏的更新中，学习框架要抓住重点。

## 这个框架是干什么的

`uniapp`是 dcloud 出品的一个跨越多端的前端框架，基于`vue`开发。使得用户可以编写`vue`一套代码部署在微信小程序、支付宝小程序、钉钉、app 和网页端。怎么听起来很方便吧。但是多端开发肯定是没有原生开发的更加贴合终端机器了。

框架给我们解决了差异性，但是也有和平常的 vue 不同，例如`div`和`ul`和`li`等改为`view`，`body`的元素选择器请改为`page`，同样，`span`和`font`改为`text`、`a`改为`navigator`、`img`改为`image`因为要考虑到原生渲染，小程序等情况。这个查阅[官方文档](https://zh.uniapp.dcloud.io/)即可.

### 基础框架的开发配置

这里就是核心重点，因为一个框架我们都是要拿来做业务开发的。那么前端业务中，就包含了 3 个(具体看框架和场景)方面。

1. UI 组件库(构建页面的基础)
2. 状态管理(pinia 类似的),
3. 数据交互(接口请求)

下面就这对 uniapp 来对这三块基础做封装介绍。

## UI 组件库

这个具体去查找你所喜欢的组件库，但是一定要 注意版本号 我这里使用的是 vue3+ts。所以我使用的组件库是`wot-design-uni` 一个基于 vue3 开发的 uniapp 组件库。

那么接下来的安装配置才是重点，也帮助我们了解 uniapp 的配置，其他的大同小异。

### 安装

安装分为 2 种，**uni_modules 安装、npm 安装。**

有的组件估计有其他的种类，不重要，上面的意思是一个使用`uni-app插件市场`选择使用`HBuildX`导入。

不用`HBuildX` 那么就使用前端熟悉的`npm`安装

```bash
pnpm add wot-design-uni
```

其他的包安装对应的 UI 组件都有介绍，这里就不废话了。

### 配置

这里是第一步 npm 安装之后需要做的事情。

传统 vue 组件，需要安装、引用、注册，三个步骤后才能使用组件。easycom 将其精简为一步。只要组件路径符合规范（具体见[**easycom**](https://uniapp.dcloud.net.cn/collocation/pages.html#easycom)），就可以不用引用、注册，直接在页面中使用。

```json
// pages.json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      // 自动导入组件，例如你使用 <wd-button>主要按钮</wd-button>
      // 那么它会自动去node_modules下面去找到正则匹配的组件
      "^wd-(.*)": "wot-design-uni/components/wd-$1/wd-$1.vue"
    }
  },

  // 此为本身已有的内容
  "pages": [
    // ......
  ]
}
```

这里的配置是很重要的，通常的组件库中会给出对应的设置代码。所以不用记忆什么。

当然也会有其他的引入方式，例如 vite 常用的自动导入，这里就不过多的探讨。

上面就可以完成 UI 库的引入和使用了。

## 状态管理

通常的一个程序开发，一些数据我们都会存在本地，不然的话一刷新，什么用户信息都没了，这不合适吧。

这里我使用的是 `pinia` 。

```powershell
pnpm install pinia pinia-plugin-persistedstate
```

然后就像我们在开发 vue 项目一样

新建 `src/store/user.ts` 键入如下内容

```tsx
import { defineStore } from "pinia";
import { ref } from "vue";

const initState = { nickname: "", avatar: "" };

export const useUserStore = defineStore(
  "user",
  () => {
    const userInfo = ref<IUserInfo>({ ...initState });

    const setUserInfo = (val: IUserInfo) => {
      userInfo.value = val;
    };

    const clearUserInfo = () => {
      userInfo.value = { ...initState };
    };
    // 一般没有reset需求，不需要的可以删除
    const reset = () => {
      userInfo.value = { ...initState };
    };
    const isLogined = computed(() => !!userInfo.value.token);

    return {
      userInfo,
      setUserInfo,
      clearUserInfo,
      isLogined,
      reset,
    };
  },
  {
    // 重点这里开启持久化
    persist: true,
  }
);
```

那么在浏览器中，持久化都是 `localStorage` 、或者 `sessionStorage` 。那么微信中，使用的是\*\*`wx.setStorage`\*\* 这样的方法。显然这里的持久化需要改一下，改成 uniapp 的，这样才能多端都一样。

新建 `src/store/index.ts` ，输入下面的内容

```tsx
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate"; // 数据持久化

const store = createPinia();
store.use(
  createPersistedState({
    storage: {
      //这里就是重点，使用uni的数据缓存方法。这样统一修改，就不用单独设置每个storage文件
      getItem: uni.getStorageSync,
      setItem: uni.setStorageSync,
    },
  })
);

export default store;

// 模块统一导出
export * from "./user";
```

随后在 main.ts 中导出注册。

上面的重点就是数据持久化，主要是使用了 `uni` 的一些 API。

## 数据交互

页面编写好了，总要和后台的接口进行交互吧。那么前端开发中会用到请求接口的网络请求库。这里由于是 uniapp，当然使用 uniapp 给的请求库，这样就完成了多端统一。

使用网络请求库，我们总要考虑如下的事情

1. 可配置地址(服务器如果换了，或者域名更新。只需要改变地址就可以了，不需要重新修改接口)
2. 请求头上的身份(token 之类的)
3. 请求头上挂载当前客户端的类型(可选,我这里是有需要)
4. 接口请求的封装
   1. 接口返回的数据类型
   2. 接口错误代码的处理。

### 拦截封装实现

前面三步是通过拦截实现的，这里的拦截就和你编写 axios 的拦截一样。uniapp 当然也有自己的拦截。

`uni.addInterceptor(’类型’,回调方法)`

新建 `src/interceptors/request.ts`

```tsx
/* eslint-disable no-param-reassign */
import qs from "qs";
import { useUserStore } from "@/store";
import { platform } from "@/utils/platform";
import { getEvnBaseUrl } from "@/utils";

export type CustomRequestOptions = UniApp.RequestOptions & {
  query?: Record<string, any>;
  /** 出错时是否隐藏错误提示 */
  hideErrorToast?: boolean;
} & IUniUploadFileOptions; // 添加uni.uploadFile参数类型

// 请求基准地址
const baseUrl = getEvnBaseUrl();

// 拦截器配置
// TODO:
//  1. 非http开头的拼接地址
//  2. 请求超时
//  3. 添加多端请求头标识
//  4. 添加token到头部
const httpInterceptor = {
  // 拦截前触发
  invoke(options: CustomRequestOptions) {
    // 接口请求支持通过 query 参数配置 queryString
    if (options.query) {
      const queryStr = qs.stringify(options.query);
      if (options.url.includes("?")) {
        options.url += `&${queryStr}`;
      } else {
        options.url += `?${queryStr}`;
      }
    }
    // 非 http 开头需拼接地址
    if (!options.url.startsWith("http")) {
      // #ifdef H5
      // console.log(__VITE_APP_PROXY__)
      if (JSON.parse(__VITE_APP_PROXY__)) {
        // 啥都不需要做
      } else {
        options.url = baseUrl + options.url;
      }
      // #endif
      // 非H5正常拼接
      // #ifndef H5
      options.url = baseUrl + options.url;
      // #endif
      // TIPS: 如果需要对接多个后端服务，也可以在这里处理，拼接成所需要的地址
    }
    // 1. 请求超时
    options.timeout = 10000; // 10s
    // 2. （可选）添加小程序端请求头标识
    options.header = {
      platform, // 可选，与 uniapp 定义的平台一致，告诉后台来源
      ...options.header,
    };
    // 3. 添加 token 请求头标识
    const userStore = useUserStore();
    const { token } = userStore.userInfo as unknown as IUserInfo;
    if (token) {
      options.header.Authorization = `Bearer ${token}`;
    }
  },
};

export const requestInterceptor = {
  install() {
    // 拦截 request 请求
    uni.addInterceptor("request", httpInterceptor);
    // 拦截 uploadFile 文件上传
    uni.addInterceptor("uploadFile", httpInterceptor);
  },
};
```

我这里还引入了第三方包，qs 可以分解组合 URL 字符串的参数。

```tsx
import { platform } from "@/utils/platform";
import { getEvnBaseUrl } from "@/utils";
```

这 2 个导入不重要，因为我后面会告诉你如何获取吧。

上面的主要内容就是 `uni.addInterceptor` 然后就是回调函数中的 `invoke`

上面的文件内容就是完成了 request 请求和 uploadFile 文件上传请求的拦截。当然了，看我新建的目录就知道会有其他的拦截使用方法是一样的。

后面统一在 `src/interceptors/index.ts` 中导出

```tsx
export { requestInterceptor } from "./request";
```

同样的也在 main.ts 中导入注册

```tsx
import { createSSRApp } from "vue";
import App from "./App.vue";
import store from "./store";
import { requestInterceptor } from "./interceptors";
import "virtual:uno.css";
import "@/style/index.scss";

export function createApp() {
  const app = createSSRApp(App);
  app.use(store);
  app.use(requestInterceptor);
  return {
    app,
  };
}
```

完成了接口的拦截封装，那么还剩下接口请求的封装了。

### 接口请求封装

通过一个函数 `return Promise`来实现对 `uni.request`异步接口调用，来同步获取结果。

新建 `utils/http.ts`

```tsx
/**
 * @Author:
 * @description: 封装请求， 返回promise对象，同步执行逻辑。针对状态进行设计，返回指定的错误或者做对应的处理
 * @param {*} T 返回值的类型
 * @return {*}
 * @Date: 2024-09-14
 */
export const http = <T,>(options: CustomRequestOptions) => {
  // 1. 返回 Promise 对象
  return new Promise<IResData<T>>((resolve, reject) => {
    uni.request({
      ...options,
      dataType: "json",
      // #ifndef MP-WEIXIN
      responseType: "json",
      // #endif
      // 响应成功
      success(res) {
        // 状态码 2xx，参考 axios 的设计
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 2.1 提取核心数据 res.data
          resolve(res.data as IResData<T>);
        } else if (res.statusCode === 401) {
          // 401错误  -> 清理用户信息，跳转到登录页
          // userStore.clearUserInfo()
          // uni.navigateTo({ url: '/pages/login/login' })
          reject(res);
        } else {
          // 其他错误 -> 根据后端错误信息轻提示
          !options.hideErrorToast &&
            uni.showToast({
              icon: "none",
              title: (res.data as IResData<T>).msg || "请求错误",
            });
          reject(res);
        }
      },
      // 响应失败
      fail(err) {
        uni.showToast({
          icon: "none",
          title: "网络错误，换个网络试试",
        });
        reject(err);
      },
    });
  });
};
```

这样的话就可以指定结果类型了。

```tsx
<script setup lang="ts">
const getData = async () => {
 let result = await http<string[]>({
    url,
    query,
    method: 'GET',
  })
}
</script>
```

## 总结

这样的话，对 uniapp 进行了一层基础框架的构建。使得项目开发更加的结构化

这样是不是很繁琐呢，这样还是基础。够用，但是可以做的更好。所以我们可以使用别人构建好的框架，里面包含了我上面提及的基础点，也还有 css，路由拦截等各种插件。这个是[unibest](https://codercup.github.io/unibest-docs/base/1-introduction)基础框架，上面的分享主要是记录如果我们自己构建 uniapp 框架，是如何思考并解决问题的。


