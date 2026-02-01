<script setup lang="ts">
import { GalleryVerticalEnd } from "lucide-vue-next";

useSeoMeta({
  title: '登录 - 来摸鱼哈',
  description: '登录来摸鱼哈账号，享受更多个性化服务和资源推荐。',
  keywords: '登录,来摸鱼哈,账号',
  ogTitle: '登录 - 来摸鱼哈',
  ogDescription: '登录来摸鱼哈账号，享受更多个性化服务和资源推荐。',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
});
</script>

<template>
  <NuxtLayout name="pure">
    <div class="grid min-h-svh lg:grid-cols-2">
      <div class="flex flex-col gap-4 p-6 md:p-10">
        <div class="flex justify-center gap-2 md:justify-start">
          <a href="#" class="flex items-center gap-2 font-medium">
            <div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd class="size-4" />
            </div>
            来摸鱼哈
          </a>
        </div>
        <div class="flex flex-1 items-center justify-center">
          <div class="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div class="bg-muted relative hidden lg:block">
        
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped lang="scss"></style>
