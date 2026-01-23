// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // 这里放原来 schema 里的 url
    url: env("DATABASE_URL"),
  },
});
