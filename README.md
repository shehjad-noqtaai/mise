# Mise

Kitchen operating system monorepo: **Sanity Studio v6**, **Astro 7** frontend on **Cloudflare Workers**, and **AI-powered localization** (en-US + hi-IN).

## Stack

| Workspace                      | Description                                        |
| ------------------------------ | -------------------------------------------------- |
| `apps/studio/`                 | Sanity Studio v6 with Mise content schemas         |
| `apps/web/`                    | Astro frontend (Cloudflare Workers)                |
| `packages/l10n/`               | Agentic translation plugin, glossary, style guides |
| `packages/design-tokens/`      | Sage & Stone design tokens from `docs/DESIGN.md`   |
| `functions/`                   | Stale translation detection (Sanity Functions)     |
| `apps/translations-dashboard/` | Translation coverage dashboard                     |

## Prerequisites

- Node.js >= 22.12
- pnpm 10.x
- Sanity account ([sanity.io/manage](https://www.sanity.io/manage))

## Sanity project

- Organization: [ofsMxPwd5](https://www.sanity.io/organizations/ofsMxPwd5)
- Project: **Mise Kitchen OS** (`1rkupi9j`)
- Dataset: `production` (public read for Astro static build)
- Hosted Studio: https://mise-kitchen-os.sanity.studio/

Copy `.env.example` to `.env` and set your project ID, or run:

```bash
cd apps/studio
pnpm exec sanity projects create "Mise Kitchen OS" --organization=ofsMxPwd5 --yes --json
pnpm exec sanity dataset create production --visibility public
```

## Setup

1. Copy env and link a Sanity project:

```bash
cp .env.example .env
# Add SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET
```

2. Install and bootstrap:

```bash
pnpm install
pnpm bootstrap
```

Bootstrap deploys blueprint, schema (via hosted Studio deploy), seeds locales (`en-US`, `hi-IN`), and imports sample Mise content.

> **Schema deploy:** `sanity schemas deploy` may abort on some Node/macOS setups. Use `pnpm --filter studio run schema:deploy` (runs `sanity deploy`) which deploys schema + Studio to https://mise-kitchen-os.sanity.studio/.

3. Start development:

```bash
pnpm dev
```

- Studio: http://localhost:3333
- Translations dashboard: http://localhost:3334
- Web: http://localhost:4321

## Localization

- Document-level i18n: `recipe`, `homePage`, `mealPlanEntry`, `pantrySnapshot`
- Field-level i18n: `ingredient`, `recipeCategory`, `pantryCategory`
- Hindi style guide + culinary glossary seeded in sample data
- Translate drafts via Studio translation pane or Agent API (`client.agent.action.translate`)

Add a locale: create `l10n.locale` doc → seed style guide → add to Astro `i18n.locales` → bulk translate.

## Deploy

**Production** (`mise-web` → https://mise-web.shehjkhan.workers.dev):

```bash
pnpm --filter web build && pnpm --filter web deploy
```

**Dev** (`mise-web-dev` → https://mise-web-dev.shehjkhan.workers.dev):

```bash
pnpm --filter web build && pnpm --filter web deploy:dev
```

Studio (production hostname):

```bash
pnpm --filter studio exec sanity deploy
```

GitHub Actions workflow: `.github/workflows/deploy.yml`

| Branch / trigger        | Deploys                                     |
| ----------------------- | ------------------------------------------- |
| Push to `main`          | Production web + Studio (when paths match)  |
| Push to `develop`       | Dev web worker only (when web paths match)  |
| Manual **Run workflow** | Choose production, dev, or both web workers |

### GitHub Actions deploy config

**Production** uses the **Production** environment. **Dev web** uses the **Development** environment. Add values under **Settings → Secrets and variables → Actions → Environments** (not repository-level secrets).

| Name                       | Type     | Used by              | Value                                                           |
| -------------------------- | -------- | -------------------- | --------------------------------------------------------------- |
| `SANITY_STUDIO_PROJECT_ID` | Variable | web, web-dev, studio | `1rkupi9j`                                                      |
| `SANITY_STUDIO_DATASET`    | Variable | web, web-dev, studio | `production` (or a dev dataset on **Development**)              |
| `CLOUDFLARE_ACCOUNT_ID`    | Variable | web, web-dev         | Cloudflare account ID                                           |
| `SANITY_AUTH_TOKEN`        | Secret   | studio               | [sanity.io/manage](https://www.sanity.io/manage) → API → Tokens |
| `CLOUDFLARE_API_TOKEN`     | Secret   | web, web-dev         | See [Cloudflare API token](#cloudflare-api-token) below         |
| `SANITY_API_READ_TOKEN`    | Secret   | web, web-dev (opt.)  | Read token for Presentation / draft mode                        |

Public URLs are set in the workflow file — not secrets:

- Production preview: `https://mise-web.shehjkhan.workers.dev`
- Dev preview: `https://mise-web-dev.shehjkhan.workers.dev`
- Studio: `https://mise-kitchen-os.sanity.studio`

#### Cloudflare API token

Create a **new** token — error `9109` / `10000` means the token is invalid, revoked, or missing permissions.

1. Open [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) → **Create Token**
2. Use **Edit Cloudflare Workers** template, or create a custom token with:
   - **Account** → **Workers Scripts** → **Edit** (covers deploy and `wrangler secret put`)
   - Restrict to your account (ID `f5f04e77078fe4d629e5f5ed929bc9d9`)
3. Copy the token once — paste into GitHub **Production** secret `CLOUDFLARE_API_TOKEN` with **no trailing newline or spaces**
4. Verify locally before pushing:

```bash
export CLOUDFLARE_API_TOKEN="paste-token-here"
export CLOUDFLARE_ACCOUNT_ID="f5f04e77078fe4d629e5f5ed929bc9d9"
pnpm --filter web exec wrangler whoami
pnpm --filter web build && pnpm --filter web exec wrangler deploy --config dist/server/wrangler.json
```

If local deploy works but CI fails, re-save the GitHub secret — a bad paste is the most common cause.

## Design

See [`docs/DESIGN.md`](docs/DESIGN.md) and stitch mocks in [`docs/stitch_mise_kitchen_operating_system/`](docs/stitch_mise_kitchen_operating_system/).
