/**
 * Custom Keystatic API route — overrides the integration-injected one.
 *
 * @astrojs/cloudflare v14 removed context.locals.runtime.env (it now throws).
 * Keystatic v0.6.5 still reads from context.locals.runtime.env before it
 * checks the config object, so even passing vars directly doesn't skip the
 * throw.
 *
 * Root cause: @astrojs/cloudflare defines locals.runtime as a non-configurable,
 * non-writable data property (Object.defineProperty with no configurable/writable).
 * A Proxy can't return a different value for such a property — the engine throws
 * a TypeError invariant violation. So a proxy of context.locals doesn't work.
 *
 * Fix: the shim object at locals.runtime has a throwing `env` getter defined in
 * an object literal, which IS configurable. Redefine just that getter before
 * calling the handler so Keystatic reads cfEnv instead of throwing.
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

  // Patch the runtime shim so Keystatic reads cfEnv instead of throwing.
  // locals.runtime itself is non-configurable (can't reassign), but the
  // shim's .env getter is configurable (object literal default).
  try {
    const runtime = (context.locals as any).runtime;
    if (runtime && typeof runtime === 'object') {
      Object.defineProperty(runtime, 'env', {
        get: () => e,
        configurable: true,
      });
    }
  } catch {
    // If patching fails for any reason, we still try via direct vars below.
  }

  const handler = makeHandler({
    config,
    clientId: e.KEYSTATIC_GITHUB_CLIENT_ID,
    clientSecret: e.KEYSTATIC_GITHUB_CLIENT_SECRET,
    secret: e.KEYSTATIC_SECRET,
  });
  return handler(context);
};
