/**
 * Custom Keystatic API route — overrides the integration-injected one.
 *
 * @astrojs/cloudflare v14 removed context.locals.runtime.env (it now throws).
 * Keystatic v0.6.5 still reads from it, so every OAuth request 500s.
 *
 * Fix: pass env vars directly to makeHandler so Keystatic never touches
 * context.locals.runtime.env at all.
 */
import type { APIContext } from 'astro';
import { makeHandler } from '@keystatic/astro/api';
// @ts-ignore — virtual module resolved by the Keystatic Vite plugin
import config from 'virtual:keystatic-config';
// @ts-ignore — cloudflare:workers is available in the deployed Worker bundle
import { env as cfEnv } from 'cloudflare:workers';

export const prerender = false;

export const ALL = async (context: APIContext) => {
  const e = cfEnv as Record<string, string | undefined>;
  const handler = makeHandler({
    config,
    clientId: e.KEYSTATIC_GITHUB_CLIENT_ID,
    clientSecret: e.KEYSTATIC_GITHUB_CLIENT_SECRET,
    secret: e.KEYSTATIC_SECRET,
  });
  return handler(context);
};
