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
// @ts-ignore — cloudflare:workers is available in the deployed Worker bundle
import { env as cfEnvStatic } from 'cloudflare:workers';

export const prerender = false;

const handler = makeHandler({ config });

export const ALL = async (context: APIContext) => {
  const cfEnv = cfEnvStatic as Record<string, string | undefined>;

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
