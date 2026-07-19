import { defineConfig } from 'astro/config';

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  // site: 'https://your-domain.com' — set this when you have a domain
  output: 'static',

  adapter: cloudflare()
});