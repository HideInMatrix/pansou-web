<script lang="ts" setup>
import { OctagonAlert } from "lucide-vue-next";

useHead({
  script: [
    {
      async: true,
      src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5901616898778649",
      crossorigin: "anonymous",
    },
  ],
});

const menus:{name:string,path:string}[] = [];



const { $fetchAdBlockUrl } = useNuxtApp();
const isBlocked = ref(false);
// 重新检测按钮点击处理
const checkAgain = async () => {
  window.location.reload();
};
onMounted(() => {
  //
  $fetchAdBlockUrl("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js").then((blocked) => {
    isBlocked.value = blocked;
  });
});
</script>

<template>
  <div class="flex flex-col bg-background h-dvh">
    <header class="border-grid sticky top-0 z-50 w-full border-b backdrop-blur">
      <div class="mx-auto flex w-full md:max-w-70dvw px-4 md:px-0">
        <NuxtLink to="/" class="py-1 text-2xl font-bold">
          <NuxtImg src="/favicon.png" alt="Logo" class="w-10 h-10 inline-block" />
        </NuxtLink>
        <nav class="flex space-x-4 items-center ml-10">
          <NuxtLink :to="val.path" v-for="val in menus" :key="val.path" class="font-bold">
            {{ val.name }}
          </NuxtLink>
        </nav>

      </div>
    </header>
    <main class="mx-auto flex-1 w-full md:max-w-70dvw px-4 md:px-0">
      <slot />
    </main>

    <!-- Footer 免责声明 -->
    <footer class="border-t border-border bg-muted/50 mt-12">
      <div class="mx-auto w-full md:max-w-70dvw px-4 md:px-0 py-8">
        <div class="space-y-4 text-center">
          <h3 class="text-lg font-semibold text-foreground">免责声明</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">
            本站资源均来源于网络，仅供学习交流使用，严禁商业用途。<br>
            我们不存储任何文件，仅提供搜索服务。<br> 
            使用本站即表示您同意遵守相关法律法规，由此产生的责任与本站无关。
          </p>
          <p class="text-sm text-muted-foreground flex items-center gap-2 justify-center">
            <span>📝</span>
            <span>资源版权归原作者所有</span>
          </p>
        </div>
      </div>
    </footer>


    <ElDialog :model-value="isBlocked" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false" width="max-content" :style="'--el-dialog-margin-top:15vh'">
      <template #header>
        <div class="flex items-center gap-2">
          <OctagonAlert class="text-warning text-xl" />
          <span class="text-xl font-bold">请禁用广告拦截器</span>
        </div>
      </template>

      <div class="text-center space-y-6 pb-8">
        <ElAlert type="warning" :closable="false" class="text-lg"> 我们检测到您正在使用广告拦截器 </ElAlert>

        <div class="space-y-4 mt-6">
          <p class="text-lg">为了支持网站的持续运营，请:</p>
          <p class="text-lg">暂时禁用广告拦截器或将本站添加到白名单中</p>
          <p class="text-lg">刷新页面以重新检测</p>
        </div>

        <div class="mt-8">
          <ElButton type="primary" size="large" @click="checkAgain"> 我已禁用广告拦截器，重新检测 </ElButton>
        </div>

        <p class="text-gray-500 mt-4">我们承诺只展示适度的非侵入性广告。您的支持对我们非常重要！</p>
      </div>
    </ElDialog>
  </div>
</template>
