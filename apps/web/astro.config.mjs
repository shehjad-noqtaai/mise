// @ts-check
import {defineConfig} from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import sanity from '@sanity/astro'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.PUBLIC_SANITY_PROJECT_ID ?? ''
const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.PUBLIC_SANITY_DATASET ?? 'production'

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
