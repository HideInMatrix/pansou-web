<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { AlertTriangle, ArrowRight, ChevronLeft } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

useSeoMeta({
  title: '离开确认 - 来摸鱼哈',
  description: '您即将离开来摸鱼哈网站，访问外部链接。请确认是否继续。',
  keywords: '离开确认,外部链接,来摸鱼哈',
  ogTitle: '离开确认 - 来摸鱼哈',
  ogDescription: '您即将离开来摸鱼哈网站，访问外部链接。请确认是否继续。',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
});

const externalUrl = ref<string>('');
const isRedirecting = ref(false);

onMounted(() => {
  // 从路由参数中获取 URL（catch-all 路由会返回数组）
  const urlParts = route.params.url as string[];
  if (urlParts && urlParts.length > 0) {
    try {
      externalUrl.value = decodeURIComponent(urlParts.join('/'));
    } catch (e) {
      console.error('Failed to decode URL:', e);
    }
  }
});

// 继续访问
const continueBrowsing = () => {
  if (externalUrl.value) {
    isRedirecting.value = true;
    window.open(externalUrl.value, '_blank');
    // 1秒后返回首页
    setTimeout(() => {
      router.back();
    }, 1000);
  }
};

// 返回
const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
    <!-- 返回按钮 -->
    <button
      @click="goBack"
      class="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
    >
      <ChevronLeft class="w-4 h-4" />
      返回
    </button>

    <!-- 主容器 -->
    <div class="w-full max-w-md">
      <!-- 卡片 -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <!-- 顶部装饰 -->
        <div class="h-1 bg-gradient-to-r from-amber-400 via-red-400 to-rose-400"></div>

        <!-- 内容区域 -->
        <div class="p-8">
          <!-- 警告图标 -->
          <div class="flex justify-center mb-6">
            <div class="relative">
              <div class="absolute inset-0 bg-amber-100 rounded-full blur-xl opacity-50"></div>
              <div class="relative bg-gradient-to-br from-amber-100 to-orange-100 rounded-full p-4">
                <AlertTriangle class="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          <!-- 标题 -->
          <h1 class="text-2xl font-bold text-center text-gray-900 mb-2">
            温馨提醒
          </h1>

          <!-- 副标题 -->
          <p class="text-center text-sm text-gray-500 mb-6">
            您即将离开本站
          </p>

          <!-- 提醒内容 -->
          <div class="space-y-4">
            <!-- 提醒框 -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
              <div class="flex gap-3">
                <div class="flex-shrink-0 mt-0.5">
                  <div class="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center">
                    <span class="text-xs font-bold text-amber-700">!</span>
                  </div>
                </div>
                <div class="text-sm text-amber-900 leading-relaxed">
                  <p class="font-semibold mb-1">您正在离开 panSou 资源搜索</p>
                  <p class="text-xs opacity-80">
                    您即将访问第三方外部网站。我们不对外部网站的内容、准确性、安全性或合法性负责。
                  </p>
                </div>
              </div>
            </div>

            <!-- 网址显示 -->
            <div v-if="externalUrl" class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p class="text-xs text-gray-600 mb-1">目标网址</p>
              <p class="text-xs text-gray-900 break-all font-mono line-clamp-2 hover:line-clamp-none transition-all">
                {{ externalUrl }}
              </p>
            </div>

            <!-- 安全提示 -->
            <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p class="text-xs text-blue-900 leading-relaxed">
                💡 建议您：查看网站隐私政策和条款、谨慎输入个人信息、警惕钓鱼网站
              </p>
            </div>
          </div>

          <!-- 按钮组 -->
          <div class="flex gap-3 mt-8">
            <!-- 返回按钮 -->
            <button
              @click="goBack"
              class="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all active:scale-95"
            >
              留在本站
            </button>

            <!-- 继续访问按钮 -->
            <button
              @click="continueBrowsing"
              :disabled="isRedirecting"
              :class="[
                'flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all active:scale-95 flex items-center justify-center gap-2',
                isRedirecting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-200'
              ]"
            >
              <span>{{ isRedirecting ? '正在打开...' : '继续访问' }}</span>
              <ArrowRight v-if="!isRedirecting" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 底部信息 -->
        <div class="bg-gray-50 border-t border-gray-100 px-8 py-4 text-center">
          <p class="text-xs text-gray-500">
            返回 <span class="font-semibold text-gray-700">panSou</span> 继续搜索
          </p>
        </div>
      </div>

      <!-- 底部描述 -->
      <p class="text-center text-xs text-gray-500 mt-6">
        panSou 是资源聚合搜索平台，不存储任何资源内容
      </p>
    </div>
  </div>
</template>

<style scoped>
/* 平滑过渡 */
button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
