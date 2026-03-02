<script setup lang="ts" async>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { ArrowLeft, CalendarDays, FolderOpen, Loader2, Tag, UserRound } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "~~/shared/utils/time";

interface ArticleDetail {
  title: string;
  path: string;
  id?: string;
  date?: string;
  auther?: string;
  author?: string;
  cover?: string;
  excerpt?: string;
  permalink?: string;
  categories?: string[];
  tags?: string[];
  body?: Record<string, unknown>;
}

const route = useRoute();
const normalizedPath = computed(() => {
  if (route.path === "/") {
    return "/";
  }
  return route.path.replace(/\/+$/, "");
});

const { data, pending, error } = await useAsyncData(
  "content-article-detail",
  async () => {
    return queryCollection("articles")
      .orWhere((group) => group.where("permalink", "=", normalizedPath.value).where("path", "=", normalizedPath.value))
      .first();
  },
  {
    watch: [normalizedPath],
  },
);

const article = computed<ArticleDetail | null>(() => (data.value as ArticleDetail | null) ?? null);
const authorName = computed(() => article.value?.auther || article.value?.author || "匿名");
const categoryList = computed(() => article.value?.categories ?? []);
const tagList = computed(() => article.value?.tags ?? []);
const articleLink = computed(() => article.value?.permalink || article.value?.path || "/archives");
const articleContentRef = ref<HTMLElement | null>(null);

const renderMermaid = async () => {
  if (import.meta.server) {
    return;
  }

  try {
    await nextTick();
    const root = articleContentRef.value;
    if (!root) {
      return;
    }

    const mermaidCodeBlocks = Array.from(root.querySelectorAll<HTMLElement>("pre code.language-mermaid"));
    if (!mermaidCodeBlocks.length) {
      return;
    }

    const { default: mermaid } = await import("mermaid");
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
    });

    const nodes: HTMLElement[] = [];
    for (const codeBlock of mermaidCodeBlocks) {
      const pre = codeBlock.closest("pre");
      if (!pre || pre.dataset.mermaidProcessed === "true") {
        continue;
      }

      pre.dataset.mermaidProcessed = "true";
      const container = document.createElement("div");
      container.className = "mermaid mermaid-diagram";
      container.textContent = codeBlock.textContent ?? "";
      pre.replaceWith(container);
      nodes.push(container);
    }

    if (nodes.length > 0) {
      await mermaid.run({ nodes });
    }
  } catch (renderError) {
    console.error("[content] Mermaid render failed:", renderError);
  }
};

onMounted(() => {
  renderMermaid();
});

watch(
  () => article.value?.path,
  () => {
    renderMermaid();
  },
);

useSeoMeta({
  title: () => (article.value ? `${article.value.title} - 文章详情` : "文章详情 - 来摸鱼哈"),
  description: () => article.value?.excerpt || "查看文章完整内容与元信息。",
  ogTitle: () => (article.value ? `${article.value.title} - 文章详情` : "文章详情 - 来摸鱼哈"),
  ogDescription: () => article.value?.excerpt || "查看文章完整内容与元信息。",
});
</script>

