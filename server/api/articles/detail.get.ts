import { getArchiveArticleBySlug } from "../../utils/articles";

export default defineEventHandler(async (event) => {
  const slug = getQuery(event).slug;

  if (typeof slug !== "string" || !slug.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing article slug",
    });
  }

  const article = await getArchiveArticleBySlug(slug.trim());

  if (!article) {
    throw createError({
      statusCode: 404,
      statusMessage: "Article not found",
    });
  }

  return {
    article,
  };
});
