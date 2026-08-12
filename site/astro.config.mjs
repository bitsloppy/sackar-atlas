// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  integrations: [react(), markdoc(), keystatic()],
  vite: {
    ssr: {
      noExternal: ['@keystatic/core', '@keystatic/astro'],
      resolve: {
        conditions: ['workerd', 'worker', 'node'],
      },
    },
    resolve: {
      alias: process.env.NODE_ENV === 'production'
        ? { 'react-dom/server': 'react-dom/server.edge' }
        : {},
    },
  },
});
