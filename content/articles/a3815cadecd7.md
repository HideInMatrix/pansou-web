---
title: vue3源码学习10-runtime-dom实现
id: e4b8ac49-3210-4148-994f-71244837868a
date: 2025-05-30 21:18:33
auther: root
cover: 
excerpt: 摘要 前面主要是 vue 的源码仿写，最主要的是 vue 的响应式，以及依赖收集。是一个简易版本，和官方源码还是有很多细微差别的，例如数组代理之后改变数组长度，会触发更新之类的。数组还会被收集长度这种依赖关系，以及数组的一些splice，push，shift，unshift，pop这些方法重写，来完
permalink: /archives/a3815cadecd7
categories:
 - share
tags: 
 - vue3
---

## 摘要

前面主要是 vue 的源码仿写，最主要的是 vue 的响应式，以及依赖收集。是一个简易版本，和官方源码还是有很多细微差别的，例如数组代理之后改变数组长度，会触发更新之类的。数组还会被收集长度这种依赖关系，以及数组的一些`splice，push，shift，unshift，pop`这些方法重写，来完成修复一些数组在 vue 依赖更新中的 BUG。

## Vue 中为了解耦，将逻辑分成 2 个模块

- 运行时 核心(runtime)(不依赖平台的 browsweer test 小程序 app canvas....) 靠的是虚拟 DOM
- 针对不同平台运行时，vue 是针对浏览器平台的
- 渲染器

## 构建自己的 runtime-dom

这个功能主要是为了提供一个操作 dom 的方法，新建一个`rumtime-dom`的文件夹在`packages`中。然后 cd 到该目录下运行`pnpn init`，生成的`package.json`，修改成如下 。

```json
{
  "name": "@vue/runtime-dom",
  "version": "1.0.0",
  "description": "",
  "main": "index.ts",
  "buildOptions": {
    "name": "VueRuntimeDOM",
    "formats": ["global", "cjs", "esm-budler"]
  }
}
```

修改项目的 package.json 中 dev 的参数。

```json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "node scripts/dev.js runtime-dom -f global"
  },
```

然后参考着官方的文件。创建如下文件