<template>
  <NuxtLayout name="pure">
    <div class="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100">
      <div class="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8">
        <div v-if="pending" class="flex min-h-[60vh] items-center justify-center">
          <div class="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Loader2 class="h-5 w-5 animate-spin text-blue-600 dark:text-indigo-400" />
            正在加载文章内容...
          </div>
        </div>
  
        <div v-else-if="error || !article" class="bg-checkerboard rounded-2xl border border-zinc-200 p-10 text-center shadow-sm dark:border-zinc-800">
          <h1 class="text-xl font-semibold">文章不存在或读取失败</h1>
          <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">请检查 permalink 是否正确，或返回列表重新选择文章。</p>
          <Button class="mt-6" as-child>
            <NuxtLink to="/archives">返回文章列表</NuxtLink>
          </Button>
        </div>
  
        <div v-else class="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <aside class="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
            <div class="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/85">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">控制塔</span>
                <Badge variant="outline">ID: {{ article.id }}</Badge>
              </div>
  
              <Separator class="my-4" />
  
              <div class="space-y-3 text-sm">
                <div class="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                  <UserRound class="h-4 w-4 text-blue-600 dark:text-indigo-400" />
                  <span>{{ authorName }}</span>
                </div>
                <div class="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                  <CalendarDays class="h-4 w-4 text-blue-600 dark:text-indigo-400" />
                  <span>{{ formatDate(article.date) }}</span>
                </div>
              </div>
  
              <Separator class="my-4" />
  
              <div>
                <h2 class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  <FolderOpen class="h-4 w-4" />
                  分类
                </h2>
                <div class="flex flex-wrap gap-2">
                  <Badge v-for="category in categoryList" :key="`category-${category}`" variant="outline">
                    {{ category }}
                  </Badge>
                  <span v-if="categoryList.length === 0" class="text-xs text-zinc-400">无分类</span>
                </div>
              </div>
  
              <Separator class="my-4" />
  
              <div>
                <h2 class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  <Tag class="h-4 w-4" />
                  标签
                </h2>
                <div class="flex flex-wrap gap-2">
                  <Badge
                    v-for="tag in tagList"
                    :key="`tag-${tag}`"
                    class="border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300"
                  >
                    #{{ tag }}
                  </Badge>
                  <span v-if="tagList.length === 0" class="text-xs text-zinc-400">无标签</span>
                </div>
              </div>
  
              <div class="mt-auto space-y-2 pt-6">
                <Button class="w-full justify-center gap-2" variant="outline" as-child>
                  <NuxtLink to="/archives">
                    <ArrowLeft class="h-4 w-4" />
                    返回列表
                  </NuxtLink>
                </Button>
                <Button class="w-full justify-center" as-child>
                  <NuxtLink :to="articleLink">使用 permalink 打开</NuxtLink>
                </Button>
              </div>
            </div>
          </aside>
  
          <main class="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white/70 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
            <div class="pointer-events-none absolute inset-0 bg-grid-pattern" />
            <article class="relative p-5 md:p-8">
              <h1 class="text-2xl font-bold leading-tight md:text-4xl">{{ article.title }}</h1>
              <p v-if="article.excerpt" class="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {{ article.excerpt }}
              </p>
  
              <Separator class="my-6" />
  
              <div ref="articleContentRef" class="article-content">
                <ContentRenderer :value="article" />
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4) {
  margin-top: 1.6rem;
  margin-bottom: 0.8rem;
  font-weight: 700;
  line-height: 1.3;
}

.article-content :deep(h1) {
  font-size: 1.8rem;
}

.article-content :deep(h2) {
  font-size: 1.5rem;
}

.article-content :deep(h3) {
  font-size: 1.25rem;
}

.article-content :deep(p),
.article-content :deep(ul),
.article-content :deep(ol),
.article-content :deep(blockquote) {
  margin: 0.9rem 0;
  color: rgb(82 82 91);
  line-height: 1.9;
}

.dark .article-content :deep(p),
.dark .article-content :deep(ul),
.dark .article-content :deep(ol),
.dark .article-content :deep(blockquote) {
  color: rgb(161 161 170);
}

.article-content :deep(ul),
.article-content :deep(ol) {
  padding-left: 1.3rem;
}

.article-content :deep(code) {
  border: 1px solid rgb(228 228 231);
  border-radius: 0.4rem;
  background: rgb(250 250 250);
  padding: 0.1rem 0.35rem;
  font-size: 0.85rem;
}

.dark .article-content :deep(code) {
  border-color: rgb(39 39 42);
  background: rgb(24 24 27);
}

.article-content :deep(pre) {
  overflow-x: auto;
  border: 1px solid rgb(228 228 231);
  border-radius: 0.8rem;
  background: rgb(250 250 250);
  padding: 0.9rem;
}

.dark .article-content :deep(pre) {
  border-color: rgb(39 39 42);
  background: rgb(24 24 27);
}

.article-content :deep(.mermaid-diagram) {
  margin: 1rem 0;
  overflow-x: auto;
}

.article-content :deep(.mermaid-diagram svg) {
  max-width: 100%;
  height: auto;
}
</style>
