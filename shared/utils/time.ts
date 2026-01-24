// 格式化日期
export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "未知";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN");
  } catch {
    return "未知";
  }
};