![9ec2af9a91890e8c26b66.png](https://pan.micromatrix.eu.org/file/9ec2af9a91890e8c26b66.png)

在 `nodeOps.ts`中编写需要的 dom 操作方法。

```typescript
export const nodeOps = {
  // 增 删 改 查
  insert(child, parent, anchor = null) {
    parent.insertBefore(child, anchor);
  },
  remove(child) {
    const parentNode = child.parentNode;
    if (parentNode) {
      parentNode.removeChild(child);
    }
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  setText(node, text) {
    node.nodeValue = text;
  },
  querySelector(selector) {
    return document.querySelector(selector);
  },
  parentNode(node) {
    return node.parentNode;
  },
  nextSibling(node) {
    return node.nextSibling;
  },
  createElement(tagName) {
    return document.createElement(tagName);
  },
  createText(text) {
    return document.createTextNode(text);
  },
};
```

而 `patchProp.ts`主要是操作样式的方法

```typescript
export function patchProp(el, key, prevValue, nextValue) {
  // 类名 el.className
  //样式 el.style
  // events
  // 普通属性
}
```

先打个小样，后期慢慢填充。
而主要文件 index.ts 中就是将这些合并起来

```typescript
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";
const renerOptions = Object.assign(nodeOps, { patchProp });
```

## 编写 runtime-dom 内容

runtime-dom 主要是提供一个虚拟 dom 的操作方法。前端在代码编写的过程中，要设置类名，style 样式，绑定事件，还有设置普通属性。还有 node 自身的属性操作。例如将节点增加到指定位置，删除节点等等，这些是 dom 原生就有的功能，可以进一步封装使用。这里学习一下他的核心思想。
所以 runtime-dom 的核心就是提供渲染器需要的 options。实际上 runtime-dom 并未做什么事情。
所以 `patchProp.ts`的代码编写就是这样的。

```typescript
// dom属性的操作api

import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

// null 值
// 值 值
// 值 null
export function patchProp(el, key, prevValue, nextValue) {
  // 类名 el.className
  if (key === "class") {
    patchClass(el, nextValue);
  } else if (key === "style") {
    //样式 el.style
    patchStyle(el, prevValue, nextValue);
  } else if (/^on[^a-z]/.test(key)) {
    // events addEventListener
    patchEvent(el, key, nextValue);
  } else {
    // 普通属性 el.setAttribute(key, prevValue)
    patchAttr(el, key, nextValue);
  }

  //样式 el.style
  // events addEventListener
  // 普通属性 el.setAttribute(key, prevValue)
}
```

### 传入 class 的时候

`<div class="a"></div>` ==> `<div class="b"></div>`
这个时候是需要被操纵的元素 dom，还有最新传入的 class 值。这里简单的来看是不需要旧的 class 值的，直接覆盖新值就可以了。
所以 `modules/class.ts`的文件就是抛出一个 pathcClass 函数，这个函数接受了 `(el,nextValue)`

```typescript
export function patchClass(el, nextValue) {
  if (nextValue == null) {
    el.removeAttribute("class"); // 如果不需要class了直接移除
  } else {
    el.className = nextValue;
  }
}
```

### 传入 style 值的时候

`<div style="color:red;font-size:14px;"></div>` ==> `<div style="color:yellow"></div>`
这样的操作，好像直接可以旧值覆盖新值，不用做比较。如果你是一个 vue 开发的话，就知道这样一种写法 `<div :style="{color:'red',fontSize:'14px'}"></div>`，style 可以动态的改变，作为一个对象。这样的话，如果直接覆盖，是不会识别 font-size 的。所以需要做一个新旧值的对比。

```typescript
export function patchStyle(el, prevValue, nextValue) {
  // 样式需要比较差异
  for (let key in nextValue) {
    // 用新的直接覆盖
    el.style[key] = nextValue[key];
  }

  if (prevValue) {
    for (let key in prevValue) {
      if (nextValue[key] == null) {
        el.style[key] = null;
      }
    }
  }
}
```

### 传入绑定事件

通常原生的 JS 在一个 dom 元素上绑定一个事件，然后换绑定另一个事件。要经历一个绑定->解绑 ->再绑定新的事件。这样的操作十分耗费性能。而如果我们绑定一个自定义的事件，然后在里面绑定要绑定的方法，这样当要绑定的方法更换的时候，不需要重新解绑再绑定，而只需要更新要绑定的方法就行。
所以 `event.ts`

```typescript
function createInvoker(callback) {
  const invoker = (e) => invoker.value();
  invoker.value = callback;
  return invoker;
}

export function patchEvent(el, eventName: string, nextValue) {
  // 可以先移除时间，再重新绑定事件
  // remove => add event
  // 这样操作每次都要卸载再安装
  // 可以绑定一个自定义事件，然后里面调用绑定的方法
  let invokers = el._vei || (el._vei = {});

  let exits = invokers[eventName]; // 先看有没有缓存过

  //如果绑定的是一个空
  if (exits && nextValue) {
    // 已经绑定过事件了
    exits.value = nextValue;
  } else {
    // onClic=> click
    let event = eventName.slice(2).toLowerCase();
    if (nextValue) {
      const invoker = (invokers[eventName] = createInvoker(nextValue));
      el.addEventListener(event, invoker);
    } else if (exits) {
      // 如果有老值，需要将老的绑定事件移除
      el.removeEventListener(event, exits);
      invokers[eventName] = undefined;
    }
  }
}
```

这样第一次进入的时候是没有值的，所以 el.vei 是一个空对象，并且 invokers 也没有值，那么就不存在缓存了方法名。当进入到下一步的时候要判断传入的时候是空，这样就可以解绑对应的方法。当有值的时候，就进入到了上面说的，绑定一个自定义事件。这样 el.vei 中就有了一个{onClick:(e)=>invoker.value()}。如果你这时候绑定的是一个 a 方法那么就会是这样 `{onClick:(e)=>a()}`。这样当你要绑定成 b 方法的时候就变成了 `{onClick:(e)=>b()}`。
这里并未细致考虑绑定多方法的问题。vue3 是通过数组存储来完成。

### 传入自定义属性

简单点就是有这个自定义属性就添加，没有值就移除它。

```typescript
export function patchAttr(el, key, nextValue) {
  if (nextValue) {
    el.setAttribute(key, nextValue);
  } else {
    el.removeAttribute(key);
  }
}
```

## 结尾

平常在编写的时候用的都是 `render`或 `h`这样的函数，来渲染虚拟 dom,而不是像文章开头一样，编写很多的 api。那么为了 这样的操作,vue3d 都是交由 `runtime-core`来操作。
也就是说 runtime-dom 的 index.ts 改成

```typescript
import { createRenderer } from "@vue/runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";
const renerOptions = Object.assign(nodeOps, { patchProp }); // domApi 属性api

export function render(vnode, container) {
  // 渲染器的创建的时候传入options
  createRenderer(renerOptions).render(vnode, container);
}
export * from "@vue/runtime-core";
```

新建的 runtime-core 就有 h.ts 和 renderer.ts 的函数。
index.ts

```typescript
export { createRenderer } from "./renderer";
export { h } from "./h";
```

h.ts

```typescript
export function h() {}
```

renderer.ts

```typescript
export function createRenderer(renerOptions) {
  const render = (vnode, container) => {};
  return {
    render,
  };
}
```

```halo
git:[@github/MicroMatrixOrg/vue3-plan/tree/runtime-dom)]
```
