---
title: 使用 CSS 混合模式实现动态反差色效果
id: e1725324-dc70-42cc-9655-af15d0cd0a93
date: 2025-05-30 21:52:00
auther: root
cover: 
excerpt: 前言 在前端开发中，我们经常会遇到需要动态变化的视觉效果。今天我们将讨论如何利用 CSS 的 mix-blend-mode 属性，实现一个文本穿过特定背景时反色的效果。具体来说，我们会创建一个背景为黑色的 div 元素，并让文本从中穿过。当文本进入 div 的区域时，其颜色会从黑色变为白色，离开时则
permalink: /archives/8b8f4fe3e3ef
categories:
 - share
tags: 
 - css
---

## 前言

在前端开发中，我们经常会遇到需要动态变化的视觉效果。今天我们将讨论如何利用 CSS 的 `mix-blend-mode` 属性，实现一个文本穿过特定背景时反色的效果。具体来说，我们会创建一个背景为黑色的 `div` 元素，并让文本从中穿过。当文本进入 `div` 的区域时，其颜色会从黑色变为白色，离开时则恢复为黑色。

## 实现原理

`mix-blend-mode` 是 CSS 的一种混合模式，可以用来指定如何将元素的内容与其背景内容混合在一起。我们使用 `difference` 模式，这种模式会比较两个元素的颜色值，并对它们进行差值运算：

- 如果一个通道中的颜色值相同，结果为黑色（0）。
- 如果一个通道中的颜色值不同，结果为白色（255）。

当文本颜色为黑色（#000）时，进入黑色背景区域，计算结果仍为黑色，看起来没有变化。但当文本颜色为白色（#fff）时，进入黑色背景区域，计算结果为白色，看起来是反色效果。

<div style="position: relative; width: 100%;aspect-ratio: 4 / 3;">
<iframe src="https://codepen.io/Stonewalling/pen/QWXBwJL" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="width: 100%; height: 100%;" ></iframe></div>

[https://codepen.io/Stonewalling/pen/QWXBwJL](https://codepen.io/Stonewalling/pen/QWXBwJL)

## 实现步骤

### 1. 设置基础结构

首先，我们创建一个简单的 HTML 结构，包括一个容器和一个文本元素：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mix-Blend-Mode: Difference Demo</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        height: 100vh;
        background: #fff; /* 全局背景颜色 */
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .container {
        width: 300px;
        height: 200px;
        /* 混合模式 */
        position: relative;
        mix-blend-mode: difference;
        background: linear-gradient(90deg, white 0 300px, #000 300px);
      }

      .text {
        font-size: 48px;
        font-weight: bold;
        color: #fff; /* 初始文本颜色 */
        position: absolute;
        white-space: nowrap;
        animation: moveText 5s linear infinite;
        mix-blend-mode: difference;
        z-index: 2;
      }

      @keyframes moveText {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="text">反差色效果</div>
    </div>
  </body>
</html>
```

### 2. 样式和动画

- **全局背景**：将 `body` 的背景设置为白色，方便我们观察效果。
- **容器**：`.container` 是我们的目标区域，设置 `mix-blend-mode: difference` 使其内容与背景进行差值运算，并用渐变背景模拟黑白区域的转换。
- **文本**：`.text` 设置初始颜色为白色，并添加动画 `moveText` 让文本从左到右穿过容器。

### 3. 渐变背景解释

我们使用了 CSS 的 `linear-gradient` 属性来创建渐变背景，具体设置如下：

```css
css复制代码
background: linear-gradient(90deg, white 0 300px, #000 300px);
```

### 参数解释：

- `90deg`：设置渐变的方向为 90 度，表示从左到右的水平渐变。
- `white 0 300px`：定义渐变的第一部分为白色，从开始（0px）到 300px 的范围内完全是白色。
- `#000 300px`：定义渐变的第二部分为黑色，从 300px 开始一直到容器的右边界都是黑色。

### 为什么使用这些设置：

这种设置创建了一个从左到右的渐变，其中左侧是白色，右侧是黑色。这种背景设置模拟了文本在穿过不同颜色区域时的效果。通过 `mix-blend-mode: difference`，当白色文本进入黑色区域时，会产生反色效果，变为黑色；当离开黑色区域进入白色区域时，文本会变回白色。

### 4. 关键帧动画

使用 `@keyframes` 定义 `moveText` 动画，使文本从容器左侧移动到右侧：

```css
css复制代码 @keyframes moveText {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
```

### 5. 组合效果

通过组合上述设置，当白色文本进入黑色背景区域时，其颜色会反色为黑色，离开黑色区域则恢复为白色。

## 总结

利用 `mix-blend-mode` 和 CSS 动画，我们实现了一个有趣的反差色效果。这个方法可以应用于多种场景，如文本悬停、滚动效果等，为网站增加动态视觉效果。希望这篇博客对你在前端开发中的视觉效果实现有所帮助。
