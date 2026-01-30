<script setup lang="ts" async>
import { computed } from "vue";
import { Sparkles,CalendarDays } from "lucide-vue-next";

import { formatDate } from "~~/shared/utils/time";
import type { FeedItem } from "~/store/news";
import { useNewsStore } from "~/store/news";

const emit = defineEmits<{
  search: [keyword: string];
}>();

const newsStore = useNewsStore();
const router = useRouter();

// 使用 useAsyncData 获取随机推荐数据
const { data: remoteData, pending } = await useAsyncData(
  () => `rss-get`,
  (_nuxtApp, { signal }) =>
    // @ts-ignore
    $fetch(`https://n9n.matrices.cf/webhook/0fd3bed6-6e5b-441b-9072-88bc06cb1a9e`, {
      method: "GET",
      signal,
    }),
  {
    immediate: true,
  },
);

// 从 API 响应中提取真实的 merged_by_type 数据
const recommendation = computed(() => {
  if (remoteData.value) {
    const data = remoteData.value as FeedItem[];
    const filteredData = data.filter((item, index) => index < 3);
    if(data.length > 0){
      newsStore.newsToStore(data);
    }
    return filteredData;
  }
  return [];
});

const navigateToPath = (path:string) => {
  router.push(`/news/${encodeURIComponent(path)}`);
}
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <Sparkles class="w-5 h-5 text-yellow-500" />
        <h2 class="text-xl font-semibold text-foreground">随机推荐</h2>
      </div>
    </div>

    <div v-if="recommendation.length > 0" class="space-y-3">
      <div v-for="(link, idx) in recommendation" :key="idx" class="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer group" @click="navigateToPath(link.link)">
        <!-- 标题 -->
        <h3 class="font-semibold text-foreground line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
          {{ link.title }}
        </h3>

        <!-- 内容摘要 -->
        <p v-if="link.contentSnippet" class="text-sm text-muted-foreground line-clamp-2 mb-3">
          {{ link.contentSnippet }}
        </p>

        <!-- 底部元信息 -->
        <div class="flex items-center justify-between text-xs text-muted-foreground">
          <span class="flex items-center gap-1">
            <CalendarDays />{{ formatDate(link.pubDate) }}
          </span>
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="px-2 py-1 bg-muted rounded hover:bg-accent transition-colors cursor-pointer">查看</span>
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
