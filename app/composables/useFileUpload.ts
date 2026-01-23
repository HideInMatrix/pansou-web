import { ref } from 'vue';

export const useFileUpload = () => {
  const uploading = ref(false);

  /**
   * 上传文件或 URL
   * @param fileOrUrl File 对象或 URL 字符串
   * @param fileName 文件名 (可选，如果是 URL 会自动生成)
   * @param chatId Telegram chat ID
   * @returns 上传后的文件 URL
   */
  const uploadFile = async (
    fileOrUrl: File | string,
    fileName?: string,
    chatId: string = "-1002356496028"
  ): Promise<string> => {
    uploading.value = true;
    try {
      const isUrl = typeof fileOrUrl === 'string';
      if (isUrl) {
        const fileUrl = new URL(fileOrUrl as string);
          const formData = new FormData();
          formData.append('file', fileOrUrl);
          formData.append('fileName', fileUrl.pathname.split('/').pop()?.split(".").pop()|| 'file');
          formData.append('chatId', chatId); 
        // URL 上传
        const res: any = await $fetch('/api/upload/telegram/url', {
          method: 'POST',
          body: formData,
        });

        if (res.code === 200 && res.data?.file_id) {
          return `https://pan.micromatrix.org/file/${res.data.file_id}`;
        }
        throw new Error('上传未返回有效ID');
      } else {
        // 文件上传
        const formData = new FormData();
        formData.append('file', fileOrUrl);
        formData.append('fileName', fileName || fileOrUrl.name);
        formData.append('chatId', chatId);

        const res: any = await $fetch('/api/upload/telegram/send', {
          method: 'POST',
          body: formData
        });

        if (res.code === 200 && res.data?.file_id) {
          return `https://pan.micromatrix.org/file/${res.data.file_id}`;
        }
        throw new Error('上传未返回有效ID');
      }
    } finally {
      uploading.value = false;
    }
  };

  /**
   * 批量上传 URL
   * @param urls 逗号分隔的 URL 字符串
   * @param chatId Telegram chat ID
   * @returns 上传后的 URL 字符串 (逗号分隔)
   */
  const uploadUrlsInBatch = async (
    urls: string,
    chatId: string = "-1002356496028"
  ): Promise<string> => {
    if (!urls.trim()) return '';

    const urlList = urls
      .split(',')
      .map(u => u.trim())
      .filter(u => u);

    if (urlList.length === 0) return '';

    uploading.value = true;
    try {
      const results: string[] = [];

      for (const url of urlList) {
        const uploadedUrl = await uploadFile(url, undefined, chatId);
        results.push(uploadedUrl);
      }

      return results.join(',');
    } finally {
      uploading.value = false;
    }
  };

  return {
    uploading,
    uploadFile,
    uploadUrlsInBatch
  };
};
