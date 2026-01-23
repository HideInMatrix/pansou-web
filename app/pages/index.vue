<script setup lang="ts">
import { ref, computed, reactive } from "vue";

import { Search, FileText, Calendar, Copy, Check } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type {
  SearchResponse,
  SearchResult,
  MergedLink,
  CloudType,
  CloudTypeConfig,
} from "~~/shared/types/search";


// API 配置
const API_BASE_URL = "https://api.laimoyuha.com";

// 搜索状态
const searchQuery = ref("");
const isLoading = ref(false);
const activeTab = ref<CloudType | "all">("all");
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

// 执行搜索
const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;

  isLoading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/api/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kw: searchQuery.value,
        res: "all", // 获取所有结果用于展示
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data: SearchResponse = await response.json();
    console.log(data);
    
    searchData.total = data.total || 0;
    searchData.results = data.results || [];
    searchData.merged_by_type = data.merged_by_type || {};
    activeTab.value = "all";
  } catch (error) {
    console.error("Search failed:", error);
    searchData.total = 0;
    searchData.results = [];
    searchData.merged_by_type = {};
  } finally {
    isLoading.value = false;
  }
};

// 处理回车搜索
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    handleSearch();
  }
};

// 计算各类型的数量
const cloudTypeCounts = computed(() => {
  const counts: Record<CloudType, number> = {} as any;
  Object.entries(searchData.merged_by_type).forEach(([type, links]) => {
    counts[type as CloudType] = (links as MergedLink[]).length;
  });
  return counts;
});

