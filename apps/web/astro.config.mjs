// @ts-check
import {defineConfig} from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import sanity from '@sanity/astro'
import {fileURLToPath} from 'node:url'
import {dirname, resolve} from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '../..')

// Monorepo .env lives at repo root (see vite.envDir below).
for (const dir of [repoRoot, __dirname]) {
  for (const suffix of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(resolve(dir, suffix))
    } catch {}
  }
}

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.PUBLIC_SANITY_PROJECT_ID ?? ''
const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.PUBLIC_SANITY_DATASET ?? 'production'

if (!projectId) {
  throw new Error(
    'Missing Sanity project ID. Set SANITY_STUDIO_PROJECT_ID or PUBLIC_SANITY_PROJECT_ID in the repo root .env',
  )
}

/** @type {import('astro').AstroUserConfig} */
export default defineConfig({
  output: 'static',
  adapter: cloudflare({
    imageService: 'cloudflare',
  }),
  integrations: [
    sanity({
      projectId,
      dataset,
      useCdn: true,
      apiVersion: '2025-01-01',
    }),
  ],
  i18n: {
    defaultLocale: 'en-US',
    locales: ['en-US', 'hi-IN'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  vite: {
    envDir: '../../',
  },
})
