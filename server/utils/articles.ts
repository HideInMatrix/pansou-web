import { parseMarkdown } from "@nuxtjs/mdc/runtime";
import { Prisma } from "~~/generated/prisma/client";
import prisma from "./db";

interface ArticleSummaryRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  readTimeMinutes: number;
  publishedAt: Date;
}

interface ArticleDetailRow extends ArticleSummaryRow {
  content: string;
  updatedAt: Date;
}

interface ArticleTagRow {
  articleId: string;
  id: string;
  slug: string;
  name: string;
}

export interface ArchiveArticleTag {
  id: string;
  slug: string;
  name: string;
}

export interface ArchiveArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  readTimeMinutes: number;
  publishedAt: Date;
  tags: ArchiveArticleTag[];
}

export interface ArchiveArticleDetail extends ArchiveArticleSummary {
  updatedAt: Date;
  body: Record<string, unknown>;
}

function createTagMap(tagRows: ArticleTagRow[]) {
  const tagsByArticleId = new Map<string, ArchiveArticleTag[]>();

  for (const tagRow of tagRows) {
    const articleTags = tagsByArticleId.get(tagRow.articleId) ?? [];
    articleTags.push({
      id: tagRow.id,
      slug: tagRow.slug,
      name: tagRow.name,
    });
    tagsByArticleId.set(tagRow.articleId, articleTags);
  }

  return tagsByArticleId;
}

async function fetchTagsForArticleIds(articleIds: string[]) {
  if (articleIds.length === 0) {
    return new Map<string, ArchiveArticleTag[]>();
  }

  const tagRows = await prisma.$queryRaw<ArticleTagRow[]>`
    SELECT
      at."articleId" AS "articleId",
      t.id,
      t.slug,
      t.name
    FROM "ArticleTag" at
    INNER JOIN "Tag" t ON t.id = at."tagId"
    WHERE at."articleId" IN (${Prisma.join(articleIds)})
    ORDER BY at."articleId" ASC, t.name ASC
  `;

  return createTagMap(tagRows);
}

export async function listArchiveArticles(): Promise<ArchiveArticleSummary[]> {
  const articleRows = await prisma.$queryRaw<ArticleSummaryRow[]>`
    SELECT
      a.id,
      a.slug,
      a.title,
      a.excerpt,
      a.category,
      a."authorName" AS "authorName",
      a."readTimeMinutes" AS "readTimeMinutes",
      a."publishedAt" AS "publishedAt"
    FROM "Article" a
    ORDER BY a."publishedAt" DESC, a."createdAt" DESC
  `;

  const tagsByArticleId = await fetchTagsForArticleIds(articleRows.map((article) => article.id));

  return articleRows.map((article) => ({
    ...article,
    tags: tagsByArticleId.get(article.id) ?? [],
  }));
}

export async function getArchiveArticleBySlug(slug: string): Promise<ArchiveArticleDetail | null> {
  const articleRows = await prisma.$queryRaw<ArticleDetailRow[]>`
    SELECT
      a.id,
      a.slug,
      a.title,
      a.excerpt,
      a.content,
      a.category,
      a."authorName" AS "authorName",
      a."readTimeMinutes" AS "readTimeMinutes",
      a."publishedAt" AS "publishedAt",
      a."updatedAt" AS "updatedAt"
    FROM "Article" a
    WHERE a.slug = ${slug}
    LIMIT 1
  `;

  const article = articleRows[0];
  if (!article) {
    return null;
  }

  const tagsByArticleId = await fetchTagsForArticleIds([article.id]);
  const parsedMarkdown = await parseMarkdown(article.content);

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    authorName: article.authorName,
    readTimeMinutes: article.readTimeMinutes,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    tags: tagsByArticleId.get(article.id) ?? [],
    body: parsedMarkdown.body as Record<string, unknown>,
  };
}
