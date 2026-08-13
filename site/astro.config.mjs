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
    // Pre-bundle CJS deps used by Keystatic so the workerd runner gets ESM.
    // The cloudflare adapter merges this into its SSR environment optimizeDeps.include.
    optimizeDeps: {
      // Pre-bundle CJS/module-condition deps so the workerd runner gets ESM.
      // Cloudflare adapter merges this list into its SSR env optimizeDeps.include.
      // emery + @braintree/sanitize-url are pulled in by @keystatic/core worker chunks.
      include: [
        'set-cookie-parser',
        '@braintree/sanitize-url',
        'emery',
        'emery/assertions',
        '@markdoc/markdoc',
      ],
    },
    ssr: {
      noExternal: ['@keystatic/core', '@keystatic/astro'],
      resolve: {
        // Drop 'node' — Keystatic's exports map lists 'node' before 'worker', so
        // keeping 'node' causes it to load keystatic-core-*.node.js (node:fs etc.).
        // Keep 'module' — emery uses { "module": "...esm.js", "default": "...cjs.js" };
        // without 'module' it falls to CJS.
        conditions: ['workerd', 'worker', 'module'],
      },
    },
    resolve: {
      alias: process.env.NODE_ENV === 'production'
        ? { 'react-dom/server': 'react-dom/server.edge' }
        : {},
    },
  },
});
