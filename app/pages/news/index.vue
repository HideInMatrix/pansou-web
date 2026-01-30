<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '~~/shared/utils/time';
import { ExternalLink, Newspaper, Search } from 'lucide-vue-next';

const router = useRouter();


// 使用 useAsyncData 获取随机推荐数据
const {remoteData} = useFetchRss();


// 当前页码
const currentPage = ref(1);
const itemsPerPage = ref(10);

// 搜索关键词
const searchKeyword = ref('');

// 过滤和分页后的数据
const filteredNews = computed(() => {
  if (!searchKeyword.value) {
    return remoteData.value;
  }
  return remoteData.value.filter((item) =>
    item.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    item.contentSnippet?.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 分页后的数据
const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredNews.value.slice(start, end);
});

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredNews.value.length / itemsPerPage.value);
});

// 打开链接
const openLink = (url: string) => {
  router.push(`/news/${encodeURIComponent(url)}`);
};

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = '';
  currentPage.value = 1;
};

// 页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
};
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- 导航栏 -->
    <div class="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Newspaper class="w-6 h-6 text-blue-500" />
            <h1 class="text-2xl font-bold text-foreground">新闻列表</h1>
          </div>
          <div class="text-sm text-muted-foreground">
            共 {{ filteredNews.length }} 条新闻
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="container mx-auto px-4 py-8">
      <!-- 搜索栏 -->
      <div class="mb-8 flex gap-2">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索新闻标题或内容..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            @keydown.enter="currentPage = 1"
          />
        </div>
        <Button
          v-if="searchKeyword"
          @click="resetSearch"
          variant="outline"
        >
          重置
        </Button>
      </div>

      <!-- 新闻列表 -->
      <div v-if="paginatedNews.length > 0" class="space-y-4">
        <div
          v-for="(item, idx) in paginatedNews"
          :key="idx"
          class="p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
        >
          <!-- 标题 -->
          <h3 class="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-blue-600 transition-colors mb-3">
            {{ item.title }}
          </h3>

          <!-- 内容摘要 -->
          <p class="text-sm text-muted-foreground line-clamp-3 mb-4">
            {{ item.contentSnippet || item.content || '暂无内容摘要' }}
          </p>

          <!-- 底部信息 -->
          <div class="flex items-center justify-between">
            <!-- 日期和来源 -->
            <div class="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" class="text-xs">
                📅 {{ formatDate(item.pubDate) }}
              </Badge>
              <Badge variant="outline" class="text-xs">
                RSS Feed
              </Badge>
            </div>

            <!-- 操作按钮 -->
            <Button
              @click="openLink(item.link)"
              size="sm"
              class="gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              查看原文
              <ExternalLink class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <!-- 搜索无结果 -->
      <div v-else-if="searchKeyword && filteredNews.length === 0" class="flex items-center justify-center py-16">
        <div class="text-center">
          <p class="text-lg text-muted-foreground mb-2">未找到相关新闻</p>
          <p class="text-sm text-muted-foreground mb-4">试试其他搜索词</p>
          <Button @click="resetSearch" variant="outline">
            清除搜索
          </Button>
        </div>
      </div>

      <!-- 暂无数据 -->
      <div v-else-if="remoteData.length === 0" class="flex items-center justify-center py-16">
        <div class="text-center">
          <Newspaper class="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p class="text-lg text-muted-foreground">暂无新闻数据</p>
          <p class="text-sm text-muted-foreground mt-2">请先在首页浏览推荐内容</p>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
        <Button
          @click="handlePageChange(currentPage - 1)"
          :disabled="currentPage === 1"
          variant="outline"
          size="sm"
        >
          上一页
        </Button>

        <div class="flex items-center gap-1">
          <Button
            v-for="page in totalPages"
            :key="page"
            @click="handlePageChange(page)"
            :variant="currentPage === page ? 'default' : 'outline'"
            size="sm"
            class="w-10"
          >
            {{ page }}
          </Button>
        </div>

        <Button
          @click="handlePageChange(currentPage + 1)"
          :disabled="currentPage === totalPages"
          variant="outline"
          size="sm"
        >
          下一页
        </Button>
      </div>

      <!-- 页码信息 -->
      <div v-if="paginatedNews.length > 0" class="mt-4 text-center text-sm text-muted-foreground">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
      </div>
    </div>
  </div>
</template>
