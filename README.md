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

```bash
pnpm --filter web build && pnpm --filter web exec wrangler deploy --config dist/server/wrangler.json
pnpm --filter studio exec sanity deploy
```

GitHub Actions workflow: `.github/workflows/deploy.yml`

### GitHub Actions secrets

Add these under **Settings → Secrets and variables → Actions** in the repo ([run #11 failed](https://github.com/shehjad-noqtaai/mise/actions/runs/28277473622) because they were missing):

| Secret                     | Used by        | Value                                                           |
| -------------------------- | -------------- | --------------------------------------------------------------- |
| `SANITY_STUDIO_PROJECT_ID` | web, studio    | `1rkupi9j`                                                      |
| `SANITY_STUDIO_DATASET`    | web, studio    | `production`                                                    |
| `SANITY_AUTH_TOKEN`        | studio         | [sanity.io/manage](https://www.sanity.io/manage) → API → Tokens |
| `CLOUDFLARE_API_TOKEN`     | web            | Workers deploy token                                            |
| `CLOUDFLARE_ACCOUNT_ID`    | web            | Cloudflare account ID                                           |
| `SANITY_API_READ_TOKEN`    | web (optional) | Read token for Presentation / draft mode                        |

Public URLs (`SANITY_STUDIO_PREVIEW_URL`, `SANITY_STUDIO_URL`) are set in the workflow file — not secrets.

## Design

See [`docs/DESIGN.md`](docs/DESIGN.md) and stitch mocks in [`docs/stitch_mise_kitchen_operating_system/`](docs/stitch_mise_kitchen_operating_system/).
