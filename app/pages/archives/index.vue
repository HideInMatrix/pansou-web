<script setup lang="ts" async>
import { computed, ref, watch } from "vue";
import { ArrowLeft, ArrowRight, CalendarDays, FileText, Filter, Loader2, Search, Tag, Wrench } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "~~/shared/utils/time";

interface ArticleTagItem {
  id: string;
  slug: string;
  name: string;
}

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  readTimeMinutes: number;
  publishedAt: string;
  tags: ArticleTagItem[];
}

useSeoMeta({
  title: "文章归档 - 来摸鱼哈",
  description: "基于数据库的文章归档，支持分类、标签和关键词筛选。",
  keywords: "文章列表,文章归档,Prisma,PostgreSQL,来摸鱼哈",
  ogTitle: "文章归档 - 来摸鱼哈",
  ogDescription: "浏览站点归档文章，快速定位目标内容。",
});

const { data, pending, error } = await useAsyncData("archive-articles-list", async () => {
  const response = await $fetch<{ articles: ArticleItem[] }>("/api/articles");
  return response.articles;
});

const keyword = ref("");
const selectedCategory = ref("all");
const selectedTag = ref("all");
const currentPage = ref(1);
const pageSize = 8;

const articles = computed<ArticleItem[]>(() => (data.value as ArticleItem[] | null) ?? []);

const categories = computed(() => {
  const values = new Set<string>();
  for (const article of articles.value) {
    if (article.category) {
      values.add(article.category);
    }
  }
  return ["all", ...Array.from(values)];
});

const tags = computed(() => {
  const values = new Map<string, ArticleTagItem>();
  for (const article of articles.value) {
    for (const tag of article.tags) {
      values.set(tag.slug, tag);
    }
  }
  return [{ id: "all", slug: "all", name: "全部" }, ...Array.from(values.values())];
});

const filteredArticles = computed(() => {
  const text = keyword.value.trim().toLowerCase();

  return articles.value.filter((article) => {
    const matchesText = !text
      || article.title.toLowerCase().includes(text)
      || article.excerpt.toLowerCase().includes(text)
      || article.authorName.toLowerCase().includes(text)
      || article.category.toLowerCase().includes(text)
      || article.tags.some((tag) => `${tag.name} ${tag.slug}`.toLowerCase().includes(text));

    const matchesCategory = selectedCategory.value === "all" || article.category === selectedCategory.value;
    const matchesTag = selectedTag.value === "all" || article.tags.some((tag) => tag.slug === selectedTag.value);

    return matchesText && matchesCategory && matchesTag;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredArticles.value.length / pageSize)));

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredArticles.value.slice(start, start + pageSize);
});

watch([keyword, selectedCategory, selectedTag], () => {
  currentPage.value = 1;
});

watch(totalPages, (value) => {
  if (currentPage.value > value) {
    currentPage.value = value;
  }
});