// 获取已有的网盘类型（按照有数据的类型排序）
const availableCloudTypes = computed(() => {
  return Object.keys(searchData.merged_by_type) as CloudType[];
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

// 格式化日期
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "未知";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN");
  } catch {
    return "未知";
  }
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
            <Input
              v-model="searchQuery"
              @keydown="handleKeydown"
              type="text"
              placeholder="搜索网盘资源..."
              class="w-full pr-10 h-10 text-base"
            />
            <Search class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
          <Button
            @click="handleSearch"
            :disabled="isLoading || !searchQuery.trim()"
            class="w-full md:w-auto h-10 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {{ isLoading ? "搜索中..." : "搜索" }}
          </Button>
        </div>
      </div>

      <!-- 搜索结果部分 -->
      <div v-if="searchData.total > 0 || searchData.results.length > 0" class="w-full flex-1">
        <!-- 结果统计 -->
        <div class="mb-6 p-4 bg-muted rounded-lg">
          <p class="text-lg font-semibold mb-3">
            搜索结果"<span class="text-blue-600 font-bold">{{ searchQuery }}</span>" 
            <span class="text-blue-600">{{ searchData.total }}</span>
            条
          </p>
          <div class="flex gap-2 flex-wrap">
            <button
              @click="activeTab = 'all'"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-background border border-input hover:bg-accent'
              ]"
            >
              全部 ({{ searchData.total }})
            </button>
            <button
              v-for="type in availableCloudTypes"
              :key="type"
              @click="activeTab = type"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1',
                activeTab === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-background border border-input hover:bg-accent'
              ]"
            >
              <span>{{ cloudTypeConfigMap[type].icon }}</span>
              {{ cloudTypeConfigMap[type].label }} ({{ cloudTypeCounts[type] }})
            </button>
          </div>
        </div>

        <!-- 结果展示 - 全部结果（来自原始消息） -->
        <div v-if="activeTab === 'all'" class="space-y-4 mb-8">
          <div
            v-for="(result, index) in searchData.results"
            :key="`result-${result.unique_id}`"
            class="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <!-- 标题和来源 -->
            <div class="mb-3">
              <h3 class="text-base font-semibold text-foreground line-clamp-2 mb-2">
                {{ result.title }}
              </h3>
              <div class="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <div class="flex items-center gap-1">
                  <span class="font-medium">来自</span>
                  <Badge variant="outline">{{ result.channel }}</Badge>
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
            <div
              v-if="result.images && result.images.length > 0"
              class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4"
            >
              <div
                v-for="(image, imgIdx) in result.images.slice(0, 4)"
                :key="`img-${result.unique_id}-${imgIdx}`"
                class="aspect-square rounded overflow-hidden bg-muted flex items-center justify-center group"
              >
                <img
                  :src="image"
                  :alt="`result-${index}-img-${imgIdx}`"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform cursor-pointer"
                  loading="lazy"
                />
              </div>
            </div>

            <!-- 链接列表 -->
            <div v-if="result.links && result.links.length > 0" class="space-y-2">
              <div
                v-for="(link, linkIdx) in result.links"
                :key="`link-${result.unique_id}-${linkIdx}`"
                class="p-3 bg-muted rounded-md border border-border hover:border-blue-300 transition-colors"
              >
                <div class="flex items-start justify-between gap-3 mb-2">
                  <div class="flex items-center gap-2">
                    <span
                      class="text-sm font-semibold"
                      :style="{ color: cloudTypeConfigMap[link.type]?.color }"
                    >
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
                    <Button
                      @click="copyToClipboard(link.url, `link-${result.unique_id}-${linkIdx}`)"
                      size="sm"
                      variant="outline"
                      class="h-6 text-xs flex-shrink-0"
                    >
                      <Copy v-if="!copyStates[`link-${result.unique_id}-${linkIdx}`]" class="w-3 h-3" />
                      <Check v-else class="w-3 h-3 text-green-600" />
                    </Button>
                  </div>
                  <div v-if="link.password" class="flex items-center gap-2">
                    <span class="text-xs text-muted-foreground flex-shrink-0">密码:</span>
                    <code class="text-xs bg-background px-2 py-1 rounded flex-1 truncate">
                      {{ link.password }}
                    </code>
                    <Button
                      @click="copyToClipboard(link.password, `pwd-${result.unique_id}-${linkIdx}`)"
                      size="sm"
                      variant="outline"
                      class="h-6 text-xs flex-shrink-0"
                    >
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
            <div class="text-sm font-semibold text-muted-foreground mb-3">
              {{ cloudTypeConfigMap[activeTab].label }} - {{ cloudTypeCounts[activeTab] }} 个结果
            </div>
            <div
              v-for="(link, linkIdx) in searchData.merged_by_type[activeTab]"
              :key="`merged-${activeTab}-${linkIdx}`"
              class="p-4 border border-border rounded-lg hover:shadow-md transition-shadow bg-card"
            >
              <!-- 资源说明 -->
              <div class="mb-3">
                <h4 class="font-semibold text-foreground mb-2 line-clamp-2">
                  {{ link.note }}
                </h4>
                <div class="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <div class="flex items-center gap-1">
                    <span class="font-medium">来自</span>
                    <Badge
                      v-if="parseSource(link.source).type"
                      :variant="parseSource(link.source).type === 'TG' ? 'default' : 'secondary'"
                      class="text-xs"
                    >
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
              <div
                v-if="link.images && link.images.length > 0"
                class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4"
              >
                <div
                  v-for="(image, imgIdx) in link.images.slice(0, 4)"
                  :key="`merged-img-${linkIdx}-${imgIdx}`"
                  class="aspect-square rounded overflow-hidden bg-muted flex items-center justify-center group"
                >
                  <img
                    :src="image"
                    :alt="`link-${linkIdx}-img-${imgIdx}`"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform cursor-pointer"
                    loading="lazy"
                  />
                </div>
              </div>

              <!-- 链接和密码 -->
              <div class="space-y-2 p-3 bg-muted rounded-md border border-border">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted-foreground flex-shrink-0 font-medium">链接:</span>
                  <code class="text-xs bg-background px-2 py-1 rounded flex-1 truncate font-mono">
                    {{ link.url }}
                  </code>
                  <Button
                    @click="copyToClipboard(link.url, `merged-link-${linkIdx}`)"
                    size="sm"
                    variant="outline"
                    class="h-6 text-xs flex-shrink-0"
                  >
                    <Copy v-if="!copyStates[`merged-link-${linkIdx}`]" class="w-3 h-3" />
                    <Check v-else class="w-3 h-3 text-green-600" />
                  </Button>
                </div>
                <div v-if="link.password" class="flex items-center gap-2">
                  <span class="text-xs text-muted-foreground flex-shrink-0 font-medium">密码:</span>
                  <code class="text-xs bg-background px-2 py-1 rounded flex-1 truncate font-mono">
                    {{ link.password }}
                  </code>
                  <Button
                    @click="copyToClipboard(link.password, `merged-pwd-${linkIdx}`)"
                    size="sm"
                    variant="outline"
                    class="h-6 text-xs flex-shrink-0"
                  >
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
      <div
        v-else-if="!isLoading && searchQuery"
        class="flex-1 flex items-center justify-center"
      >
        <div class="text-center">
          <FileText class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p class="text-muted-foreground text-lg">未找到相关资源</p>
          <p class="text-sm text-muted-foreground">尝试更换搜索关键词</p>
        </div>
      </div>

      <!-- 初始状态 -->
      <div v-else-if="!isLoading" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <Search class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p class="text-muted-foreground text-lg">输入关键词开始搜索</p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped lang="css">
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
