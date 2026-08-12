# Keystatic CMS — Setup Guide

Keystatic is already installed and configured. This one-time setup connects it to GitHub so you can edit content from any browser (including the deployed site).

---

## Step 1 — Run the dev server and create the GitHub App

```bash
cd ~/code/sackar-atlas/site
npm run dev
```

Visit **http://localhost:4321/keystatic**

You'll see a "Connect with GitHub" prompt.

1. Click **Connect with GitHub**
2. Click **Create GitHub App**
3. Give it a name — `Sackar Atlas CMS` works fine
4. On the next screen, grant it access to **bitsloppy/sackar-atlas** (not all repos)
5. GitHub redirects back to `/keystatic` — you're now in GitHub mode

Keystatic automatically writes four env vars to `site/.env`:
```
KEYSTATIC_GITHUB_CLIENT_ID=...
KEYSTATIC_GITHUB_CLIENT_SECRET=...
KEYSTATIC_SECRET=...
PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=sackar-atlas-cms
```

---

## Step 2 — Add env vars to the deployed Worker

The live site (`sackar-atlas.soft-hill-5225.workers.dev`) also needs these vars.

### Option A — Cloudflare dashboard (easier)

1. Go to **Cloudflare dashboard → Workers & Pages → sackar-atlas**
2. Click **Settings → Variables and Secrets**
3. Add each variable:
   - `KEYSTATIC_GITHUB_CLIENT_ID` → type: **Variable** (not secret)
   - `KEYSTATIC_GITHUB_CLIENT_SECRET` → type: **Secret** (encrypted)
   - `KEYSTATIC_SECRET` → type: **Secret** (encrypted)
   - `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` → type: **Variable**
4. Click **Save and deploy**

### Option B — Wrangler CLI

```bash
wrangler secret put KEYSTATIC_GITHUB_CLIENT_SECRET
wrangler secret put KEYSTATIC_SECRET
```

For the non-secret vars, add them to `wrangler.toml`:
```toml
[vars]
KEYSTATIC_GITHUB_CLIENT_ID = "your-client-id"
PUBLIC_KEYSTATIC_GITHUB_APP_SLUG = "sackar-atlas-cms"
```

---

## Step 3 — Add the public slug to wrangler.toml

Open `wrangler.toml` (repo root) and add a `[vars]` section:

```toml
name = "sackar-atlas"
compatibility_date = "2025-07-19"
compatibility_flags = ["nodejs_compat"]
main = "./site/dist/_worker.js"

[assets]
directory = "./site/dist"

[vars]
PUBLIC_KEYSTATIC_GITHUB_APP_SLUG = "sackar-atlas-cms"
KEYSTATIC_GITHUB_CLIENT_ID = "your-client-id-from-env"
```

Replace the values with what's in `site/.env` after Step 1.

---

## Step 4 — Commit and deploy

```bash
cd ~/code/sackar-atlas
git add wrangler.toml
git commit -m "chore: add Keystatic public env vars to wrangler.toml"
git push origin main
```

GitHub Actions builds and deploys (~30s).

After deploy, visit **https://sackar-atlas.soft-hill-5225.workers.dev/keystatic** — log in with your GitHub account and you're in.

---

## What you can edit in Keystatic

| Section | What's editable |
|---|---|
| **Home page** | Hero body text |
| **About the data** | "What this is", "How sources are prepared", "How to use" prose |
| **AI use** | All prose (What AI did, didn't do, uncertainty table) |
| **Cases** | Narrative prose body, published flag, key fields |
| **Locations** | Narrative prose body, key fields |
| **Events** | Narrative prose body, date, event type |
| **People** | Narrative prose body, role, key fields |

### What stays in code (edit via VS Code / GitHub)

- Sources table on the About page (the 7-source table with download links)
- Site-wide layout, navigation, footer
- Complex relational fields (manner_findings, police_investigations, etc.)
- Testimonies, recommendations, source_collections collections

---

## Troubleshooting

**"The redirect_uri is not associated with this application"**
This means the GitHub App's callback URL doesn't match. Go to:
- GitHub → Settings → Developer settings → GitHub Apps → Sackar Atlas CMS → App settings
- Under "Callback URL", add: `https://sackar-atlas.soft-hill-5225.workers.dev/api/keystatic/github/oauth/callback`

**Keystatic opens but shows "local mode" — no GitHub branch switcher**
The `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` env var isn't set. Check `site/.env` and restart `npm run dev`.

**Build error: "Cannot find module @keystatic/core"**
Run `npm install` in the `site/` directory.
