// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
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
      alias: [
        // @astrojs/markdoc/* is imported by .mdoc files processed outside the
        // Vite root (data/pages/*.mdoc). Rolldown can't walk up to site/node_modules
        // from there, so we pin the whole package to its absolute node_modules path.
        {
          find: '@astrojs/markdoc/components',
          replacement: fileURLToPath(new URL('./node_modules/@astrojs/markdoc/components/index.ts', import.meta.url)),
        },
        {
          find: '@astrojs/markdoc/runtime',
          replacement: fileURLToPath(new URL('./node_modules/@astrojs/markdoc/dist/runtime.js', import.meta.url)),
        },
        {
          find: '@astrojs/markdoc/runtime-assets-config',
          replacement: fileURLToPath(new URL('./node_modules/@astrojs/markdoc/dist/runtime-assets-config.js', import.meta.url)),
        },
        ...(process.env.NODE_ENV === 'production'
          ? [{ find: 'react-dom/server', replacement: 'react-dom/server.edge' }]
          : []),
      ],
    },
  },
});
