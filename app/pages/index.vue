<script setup lang="ts" async>
import { ref, computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { Search, FileText, Calendar, Copy, Check, CircleX } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import MainRandomRecommendation from "@/components/main/RandomRecommendation.vue";
import MainHotTrending from "@/components/main/HotTrending.vue";

import { formatDate } from "~~/shared/utils/time";

import type { SearchResponse, MergedLink, CloudType, CloudTypeConfig } from "~~/shared/types/search";

useSeoMeta({
  title: '来摸鱼哈 - 网盘资源搜索平台',
  description: '来摸鱼哈是一个强大的网盘资源搜索平台，支持百度网盘、阿里云盘、夸克网盘等多种网盘类型，帮助您快速找到所需的资源。',
  keywords: '网盘搜索,百度网盘,阿里云盘,夸克网盘,资源搜索,来摸鱼哈',
  ogTitle: '来摸鱼哈 - 网盘资源搜索平台',
  ogDescription: '快速搜索网盘资源，支持多种网盘类型，免费分享资源。',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
});

// API 响应格式定义
interface ApiResponse {
  code: number;
  data: {
    total: number;
    results?: any[];
    merged_by_type: Record<string, MergedLink[]>;
  };
}

// API 配置
const API_BASE_URL = "https://api.laimoyuha.com";

// route/router & initial params
const route = useRoute();
const router = useRouter();

// 搜索状态（从 URL 参数初始化）
const searchQuery = ref<string>("");
const activeTab = ref<CloudType | "all">("all");
const isSearching = ref(false);
const copyStates = reactive<Record<string, boolean>>({});

// 搜索结果
const searchData = reactive<SearchResponse>({
  total: 0,
  results: [],
  merged_by_type: {},
});

// 网盘类型配置映射
const cloudTypeConfigMap: Record<CloudType | "all", CloudTypeConfig> = {
  baidu: { label: "百度网盘", color: "#1296db", icon: "🔵" },
  aliyun: { label: "阿里云盘", color: "#0066cc", icon: "☁️" },
  quark: { label: "夸克网盘", color: "#37b7c3", icon: "⚡" },
  tianyi: { label: "天翼云盘", color: "#f70", icon: "☀️" },
  uc: { label: "UC网盘", color: "#ff6b00", icon: "🔶" },
  mobile: { label: "移动云盘", color: "#029dd9", icon: "📱" },
  "115": { label: "115网盘", color: "#ffb000", icon: "1️⃣" },
  pikpak: { label: "PikPak", color: "#ff6b7a", icon: "🎯" },
  xunlei: { label: "迅雷网盘", color: "#ffa500", icon: "⚡" },
  "123": { label: "123网盘", color: "#0066cc", icon: "1️⃣" },
  magnet: { label: "磁力链接", color: "#e74c3c", icon: "🧲" },
  ed2k: { label: "电驴链接", color: "#9b59b6", icon: "🔗" },
  others: { label: "其他", color: "#95a5a6", icon: "📦" },
  all: { label: "全部", color: "#3b82f6", icon: "📋" },
};

// 使用 useAsyncData 来处理搜索请求
let refreshFn: any;

const {
  data: remoteData,
  pending: asyncDataPending,
  refresh,
} = await useAsyncData(
  "search-results",
  (_nuxtApp, { signal }) => {
    // 如果没有搜索词，返回空数据
    if (!searchQuery.value.trim()) {
      return Promise.resolve(null);
    }
    // @ts-ignore
    return $fetch(`${API_BASE_URL}/api/search`, {
      method: "POST",
      body: {
        kw: searchQuery.value.trim(),
        res: "all",
        type: activeTab.value === "all" ? undefined : activeTab.value,
      },
      signal,
    });
  },
  {
    immediate: false,
  },
);

refreshFn = refresh;

// 当 activeTab 变化时，刷新数据
watch(
  activeTab,
  () => {
    if (searchQuery.value.trim()) {
      refreshFn();
    }
  },
  { immediate: false },
);

// 处理搜索按钮点击 - 使用 refresh 触发请求
const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;
  await refreshFn();
};

