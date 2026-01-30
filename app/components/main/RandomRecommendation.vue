<script setup lang="ts" async>
import { computed } from "vue";
import { Sparkles, CalendarDays, Shuffle } from "lucide-vue-next";

import { formatDate } from "~~/shared/utils/time";
import type { FeedItem } from "~/store/news";

const emit = defineEmits<{
  search: [keyword: string];
}>();

const router = useRouter();
const seed = ref(0);

const { remoteData, pendingFlag } = useFetchRss();

function pickRandom<T>(arr: T[], n: number) {
  if (!arr?.length) return [];
  const copy = arr.slice();
  // Fisher–Yates shuffle
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, Math.min(n, copy.length));
}
const recommendation = computed(() => {
  if (remoteData.value) {
    seed.value;
    const data = remoteData.value as FeedItem[];
    const filteredData = pickRandom(data, 3);
    return filteredData;
  }
  return [];
});

const shuffleRecommendation = () => {
  seed.value++;
};

const navigateToPath = (path: string) => {
  router.push(`/news/${encodeURIComponent(path)}`);
};
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <Sparkles class="w-5 h-5 text-yellow-500" />
        <h2 class="text-xl font-semibold text-foreground">随机推荐</h2>
      </div>
      <Button class="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-border bg-card hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer" :disabled="pendingFlag || !remoteData?.length" @click="shuffleRecommendation">
        <Shuffle class="w-4 h-4" />
        换一换
      </Button>
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
          <span class="flex items-center gap-1"> <CalendarDays />{{ formatDate(link.pubDate) }} </span>
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="px-2 py-1 bg-muted rounded hover:bg-accent transition-colors cursor-pointer">查看</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载中状态 -->
    <div v-else-if="pendingFlag" class="flex items-center justify-center py-12">
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
