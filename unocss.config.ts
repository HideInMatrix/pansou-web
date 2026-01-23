// unocss.config.ts
import presetWind from "@unocss/preset-wind4";
import { defineConfig } from "unocss";
import presetAnimations from "unocss-preset-animations";
import { presetShadcn } from "unocss-preset-shadcn";
import { presetRemToPx } from "@unocss/preset-rem-to-px";

export default defineConfig({
  presets: [
    presetRemToPx(),
    presetWind(),
    presetAnimations(),
    presetShadcn(
      {
        color: "green",
      },
      {
        globals: true,
      }
    ),
  ],
  // By default, `.ts` and `.js` files are NOT extracted.
  // If you want to extract them, use the following configuration.
  // It's necessary to add the following configuration if you use shadcn-vue or shadcn-svelte.
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // include js/ts files
        "(components|src)/**/*.{js,ts}",
      ],
    },
  },
});