// 从推荐组件触发搜索
const handleRecommendationSearch = async (keyword: string) => {
  searchQuery.value = keyword;
  // 刷新数据来触发搜索
  await refreshFn();
};

// 处理回车搜索
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    handleSearch();
  }
};

// 将远程数据映射到页面使用的 reactive 对象
watch(
  remoteData,
  (val) => {
    if (val) {
      const response = val as ApiResponse;
      const data = response?.data;
      searchData.total = data?.total || 0;
      searchData.results = data?.results || [];
      searchData.merged_by_type = data?.merged_by_type || {};
    }
  },
  { immediate: false },
);

// 将加载状态绑定到 useAsyncData 的 pending
const isLoading = computed(() => asyncDataPending.value);

// 计算各类型的数量
const cloudTypeCounts = computed(() => {
  const counts: Record<CloudType, number> = {} as any;
  const merged = searchData.merged_by_type || {};
  Object.entries(merged).forEach(([type, links]) => {
    counts[type as CloudType] = (links as MergedLink[]).length;
  });
  return counts;
});

// 获取已有的网盘类型（按照有数据的类型排序）
const availableCloudTypes = computed(() => {
  const merged = searchData.merged_by_type || {};
  return Object.keys(merged) as CloudType[];
});

// 复制到剪贴板
const copyToClipboard = (text: string, key: string) => {
  navigator.clipboard.writeText(text).then(() => {
    copyStates[key] = true;
    setTimeout(() => {
      copyStates[key] = false;
    }, 2000);
  });
};

// 提取来源信息
const parseSource = (source: string) => {
  if (source.startsWith("tg:")) {
    return { type: "TG", name: source.slice(3) };
  } else if (source.startsWith("plugin:")) {
    return { type: "插件", name: source.slice(7) };
  }
  return { type: "未知", name: "" };
};

const handleClear = async () => {
  // 清空搜索输入框
  searchQuery.value = "";
  // 重置活跃标签
  activeTab.value = "all";
  // 清除搜索结果数据
  searchData.total = 0;
  searchData.results = [];
  searchData.merged_by_type = {};
};

const adsendId = "5901616898778649";
const slotIds = ["3130294823", "9110974380"];
</script>

