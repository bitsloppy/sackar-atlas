/**
 * Custom Keystatic API route — overrides the integration-injected one.
 *
 * @astrojs/cloudflare v14 removed context.locals.runtime.env (it now throws).
 * Keystatic v0.6.5 still reads from it, so every OAuth request 500s.
 *
 * Fix: proxy the context to intercept locals.runtime.env and return the
 * Cloudflare env from the cloudflare:workers module instead.
 */
import type { APIContext } from 'astro';
import { makeHandler } from '@keystatic/astro/api';
// @ts-ignore — virtual module resolved by the Keystatic Vite plugin
import config from 'virtual:keystatic-config';

export const prerender = false;

const handler = makeHandler({ config });

export const ALL = async (context: APIContext) => {
  // Read Cloudflare env vars from the Workers runtime module.
  // Falls back to an empty object in non-Cloudflare environments.
  let cfEnv: Record<string, string | undefined> = {};
  try {
    // @ts-ignore — cloudflare:workers is available in the deployed Worker
    const m = await import('cloudflare:workers');
    cfEnv = m.env as Record<string, string | undefined>;
  } catch {
    // Local dev or non-Cloudflare environment
  }

  // Proxy the context so that context.locals.runtime.env returns cfEnv
  // instead of throwing. Keystatic reads clientId/clientSecret/secret from here.
  const patchedLocals = new Proxy(context.locals as object, {
    get(target, prop) {
      if (prop === 'runtime') {
        return { env: cfEnv };
      }
      return Reflect.get(target, prop, target);
    },
  });

  const patchedContext = new Proxy(context, {
    get(target, prop) {
      if (prop === 'locals') return patchedLocals;
      return Reflect.get(target, prop, target);
    },
  });

  return handler(patchedContext as APIContext);
};
