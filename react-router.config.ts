import type { Config } from "@react-router/dev/config";

export default {
  // enable SPA mode for Cloudflare Pages
  ssr: false,

  // build for static hosting
  buildDirectory: "build",
} satisfies Config;
