<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Flame, ExternalLink } from 'lucide-vue-next';

interface HotRoute {
  name: string;
  path: string;
}

interface HotItem {
  id: string;
  title: string;
  timestamp: number;
  hot: number;
  url: string;
  mobileUrl: string;
}

interface HotListResponse {
  code: number;
  name: string;
  title: string;
  type: string;
  description: string;
  link: string;
  total: number;
  fromCache: boolean;
  updateTime: string;
  data: HotItem[];
}

const HOTLIST_API = 'https://api.freejk.com/shuju/hotlist';

const emit = defineEmits<{
  search: [keyword: string];
}>();

const router = useRouter();

const routes = ref<HotRoute[]>([]);
const selectedRoute = ref<string>('');
const hotItems = ref<HotItem[]>([]);
const isLoading = ref(false);

// 获取热点列表
const fetchRoutes = async () => {
  try {
    const response = await fetch(`${HOTLIST_API}/all`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    routes.value = data.routes || [];
    if (routes.value.length > 0) {
      selectedRoute.value = routes.value[0]?.path || '';
      if (selectedRoute.value) {
        fetchHotItems(selectedRoute.value);
      }
    }
  } catch (error) {
    console.error('Failed to fetch routes:', error);
  }
};

// 获取热点数据
const fetchHotItems = async (path: string) => {
  isLoading.value = true;
  try {
    const response = await fetch(`${HOTLIST_API}${path}`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data: HotListResponse = await response.json();
    hotItems.value = data.data || [];
  } catch (error) {
    console.error('Failed to fetch hot items:', error);
    hotItems.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleRouteChange = (path: string) => {
  selectedRoute.value = path;
  fetchHotItems(path);
};

// 处理外链点击 - 跳转到提醒页面
const handleExternalLink = (url: string) => {
  router.push(`/leaving/${encodeURIComponent(url)}`);
};

// 格式化热度数字
const formatHot = (hot: number = 100) => {
  if (hot >= 1000000) {
    return (hot / 1000000).toFixed(1) + 'M';
  } else if (hot >= 1000) {
    return (hot / 1000).toFixed(1) + 'K';
  }
  return hot.toString();
};

onMounted(() => {
  fetchRoutes();
});
</script>

<template>
  <div class="w-full">
    <!-- 热门推荐标题 -->
    <div class="flex items-center gap-2 mb-6">
      <Flame class="w-5 h-5 text-red-500" />
      <h2 class="text-xl font-semibold text-foreground">热点推荐</h2>
    </div>

    <!-- 热点来源选择 -->
    <div v-if="routes.length > 0" class="mb-6">
      <div class="flex gap-2 flex-wrap">
        <button v-for="route in routes" :key="route.path" @click="handleRouteChange(route.path)" :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-colors',
          selectedRoute === route.path
            ? 'bg-red-500 text-white'
            : 'bg-background border border-input hover:bg-accent'
        ]">
          {{ route.name }}
        </button>
      </div>
    </div>

    <!-- 热点列表 -->
    <div v-if="hotItems.length > 0" class="space-y-2">
      <div v-for="(item, idx) in hotItems.slice(0, 10)"
        :key="item.id"
        @click="handleExternalLink(item.url)"
        class="flex items-center gap-4 p-3 bg-card border border-border rounded-lg hover:shadow-md transition-shadow group cursor-pointer">
        <!-- 排名 -->
        <div :class="[
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
          idx < 3
            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
            : 'bg-muted text-muted-foreground'
        ]">
          {{ idx + 1 }}
        </div>

        <!-- 标题和热度 -->
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-foreground line-clamp-1 group-hover:text-blue-600 transition-colors">
            {{ item.title }}
          </h3>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs text-muted-foreground">
              {{ new Date(item.timestamp).toLocaleString('zh-CN') }}
            </span>
          </div>
        </div>

        <!-- 热度值 -->
        <div class="flex-shrink-0">
          <div class="text-right">
            <div class="font-semibold text-red-500 text-sm">
              {{ formatHot(item.hot) }}
            </div>
            <div class="text-xs text-muted-foreground">热度</div>
          </div>
        </div>

        <!-- 外链图标 -->
        <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="p-2 hover:bg-muted rounded transition-colors">
            <ExternalLink class="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-else-if="isLoading" class="flex items-center justify-center py-12">
      <p class="text-muted-foreground">加载热点中...</p>
    </div>

    <!-- 暂无数据 -->
    <div v-else class="flex items-center justify-center py-12">
      <p class="text-muted-foreground">暂无热点数据</p>
    </div>
  </div>
</template>
