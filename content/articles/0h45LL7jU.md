---
title: uniapp 微信小程序和App中如何使用echart完成数据可视化
id: 1c2b2f18-5bb3-475c-8fe2-f54bff5163c2
date: 2025-09-23 16:38:02
auther: root
cover: 
excerpt: 在 uniapp 的开发过程中，图表页面是个很常见的需求。而要做图表，自然少不了 echart 的配置。问题在于，很多人并不清楚哪个组件好用、好配置。今天我结合自己的实际开发经验，来聊聊不同场景下适合使用的插件，以及它们的使用方法。 小程序端 在微信小程序中，我使用的是 uniapp 的外壳框架 u
permalink: /archives/0h45LL7jU
categories:
 - share
tags: 
 - uniapp
---

在 uniapp 的开发过程中，图表页面是个很常见的需求。而要做图表，自然少不了 echart 的配置。问题在于，很多人并不清楚哪个组件好用、好配置。今天我结合自己的实际开发经验，来聊聊不同场景下适合使用的插件，以及它们的使用方法。

## 小程序端

在微信小程序中，我使用的是 uniapp 的外壳框架 **unibest**，开发环境是 **Vue3 + TS**，编辑器用的 **VSCode**。
由于项目里有 **分包** 的需求，所以我选择把 [lime-echart](https://gitee.com/liangei/lime-echart) 放在：`src/pages-evaluation-sub/uni\_modules/lime-echart`

然后在页面中这样引用：

```html
`<template>
  <LEchart ref="echart" :customStyle="`z-index:1;`"></LEchart>
<template/>
```

```typescript
<script lang="ts" setup>
import LEchart from '@/pages-evaluation-sub/uni_modules/lime-echart/components/l-echart/l-echart.vue'
const echarts = require('../../../uni_modules/lime-echart/static/echarts.min')
const echart = ref(null)

onMounted(() => {
  echart.value.init(echarts, (chart) => {})
})
</script>
```

这里要注意的一点是：**必须确保 `echarts.min.js` 文件存在**。你可以去官网下载，不过我个人推荐直接用插件市场下载的版本，因为里面已经自带了这个文件，更省心。

## APP 端

APP 端的项目比较老，用的是 uniapp 原生框架，配合 **HBuilder** 启动，Vue 版本是 **2.x**。为了保险起见，我选择了插件市场上的 [e-chart](https://github.com/gancao-web/e-chart) 组件。

这个组件的好处是：**开箱即用，不需要额外引入 echart**。当然，如果你有特殊需求，也可以自己去替换内置的 echarts 文件。

你可以在 [插件市场](https://ext.dcloud.net.cn/plugin?id=21932) 直接点击 **“导入插件到 Hbuilder”**，或者像小程序那样手动放到 `uni_modules` 中。然后就能直接在页面中使用，例子如下：

```html
<template>
  <view class="chart-wrapper">
    <e-chart ref="echartRef" @ready="initEchart" width="100%" height="100%" />
  </view>
</template>

<script>
export default {
  props: {
    // x 轴数据
    xData: {
      type: Array,
      default: () => ['00:00', '01:00', '02:00', '03:00']
    },
    // y 轴数据
    yData: {
      type: Array,
      default: () => [10, 20, 15, 30]
    }
  },
  data() {
    return {
      option: {
        xAxis: { type: 'category', data: [], show: false },
        yAxis: { type: 'value', show: false },
        grid: { top: 20, right: 0, bottom: 0, left: 0 },
        tooltip: { show: false }, // 关闭 tooltip
        series: [
          {
            type: 'line',
            smooth: true,
            data: [],
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 2 },
            itemStyle: { color: '#3b82f6' },
            label: {
              show: true,          // 显示数值
              position: 'top',     // 在点上方显示
              fontSize: 10,
              color: '#fff'
            }
          }
        ]
      }
    }
  },
  watch: {
    // 监听 xData 更新
    xData: {
      handler(val) {
        this.option.xAxis.data = val
        this.updateChart()
      },
      immediate: true
    },
    // 监听 yData 更新
    yData: {
      handler(val) {
        this.option.series[0].data = val
        this.updateChart()
      },
      immediate: true
    }
  },
  methods: {
    initEchart() {
      this.$refs.echartRef.init(this.option)
    },
    updateChart() {
      if (this.$refs.echartRef) {
        this.$refs.echartRef.setOption(this.option)
      }
    }
  }
}
</script>

<style scoped>
.chart-wrapper {
  height: 100%;
}
</style>

```

## 总结

* **小程序端**：推荐用 `lime-echart`，更灵活，也方便做分包处理。
* **APP 端**：推荐用 `e-chart`，省事省心，开箱即用。

两者的差异主要来自于开发环境和项目需求。我的建议是：

* 如果是新项目、Vue3、小程序方向 → **lime-echart**。
* 如果是老项目、Vue2、APP 方向 → **e-chart**。

这样选用基本不会踩坑。
