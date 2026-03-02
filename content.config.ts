import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    articles: defineCollection({
      type: "page",
      source: {
        include: "articles/**/*.md",
        prefix: "/archives",
      },
      schema: z.object({
        title: z.string(),
        id: z.string(),
        date: z.string().optional(),
        auther: z.string().optional(),
        author: z.string().optional(),
        cover: z.string().optional(),
        excerpt: z.string().optional(),
        permalink: z.string().optional(),
        categories: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
      }),
    }),
  },
});