const resolveLink = (article: ArticleItem) => {
  const slug = article.slug
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/archives/${slug}`;
};
</script>

<template>
  <NuxtLayout name="pure">
    <div class="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100">
      <div class="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8">
        <header class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="rounded-xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <Wrench class="h-5 w-5 text-blue-600 transition-transform duration-300 hover:rotate-3 dark:text-indigo-400" />
            </div>
            <div>
              <h1 class="text-2xl font-semibold md:text-3xl">文章归档</h1>
              <p class="text-sm text-zinc-500 dark:text-zinc-400">数据库文章内容索引与检索</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" as-child>
              <NuxtLink to="/">
                <ArrowLeft class="h-4 w-4" />
                返回首页
              </NuxtLink>
            </Button>
            <Badge class="border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
              共 {{ filteredArticles.length }} 篇
            </Badge>
          </div>
        </header>
  
        <div class="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <aside class="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
            <div class="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/85">
              <div class="mb-4 flex items-center gap-2 text-sm font-medium">
                <Filter class="h-4 w-4 text-blue-600 dark:text-indigo-400" />
                控制塔
              </div>
              <div class="relative mb-4">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  v-model="keyword"
                  placeholder="搜索标题 / 摘要 / 标签"
                  class="border-zinc-200 bg-white pl-9 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>
              <div class="flex-1 space-y-6 overflow-y-auto pr-1">
                <div>
                  <h2 class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    <Tag class="h-4 w-4" />
                    分类
                  </h2>
                  <div class="flex flex-wrap gap-2">
                    <Button
                      v-for="category in categories"
                      :key="`category-${category}`"
                      :variant="selectedCategory === category ? 'default' : 'outline'"
                      size="sm"
                      class="h-7"
                      @click="selectedCategory = category"
                    >
                      {{ category === 'all' ? '全部' : category }}
                    </Button>
                  </div>
                </div>
  
                <Separator />
  
                <div>
                  <h2 class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    <Tag class="h-4 w-4" />
                    标签
                  </h2>
                  <div class="flex flex-wrap gap-2">
                    <Button
                      v-for="tag in tags"
                      :key="`tag-${tag.slug}`"
                      :variant="selectedTag === tag.slug ? 'default' : 'outline'"
                      size="sm"
                      class="h-7"
                      @click="selectedTag = tag.slug"
                    >
                      {{ tag.slug === 'all' ? '全部' : `#${tag.name}` }}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
  
          <main class="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white/70 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
            <div class="pointer-events-none absolute inset-0 bg-grid-pattern" />
            <div class="relative p-4 md:p-6">
              <div v-if="pending" class="flex min-h-[420px] items-center justify-center">
                <div class="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Loader2 class="h-5 w-5 animate-spin text-blue-600 dark:text-indigo-400" />
                  正在加载文章索引...
                </div>
              </div>
  
              <div v-else-if="error" class="bg-checkerboard rounded-2xl border border-zinc-200 p-8 text-center dark:border-zinc-800">
                <p class="text-lg font-semibold">内容读取失败</p>
                <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">请检查数据库连接或稍后重试。</p>
              </div>
  
              <div v-else-if="paginatedArticles.length === 0" class="bg-checkerboard rounded-2xl border border-zinc-200 p-8 text-center dark:border-zinc-800">
                <p class="text-lg font-semibold">暂无匹配文章</p>
                <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">调整关键词、分类或标签后再试。</p>
              </div>
  
              <div v-else class="space-y-4">
                <NuxtLink
                  v-for="article in paginatedArticles"
                  :key="article.id"
                  :to="resolveLink(article)"
                  class="group block rounded-2xl border border-zinc-200 bg-white/95 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900/95 dark:hover:border-indigo-500/60"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="mb-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <CalendarDays class="h-4 w-4 text-blue-600 transition-transform duration-300 group-hover:rotate-3 dark:text-indigo-400" />
                        {{ formatDate(article.publishedAt) }}
                        <span class="text-zinc-300 dark:text-zinc-700">|</span>
                        <span>{{ article.authorName || "匿名" }}</span>
                        <span class="text-zinc-300 dark:text-zinc-700">|</span>
                        <span>{{ article.readTimeMinutes }} 分钟阅读</span>
                      </div>
                      <h3 class="mb-2 line-clamp-2 text-lg font-semibold text-zinc-900 transition-colors group-hover:text-blue-700 dark:text-zinc-100 dark:group-hover:text-indigo-300">
                        {{ article.title }}
                      </h3>
                      <p class="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {{ article.excerpt || "暂无摘要内容" }}
                      </p>
                      <div class="mt-4 flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {{ article.category }}
                        </Badge>
                        <Badge
                          v-for="tag in article.tags"
                          :key="`tag-${article.id}-${tag.slug}`"
                          class="border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300"
                        >
                          #{{ tag.name }}
                        </Badge>
                      </div>
                    </div>
                    <div class="mt-1 shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 p-2 transition-all duration-300 group-hover:border-blue-200 group-hover:bg-blue-50 dark:border-zinc-800 dark:bg-zinc-900 dark:group-hover:border-indigo-500/60 dark:group-hover:bg-indigo-950/40">
                      <FileText class="h-4 w-4 text-zinc-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:text-blue-600 dark:text-zinc-400 dark:group-hover:text-indigo-300" />
                    </div>
                  </div>
                  <div class="mt-4 flex items-center justify-end text-xs font-medium text-blue-700 transition-colors group-hover:text-blue-800 dark:text-indigo-300 dark:group-hover:text-indigo-200">
                    查看详情
                    <ArrowRight class="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </NuxtLink>
              </div>
  
              <div v-if="filteredArticles.length > pageSize" class="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p class="text-sm text-zinc-500 dark:text-zinc-400">第 {{ currentPage }} / {{ totalPages }} 页</p>
                <div class="flex items-center gap-2">
                  <Button variant="outline" size="sm" :disabled="currentPage <= 1" @click="currentPage -= 1">
                    上一页
                  </Button>
                  <Button variant="outline" size="sm" :disabled="currentPage >= totalPages" @click="currentPage += 1">
                    下一页
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
