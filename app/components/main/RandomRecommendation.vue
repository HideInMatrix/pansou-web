<script setup lang="ts" async>
import { ref, computed, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-vue-next';
import type { MergedLink } from '~~/shared/types/search';

import {formatDate} from "~~/shared/utils/time";

const API_BASE_URL = 'https://api.laimoyuha.com';

const emit = defineEmits<{
  search: [keyword: string];
}>();

// 随机关键词列表，用于模拟随机推荐
const randomKeywords = [
  '电影', '电视剧', '动漫', '综艺', '纪录片',
  '音乐', '游戏', '软件', '教程', '小说',
  '漫画', '设计', '摄影', '美食', '旅游',
  '体育', '健身', '瑜伽', '舞蹈', '音乐会'
];

interface ApiResponse {
  code: number;
  data: {
    total: number;
    merged_by_type: Record<string, MergedLink[]>;
  };
}

const getRandomKeyword = (): string => {
  return randomKeywords[Math.floor(Math.random() * randomKeywords.length)]!;
};

const currentKeyword = ref<string>(getRandomKeyword());
const activeRecommendationType = ref<string>('all');

// 使用 useAsyncData 获取随机推荐数据
const { data: remoteData, pending } = await useAsyncData(
  () => `random-recommendation:${currentKeyword.value}`,
  (_nuxtApp, { signal }) =>
    // @ts-ignore
    $fetch(`${API_BASE_URL}/api/search`, {
      method: 'POST',
      body: {
        kw: currentKeyword.value,
        res: 'merge',
      },
      signal,
    }),
  {
    immediate: true,
    watch: [currentKeyword],
  }
);

// 从 API 响应中提取真实的 merged_by_type 数据
const recommendation = computed(() => {
  if (remoteData.value) {
    const data = remoteData.value as ApiResponse;
    return data?.data?.merged_by_type || {};
  }
  return {};
});

// 获取可用的类型列表
const availableTypes = computed(() => {
  return Object.keys(recommendation.value);
});

// 获取当前选中类型的资源（最多3个）
const currentTypeResources = computed(() => {
  if (activeRecommendationType.value === 'all') {
    // 返回所有类型的资源，总共最多3个
    const all: MergedLink[] = [];
    for (const links of Object.values(recommendation.value)) {
      if (all.length >= 3) break;
      all.push(...(links as MergedLink[]).slice(0, 3 - all.length));
    }
    return all;
  }
  return ((recommendation.value[activeRecommendationType.value] as MergedLink[]) || []).slice(0, 3);
});

// 当推荐数据变化时，重置选中类型
watch(
  recommendation,
  () => {
    activeRecommendationType.value = 'all';
  }
);

const handleRefresh = () => {
  currentKeyword.value = getRandomKeyword();
  console.log(currentKeyword.value);
  
};

const handleSearch = (keyword: string) => {
  emit('search', keyword);
};
</script>

<template>
  <div class="w-full">
    <!-- 随机推荐标题 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <Sparkles class="w-5 h-5 text-yellow-500" />
        <h2 class="text-xl font-semibold text-foreground">随机推荐</h2>
      </div>
      <Button
        @click="handleRefresh"
        :disabled="pending"
        variant="outline"
        size="sm"
      >
        {{ pending ? '加载中...' : '换一个' }}
      </Button>
    </div>

    <!-- 资源类型切换按钮 - 顶部 -->
    <div v-if="availableTypes.length > 0" class="mb-6 flex gap-2 flex-wrap">
      <button
        @click="activeRecommendationType = 'all'"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-colors',
          activeRecommendationType === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-background border border-input hover:bg-accent'
        ]"
      >
        全部
      </button>
      <button
        v-for="type in availableTypes"
        :key="type"
        @click="activeRecommendationType = type"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-colors',
          activeRecommendationType === type
            ? 'bg-blue-600 text-white'
            : 'bg-background border border-input hover:bg-accent'
        ]"
      >
        {{ type }}
      </button>
    </div>

    <!-- 资源展示 - 底部 -->
    <div v-if="currentTypeResources.length > 0" class="space-y-3">
      <div
        v-for="(link, idx) in currentTypeResources"
        :key="`${activeRecommendationType}-${idx}`"
        class="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        @click="handleSearch(link.note)"
      >
        <div class="flex gap-4">
          <!-- 图片 -->
          <div
            v-if="link.images && link.images.length > 0"
            class="flex-shrink-0 w-24 h-24 rounded overflow-hidden bg-muted flex items-center justify-center group"
          >
            <img
              :src="link.images[0]"
              :alt="link.note"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          </div>

          <!-- 资源信息 -->
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-foreground line-clamp-2 mb-2">
              {{ link.note }}
            </h4>

            <!-- 来源和时间 -->
            <div class="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
              <span class="px-2 py-1 bg-muted rounded">{{ activeRecommendationType === 'all' ? Object.keys(recommendation).find(type => (recommendation[type] as any).includes(link)) : activeRecommendationType }}</span>
              <span v-if="link.password" class="text-xs text-muted-foreground">密码:{{ link.password }}</span>
              <span v-if="link.datetime" class="text-xs text-muted-foreground">时间:{{ formatDate(link.datetime) }}</span>
            </div>

            <!-- 链接预览 -->
            <code class="text-xs bg-muted px-2 py-1 rounded block truncate text-muted-foreground">
              {{ link.url }}
            </code>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载中状态 -->
    <div v-else-if="pending" class="flex items-center justify-center py-12">
      <div class="text-center">
        <p class="text-muted-foreground">加载推荐中...</p>
      </div>
    </div>

    <!-- 暂无数据 -->
    <div v-else class="flex items-center justify-center py-12">
      <div class="text-center">
        <p class="text-muted-foreground">暂无推荐数据</p>
      </div>
    </div>
  </div>
</template>
