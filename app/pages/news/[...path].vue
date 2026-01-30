<script lang="ts" setup>
import { computed } from 'vue';
import { useNewsStore } from '~/store/news';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HtmlRenderer from '@/components/HtmlRenderer.vue';
import { formatDate } from '~~/shared/utils/time';
import { ArrowLeft, Calendar, Globe } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const newsStore = useNewsStore();

// 从路由参数中获取URL并解码
const encodedUrl = computed(() => {
  const paths = route.params.path as string[];
  return decodeURIComponent(paths.join('/'));
});

// 从store中找到对应的新闻
const currentNews = computed(() => {
  return newsStore.news.find((item) => item.link === encodedUrl.value);
});

// 返回列表
const goBack = () => {
  router.back();
};

// 打开原链接
const openOriginalLink = () => {
  if (currentNews.value?.link) {
    window.open(currentNews.value.link, '_blank');
  }
};
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- 顶部导航栏 -->
    <div class="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <Button @click="goBack" variant="ghost" size="sm" class="gap-2">
            <ArrowLeft class="w-4 h-4" />
            返回
          </Button>
          <div v-if="currentNews" class="text-sm text-muted-foreground">
            {{ formatDate(currentNews.pubDate) }}
          </div>
          <div v-else class="w-20" />
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="container mx-auto px-4 py-8">
      <!-- 新闻文章 -->
      <article v-if="currentNews" class="max-w-3xl mx-auto">
        <!-- 标题 -->
        <h1 class="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
          {{ currentNews.title }}
        </h1>

        <!-- 文章元信息 -->
        <div class="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-border">
          <!-- 发布日期 -->
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar class="w-4 h-4" />
            <span>{{ formatDate(currentNews.pubDate) }}</span>
          </div>

          <!-- 来源 -->
          <Badge variant="secondary" class="text-xs">
            RSS Feed
          </Badge>

          <!-- 原链接按钮 -->
          <Button @click="openOriginalLink" size="sm" variant="outline" class="gap-2 ml-auto">
            <Globe class="w-4 h-4" />
            查看原文链接
          </Button>
        </div>

        <!-- 文章内容（解析和渲染HTML） -->
        <div class="max-w-none">
          <HtmlRenderer :html="currentNews.content" />
        </div>

        <!-- 底部操作 -->
        <div class="mt-12 pt-6 border-t border-border flex items-center justify-between">
          <Button @click="goBack" variant="outline" class="gap-2">
            <ArrowLeft class="w-4 h-4" />
            返回列表
          </Button>
          <Button @click="openOriginalLink" class="gap-2">
            <Globe class="w-4 h-4" />
            查看原文
          </Button>
        </div>
      </article>

      <!-- 新闻不存在 -->
      <div v-else class="max-w-3xl mx-auto">
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="text-6xl mb-4">😕</div>
          <h2 class="text-2xl font-semibold text-foreground mb-2">未找到新闻</h2>
          <p class="text-muted-foreground mb-6">该新闻可能已被删除或链接不正确</p>
          <Button @click="goBack" variant="outline" size="lg">
            返回新闻列表
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
