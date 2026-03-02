// https://nuxt.com/docs/api/configuration/nuxt-config
import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import Unocss from "unocss/vite";

const FRONTMATTER_BLOCK_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

function extractFrontmatterValue(frontmatter: string, key: string): string | undefined {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  if (!match) {
    return undefined;
  }

  const rawValue = match.at(1);
  if (typeof rawValue !== "string") {
    return undefined;
  }

  const value = rawValue.trim().replace(/^['"]|['"]$/g, "");
  return value || undefined;
}

async function getMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        return getMarkdownFiles(fullPath);
      }
      return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
    }),
  );

  return files.flat();
}

async function buildArticleSitemapUrls() {
  const articlesDir = join(process.cwd(), "content", "articles");
  const markdownFiles = await getMarkdownFiles(articlesDir).catch(() => []);
  const locSet = new Set<string>();
  const urls: string[] = [];

  for (const filePath of markdownFiles) {
    const raw = await readFile(filePath, "utf-8");
    const frontmatter = raw.match(FRONTMATTER_BLOCK_RE)?.[1] ?? "";
    const permalink = extractFrontmatterValue(frontmatter, "permalink");

    const fallbackPath = `/archives/${basename(filePath, ".md")}`;
    const loc = permalink ? (permalink.startsWith("/") ? permalink : `/${permalink}`) : fallbackPath;

    if (locSet.has(loc)) {
      continue;
    }

    urls.push(loc);
    locSet.add(loc);
  }

  return urls;
}

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["@unocss/reset/normalize.css"],
  devServer: {
    port: 3002,
  },
  modules: [
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "nuxt-auth-utils",
    "shadcn-nuxt",
    "@unocss/nuxt",
    "@nuxtjs/color-mode",
    "@element-plus/nuxt",
    "@vite-pwa/nuxt",
    "@pinia/nuxt",
    "@nuxtjs/sitemap",
    "@nuxt/content",
  ],
  content: {
    // Runtime: use WASM-based PGlite to avoid native binary dependency (better-sqlite3).
    database: {
      type: "pglite",
    },
    // Build/dev local cache DB: use Node native sqlite connector on Node >= 22.5.
    experimental: {
      sqliteConnector: "native",
    },
  },
  image: {
    domains: ["pan.micromatrix.org"],
  },
  runtimeConfig: {
    public: {
      adminEmail: process.env.NUXT_PUBLIC_ADMIN_EMAIL,
      password: process.env.NUXT_PUBLIC_PASSWORD,
    },
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || "",
    },
  },
  nitro: {
    esbuild: {
      options: {
        target: "esnext",
      },
    },
    prerender: {
      routes: [],
      crawlLinks: false,
    },
  },
  imports: {
    autoImport: true,
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./app/components/ui",
  },
  colorMode: {
    classSuffix: "",
  },
  build: {
    transpile: ["shadcn-vue"],
  },

  vite: {
    plugins: [Unocss()],
    resolve: {
      alias: {
        ".prisma/client/index-browser":
          "./node_modules/@prisma/client/index-browser.js",
      },
    },
  },
  routeRules: {
    "/api/upload/**": {
      proxy: {
        to: "https://pan.micromatrix.org/api/**",
      },
    },
  },
  pwa: {
    registerType: "autoUpdate",
    devOptions: {
      enabled: false,
    },
    manifest: {
      name: "PanSou",
      short_name: "PanSou",
      theme_color: "#ffffff",
      icons: [
        {
          src: "favicon.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    workbox: {
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: "CacheFirst",
          options: {
            cacheName: "image-cache",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
            },
          },
        },
      ],
    },
    experimental: {
      enableWorkboxPayloadQueryParams: true,
    },
  },

  app: {
    head: {
      link: [
        {
          rel: "manifest",
          href: "/manifest.json",
        },
        { rel: "icon", type: "image/png", href: "/favicon.png" },
      ],
    },
  },
  sitemap: {
    urls: async () => {
      return buildArticleSitemapUrls();
    },
  },
});