<template>
  <NuxtLayout>
    <div class="flex flex-col w-full min-h-screen">
      <!-- 搜索栏部分 -->
      <div class="w-full mt-8 mb-8">
        <div class="flex flex-col md:flex-row gap-2 items-center justify-center">
          <div class="relative w-full md:w-96">
            <Input v-model="searchQuery" @keydown="handleKeydown" type="text" placeholder="搜索网盘资源..." class="w-full pr-10 h-10 text-base" />
            <CircleX class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" v-if="searchQuery" @click="handleClear" />
            <Search class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" v-else />
          </div>
          <Button @click="handleSearch" :disabled="isLoading || !searchQuery.trim()" class="w-full md:w-auto h-10 bg-blue-600 hover:bg-blue-700 text-white">
            {{ isLoading ? "搜索中..." : "搜索" }}
          </Button>
        </div>
      </div>

      <!-- 搜索结果部分 -->
      <div v-if="searchData.total > 0 || searchData.results.length > 0" class="w-full flex-1">
        <!-- 结果统计 -->
        <div class="mb-6 p-4 bg-muted rounded-lg">
          <p class="text-lg font-semibold mb-3">
            搜索结果"<span class="text-blue-600 font-bold">{{ searchQuery }}</span
            >"
            <span class="text-blue-600">{{ searchData.total }}</span>
            条
          </p>
          <div class="flex gap-2 flex-wrap">
            <button @click="activeTab = 'all'" :class="['px-4 py-2 rounded-full text-sm font-medium transition-colors', activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-background border border-input hover:bg-accent']">
              全部 ({{ searchData.total }})
            </button>
            <button
              v-for="type in availableCloudTypes"
              :key="type"
              @click="activeTab = type"
              :class="['px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1', activeTab === type ? 'bg-blue-600 text-white' : 'bg-background border border-input hover:bg-accent']">
              <span>{{ cloudTypeConfigMap[type].icon }}</span>
              {{ cloudTypeConfigMap[type].label }} ({{ cloudTypeCounts[type] }})
            </button>
          </div>
        </div>

        <!-- 结果展示 - 全部结果（来自原始消息） -->
        <div v-if="activeTab === 'all'" class="space-y-4 mb-8">
          <div v-for="(result, index) in searchData.results" :key="`result-${result.unique_id}`" class="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <!-- 标题和来源 -->
            <div class="mb-3">
              <h3 class="text-base font-semibold text-foreground line-clamp-2 mb-2">
                {{ result.title }}
              </h3>
              <div class="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <div class="flex items-center gap-1">
                  <span class="font-medium">来自</span>
                  <Badge variant="outline">{{ result.channel|| "未知" }}</Badge>
                </div>
                <div class="flex items-center gap-1">
                  <Calendar class="w-3 h-3" />
                  <span>{{ formatDate(result.datetime) }}</span>
                </div>
              </div>
            </div>

            <!-- 标签 -->
            <div v-if="result.tags && result.tags.length > 0" class="flex gap-2 mb-3 flex-wrap">
              <Badge v-for="tag in result.tags" :key="tag" variant="secondary" class="text-xs">
                {{ tag }}
              </Badge>
            </div>

            <!-- 内容摘要 -->
            <p v-if="result.content" class="text-sm text-muted-foreground line-clamp-2 mb-4">
              {{ result.content }}
            </p>

            <!-- 图片展示 -->
            <div v-if="result.images && result.images.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <div v-for="(image, imgIdx) in result.images.slice(0, 4)" :key="`img-${result.unique_id}-${imgIdx}`" class="aspect-square rounded overflow-hidden bg-muted flex items-center justify-center group">
                <img :src="image" :alt="`result-${index}-img-${imgIdx}`" class="w-full h-full object-cover group-hover:scale-110 transition-transform cursor-pointer" loading="lazy" />
              </div>
            </div>

            <!-- 链接列表 -->
            <div v-if="result.links && result.links.length > 0" class="space-y-2">
              <div v-for="(link, linkIdx) in result.links" :key="`link-${result.unique_id}-${linkIdx}`" class="p-3 bg-muted rounded-md border border-border hover:border-blue-300 transition-colors">
                <div class="flex items-start justify-between gap-3 mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold" :style="{ color: cloudTypeConfigMap[link.type]?.color }">
                      {{ cloudTypeConfigMap[link.type]?.label || link.type }}
                    </span>
                    <span class="text-xs text-muted-foreground">
                      {{ formatDate(link.datetime) }}
                    </span>
                  </div>
                </div>

                <p v-if="link.work_title" class="text-sm text-foreground mb-2 font-medium">
                  {{ link.work_title }}
                </p>

                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-muted-foreground flex-shrink-0">链接:</span>
                    <code class="text-xs bg-background px-2 py-1 rounded flex-1 truncate">
                      {{ link.url }}
                    </code>
                    <Button @click="copyToClipboard(link.url, `link-${result.unique_id}-${linkIdx}`)" size="sm" variant="outline" class="h-6 text-xs flex-shrink-0">
                      <Copy v-if="!copyStates[`link-${result.unique_id}-${linkIdx}`]" class="w-3 h-3" />
                      <Check v-else class="w-3 h-3 text-green-600" />
                    </Button>
                  </div>
                  <div v-if="link.password" class="flex items-center gap-2">
                    <span class="text-xs text-muted-foreground flex-shrink-0">密码:</span>
                    <code class="text-xs bg-background px-2 py-1 rounded flex-1 truncate">
                      {{ link.password }}
                    </code>
                    <Button @click="copyToClipboard(link.password, `pwd-${result.unique_id}-${linkIdx}`)" size="sm" variant="outline" class="h-6 text-xs flex-shrink-0">
                      <Copy v-if="!copyStates[`pwd-${result.unique_id}-${linkIdx}`]" class="w-3 h-3" />
                      <Check v-else class="w-3 h-3 text-green-600" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 结果展示 - 按类型分类 -->
        <div v-else class="space-y-4 mb-8">
          <div v-if="searchData.merged_by_type[activeTab]" class="space-y-3">
            <div class="text-sm font-semibold text-muted-foreground mb-3">{{ cloudTypeConfigMap[activeTab].label }} - {{ cloudTypeCounts[activeTab] }} 个结果</div>
            <div v-for="(link, linkIdx) in searchData.merged_by_type[activeTab]" :key="`merged-${activeTab}-${linkIdx}`" class="p-4 border border-border rounded-lg hover:shadow-md transition-shadow bg-card">
              <!-- 资源说明 -->
              <div class="mb-3">
                <h4 class="font-semibold text-foreground mb-2 line-clamp-2">
                  {{ link.note }}
                </h4>
                <div class="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <div class="flex items-center gap-1">
                    <span class="font-medium">来自</span>
                    <Badge v-if="parseSource(link.source).type" :variant="parseSource(link.source).type === 'TG' ? 'default' : 'secondary'" class="text-xs">
                      {{ parseSource(link.source).type }}
                      <span v-if="parseSource(link.source).name">:{{ parseSource(link.source).name }}</span>
                    </Badge>
                  </div>
                  <div class="flex items-center gap-1">
                    <Calendar class="w-3 h-3" />
                    <span>{{ formatDate(link.datetime) }}</span>
                  </div>
                </div>
              </div>

              <!-- 图片 -->
              <div v-if="link.images && link.images.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <div v-for="(image, imgIdx) in link.images.slice(0, 4)" :key="`merged-img-${linkIdx}-${imgIdx}`" class="aspect-square rounded overflow-hidden bg-muted flex items-center justify-center group">
                  <img :src="image" :alt="`link-${linkIdx}-img-${imgIdx}`" class="w-full h-full object-cover group-hover:scale-110 transition-transform cursor-pointer" loading="lazy" />
                </div>
              </div>

              <!-- 链接和密码 -->
              <div class="space-y-2 p-3 bg-muted rounded-md border border-border">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted-foreground flex-shrink-0 font-medium">链接:</span>
                  <code class="text-xs bg-background px-2 py-1 rounded flex-1 truncate font-mono">
                    {{ link.url }}
                  </code>
                  <Button @click="copyToClipboard(link.url, `merged-link-${linkIdx}`)" size="sm" variant="outline" class="h-6 text-xs flex-shrink-0">
                    <Copy v-if="!copyStates[`merged-link-${linkIdx}`]" class="w-3 h-3" />
                    <Check v-else class="w-3 h-3 text-green-600" />
                  </Button>
                </div>
                <div v-if="link.password" class="flex items-center gap-2">
                  <span class="text-xs text-muted-foreground flex-shrink-0 font-medium">密码:</span>
                  <code class="text-xs bg-background px-2 py-1 rounded flex-1 truncate font-mono">
                    {{ link.password }}
                  </code>
                  <Button @click="copyToClipboard(link.password, `merged-pwd-${linkIdx}`)" size="sm" variant="outline" class="h-6 text-xs flex-shrink-0">
                    <Copy v-if="!copyStates[`merged-pwd-${linkIdx}`]" class="w-3 h-3" />
                    <Check v-else class="w-3 h-3 text-green-600" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!isLoading && searchQuery" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <FileText class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p class="text-muted-foreground text-lg">未找到相关资源</p>
          <p class="text-sm text-muted-foreground">尝试更换搜索关键词</p>
        </div>
      </div>

      <!-- 初始状态 - 展示推荐内容 -->
      <div v-else-if="!isLoading" class="w-full flex-1 space-y-12 pb-8">
        <!-- 随机推荐 -->
        <MainRandomRecommendation @search="handleRecommendationSearch" />

        <!-- 热点推荐 -->
        <MainHotTrending @search="handleRecommendationSearch" />
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped lang="postcss">
/* 平滑过渡 */
* {
  @apply transition-all duration-200;
}

/* 代码块样式 */
code {
  font-family: "Monaco", "Courier New", monospace;
}

/* 图片加载动画 */
img {
  @apply bg-gradient-to-r from-muted via-background to-muted bg-cover;
}
</style>
