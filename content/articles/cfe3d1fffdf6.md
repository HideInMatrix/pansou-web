---
title: 前端必学：CSS 盒子模型与布局技巧
id: 06407c01-4ae7-4230-8b82-b64bef5c9af1
date: 2025-05-30 21:45:50
auther: root
cover: 
excerpt: 前言 盒子模型的理解是前端使用 css 实现准确布局、处理元素排列的关键，下面是对 MDN 上盒子模型文章的一部分难点做见解。 其一就是区块盒子和行内盒子上的行为，其二是 2 种盒子模型的大小问题。 区块盒子和行内盒子 在 CSS 中，有几种类型的盒子，一般分为 区块盒子（block boxes）和
permalink: /archives/cfe3d1fffdf6
categories:
 - share
tags: 
 - css
---

## 前言

盒子模型的理解是前端使用 css 实现准确布局、处理元素排列的关键，下面是对 MDN 上[`盒子模型`](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/Building_blocks/The_box_model#%E4%BB%80%E4%B9%88%E6%98%AF_css_%E7%9B%92%E6%A8%A1%E5%9E%8B%EF%BC%9F)文章的一部分难点做见解。

其一就是区块盒子和行内盒子上的行为，其二是 2 种盒子模型的大小问题。

## 区块盒子和行内盒子

在 CSS 中，有几种类型的盒子，一般分为 **区块盒子**（block boxes）和 **行内盒子**（inline boxes）。这里的类型是指盒子在页面流中的行为方式以及与周围盒子元素的关系。盒子有 **内部显示**（inner display type）和 **外部显示**（outer display type）两种类型。一般来说，

可以使用 [`display`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/display) 属性为显示类型设置各种值，该属性可以有多种值。

## 外部类型

一个拥有 block 外部显示的盒子会表现出如下行为：

- 盒子会换行，独占一整行。
- `width`和`height` 属性会发生作用
- 内边距、外边距和边框会将其他元素从当前盒子周围“推开”。
- 如果没有指定`width` ，元素将会将沿行向扩展，以填充其容器中的可用空间，通常情况下会占据可用空间的 100%。

某些 HTML 元素，如 `<h1>` 和 `<p>`，默认使用 `block` 作为外部显示类型。


<div style="position: relative; width: 100%; aspect-ratio:4/3">
<iframe src="https://codepen.io/Stonewalling/pen/GRbGxLO" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="width: 100%; height:100%;" ></iframe></div>


一个拥有 inline 外部显示的盒子会表现以下行为。

- 盒子不会换行
- `width`和`height` 属性不会发生作用。
- 下面的例子可以看到垂直方向的内边距、外边距以及边框会被应用但是不会把其他处于 `inline` 状态的盒子推开。也就是`margin`没有起作用
- 水平方向的内边距、外边距以及边框会被应用且会把其他处于 `inline` 状态的盒子推开。


<div style="position: relative; width: 100%;  aspect-ratio:4/3">
<iframe src="https://codepen.io/Stonewalling/pen/vYqjRZm" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style=" width: 100%; height:100%;" ></iframe></div>


某些 HTML 元素，如 `<a>`、 `<span>`、 `<em>` 以及 `<strong>`，默认使用 `inline` 作为外部显示类型。

## CSS 盒子模型

CSS 中组成一个区块盒子需要：

- **内容盒子**：显示内容的区域；使用 [`inline-size`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/inline-size) 和 [`block-size`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/block-size) 或 [`width`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/width) 和 [`height`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/height) 等属性确定其大小。
- **内边距盒子**：填充位于内容周围的空白处；使用 [`padding`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/padding) 和相关属性确定其大小。
- **边框盒子**：边框盒子包住内容和任何填充；使用 [`border`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/border) 和相关属性确定其大小。
- **外边距盒子**：外边距是最外层，其包裹内容、内边距和边框，作为该盒子与其他元素之间的空白；使用 [`margin`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/margin) 和相关属性确定其大小。

目前 2 种盒子模型，其一是正常盒子模型，就是平常 Google Chrome 使用的，其二是 IE 盒子模型是 IE 使用的。

### 1. **标准盒子模型（Content-Box Model）**

这是 CSS 的默认盒子模型。元素的 `width` 和 `height` 只包括内容区域的大小，不包括 `padding`、`border` 和 `margin`。

- **总宽度（Total Width）** = `width` + `padding-left` + `padding-right` + `border-left` + `border-right`
- **总高度（Total Height）** = `height` + `padding-top` + `padding-bottom` + `border-top` + `border-bottom`

### 2. **IE 盒子模型（Border-Box Model）**

在这种盒子模型下，元素的 `width` 和 `height` 包括内容区域、内边距和边框，但不包括 `margin`。

- **内容宽度（Content Width）** = `width` - `padding-left` - `padding-right` - `border-left` - `border-right`
- **内容高度（Content Height）** = `height` - `padding-top` - `padding-bottom` - `border-top` - `border-bottom`
  {% raw %}

<div style="position: relative; width: 100%;  aspect-ratio:4/3">
<iframe src="https://codepen.io/Stonewalling/pen/bGPKMbm" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style=" width: 100%; height: 100%; " ></iframe></div>




