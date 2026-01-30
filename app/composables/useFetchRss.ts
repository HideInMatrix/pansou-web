import { useNewsStore } from "~/store/news";

export const useFetchRss = () => {
  const newsStore = useNewsStore();
  const remoteData = ref<any[]>([]);
  const pendingFlag = ref(false);

  const run = async () => {
    // 只在客户端执行
    if (!import.meta.client) return;

    const nowDate = Date.now();
    const flagDate = new Date(newsStore.date || 0).getTime();    
    if (nowDate - flagDate > 86400000) {
      pendingFlag.value = true;
      const response = await $fetch(
        "https://n9n.matrices.cf/webhook/0fd3bed6-6e5b-441b-9072-88bc06cb1a9e",
        { method: "GET" }
      );
      remoteData.value = response as any[];
      pendingFlag.value = false;

      newsStore.setDate(new Date().toLocaleDateString());
      newsStore.newsToStore(remoteData.value);
    } else {
      remoteData.value = newsStore.news;
    }
  };

  onMounted(() => {    
    run();
  });

  return { remoteData, pendingFlag, refresh: run };
};
