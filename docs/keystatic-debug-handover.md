# Keystatic Debug Handover

**Date:** 2026-08-13 — **RESOLVED**  
**Situation:** ~~Keystatic CMS is fully integrated and deployed, but the `/keystatic` login flow returns HTTP 500.~~

**OAuth login is working.** See resolution below.

---

## Resolution (2026-08-13)

**Root cause:** `context.locals.runtime` is defined via `Object.defineProperty` with `configurable: false, writable: false` (non-configurable data property). A JavaScript Proxy **cannot** return a different value for such a property — the engine throws a TypeError invariant violation. That's why the Proxy approach failed.

**Fix:** The runtime shim object at `locals.runtime` has a throwing `env` getter defined in an object literal — those are `configurable: true` by default. So we can patch just the getter:

```typescript
const runtime = (context.locals as any).runtime;
if (runtime && typeof runtime === 'object') {
  Object.defineProperty(runtime, 'env', {
    get: () => e,  // e = cfEnv from cloudflare:workers
    configurable: true,
  });
}
```

Also pass `clientId`/`clientSecret`/`secret` directly to `makeHandler` as belt-and-suspenders.

Confirmed working: `GET /api/keystatic/github/login` returns 307 → GitHub OAuth. Full login flow tested.

---

## What's working

- Keystatic is installed and built into the site (`@keystatic/astro@5.2.0`, `@keystatic/core@0.6.5`)
- The GitHub App is created and installed on `bitsloppy/sackar-atlas`
- Env vars are deployed to the Cloudflare Worker (see below)
- The `/keystatic` page loads and shows "Log in via GitHub"
- The 500 only happens when you click that button (the OAuth flow at `/api/keystatic/github/oauth/authorize`)

---

## The root cause

`@astrojs/cloudflare` v14 (Astro v7) **removed** `context.locals.runtime.env`. It now **throws** a hard error when accessed. Keystatic v0.6.5 reads from `context.locals.runtime.env` to get its env vars. The throw causes the 500.

The error message (from `site/node_modules/@astrojs/cloudflare/dist/utils/cf-helpers.js`):
> "Astro.locals.runtime.env has been removed in Astro v6. Use `import { env } from 'cloudflare:workers'` instead."

---

## What we tried (last attempt — close but not working)

A custom API route at `site/src/pages/api/keystatic/[...params].ts` that:
1. Imports `env` from `cloudflare:workers` (static import — confirmed in compiled bundle)
2. Proxies `context.locals.runtime` to return `{ env: cfEnv }` safely
3. Passes the patched context to `makeHandler`

The compiled bundle (`site/dist/server/chunks/_.._DsWNlkFh.mjs`) looks correct. Still 500. We don't know if `env` from `cloudflare:workers` is actually being populated, or if there's another error happening.

---

## Most likely next steps (try in order)

### 1. ~~Upgrade Keystatic~~ — Already tried, v0.6.5 IS latest
Keystatic hasn't released an Astro v7-compatible version yet. Skip this.

### 2. (START HERE) Pass env vars explicitly to makeHandler
Instead of patching the context, pass the vars directly:

```typescript
// site/src/pages/api/keystatic/[...params].ts
import type { APIContext } from 'astro';
import { makeHandler } from '@keystatic/astro/api';
// @ts-ignore
import config from 'virtual:keystatic-config';
// @ts-ignore
import { env } from 'cloudflare:workers';

export const prerender = false;

export const ALL = async (context: APIContext) => {
  const handler = makeHandler({
    config,
    clientId: (env as any).KEYSTATIC_GITHUB_CLIENT_ID,
    clientSecret: (env as any).KEYSTATIC_GITHUB_CLIENT_SECRET,
    secret: (env as any).KEYSTATIC_SECRET,
  });
  return handler(context);
};
```

This bypasses `context.locals.runtime.env` entirely — if `_config.clientId` is provided, Keystatic never reads from `context.locals`.

### 3. Add a debug endpoint to verify env vars are accessible
```typescript
// site/src/pages/api/debug-env.ts (TEMP — remove after testing)
// @ts-ignore
import { env } from 'cloudflare:workers';
export const GET = () => new Response(JSON.stringify({
  hasClientId: !!(env as any).KEYSTATIC_GITHUB_CLIENT_ID,
  hasClientSecret: !!(env as any).KEYSTATIC_GITHUB_CLIENT_SECRET,
  hasSecret: !!(env as any).KEYSTATIC_SECRET,
  hasSlug: !!(env as any).PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
}));
export const prerender = false;
```
Deploy and hit `/api/debug-env` to confirm the vars are actually there.

---

## Env vars — where they live

| Var | Value | Where |
|---|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | `Iv23liEzLlXB3JL9B5wN` | Baked into wrangler.json at deploy (via GitHub Actions script) |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | `sackar-atlas-cms` | Same |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | (secret) | GitHub Actions secret → `wrangler secret put` at deploy |
| `KEYSTATIC_SECRET` | (secret) | Same |

All four are also in `site/.env` locally.

GitHub secrets are in the `bitsloppy/sackar-atlas` repo → Settings → Secrets and variables → Actions.

---

## GitHub App

- **Name:** sackar-atlas-cms
- **Slug:** `sackar-atlas-cms`
- **Installed on:** `bitsloppy/sackar-atlas`
- **Callback URL:** `https://sackar-atlas.soft-hill-5225.workers.dev/api/keystatic/github/oauth/callback`
- **Permissions:** Repository contents (read/write), Metadata (read)

To add the future prod domain: GitHub App settings → add `https://sackar-atlas.bitsloppy.com/api/keystatic/github/oauth/callback` as a second callback URL.

---

## Key files changed this session

- `site/src/pages/api/keystatic/[...params].ts` — custom API route shim (the attempted fix)
- `site/astro.config.mjs` — Keystatic integration + Vite config for CJS compat
- `site/keystatic.config.ts` — CMS schema (collections + singletons)
- `.github/workflows/deploy.yml` — injects env vars at deploy time
- `wrangler.toml` — non-sensitive vars (but NOT used in actual deploy — the adapter generates its own wrangler.json)
- `docs/keystatic-setup.md` — setup guide + at-launch checklist

---

## Dev mode note

`/keystatic` does NOT work in local dev. The `@astrojs/cloudflare` adapter's workerd emulation has CJS compatibility issues with several Keystatic dependencies. Fixes were attempted but not completed. Use the deployed site for all Keystatic access.

---

## Deployed site

`https://sackar-atlas.soft-hill-5225.workers.dev`
