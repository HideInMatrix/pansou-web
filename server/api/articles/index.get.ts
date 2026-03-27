import { listArchiveArticles } from "../../utils/articles";

export default defineEventHandler(async (event) => {
  const limitParam = getQuery(event).limit;
  const parsedLimit = typeof limitParam === "string" ? Number.parseInt(limitParam, 10) : Number.NaN;

  const articles = await listArchiveArticles();
  const normalizedArticles = Number.isFinite(parsedLimit) && parsedLimit > 0
    ? articles.slice(0, parsedLimit)
    : articles;

  return {
    articles: normalizedArticles,
  };
});
