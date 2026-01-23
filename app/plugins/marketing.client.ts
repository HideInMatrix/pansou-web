export default defineNuxtPlugin(() => {
  return {
    provide: {
      fetchAdBlockUrl: async (url: string) => {
        let adBlockDetected = false;
        try {
          const response = await fetch(url, {
            method: "HEAD",
            mode: "no-cors",
            cache: "no-store",
          });

          // 如果发生重定向，则可能有广告拦截器
          if (response.redirected) {
            adBlockDetected = true;
          }
        } catch (error) {
          console.log("拦截了");
          adBlockDetected = true;
        }

        return adBlockDetected;
      },
    },
  };
});
