// https://nuxt.com/docs/api/configuration/nuxt-config
import Unocss from "unocss/vite";

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
  ],
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
      name: "AppStore",
      short_name: "AppStore",
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
});
