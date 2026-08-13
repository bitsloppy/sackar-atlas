/**
 * TEMP debug endpoint — verify Cloudflare env vars are reachable.
 * DELETE this file after Keystatic OAuth is confirmed working.
 *
 * Usage: GET /api/debug-env
 */
// @ts-ignore — cloudflare:workers available in the deployed Worker bundle
import { env } from 'cloudflare:workers';

export const prerender = false;

export const GET = () => {
  const e = env as Record<string, string | undefined>;
  return new Response(
    JSON.stringify({
      hasClientId: !!e.KEYSTATIC_GITHUB_CLIENT_ID,
      hasClientSecret: !!e.KEYSTATIC_GITHUB_CLIENT_SECRET,
      hasSecret: !!e.KEYSTATIC_SECRET,
      hasSlug: !!e.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
    }),
    { headers: { 'content-type': 'application/json' } },
  );
};
