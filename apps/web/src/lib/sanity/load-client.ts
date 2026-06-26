import {createClient} from '@sanity/client'

export function getSanityClient() {
  const projectId =
    import.meta.env.PUBLIC_SANITY_PROJECT_ID ??
    import.meta.env.SANITY_STUDIO_PROJECT_ID ??
    process.env.PUBLIC_SANITY_PROJECT_ID ??
    process.env.SANITY_STUDIO_PROJECT_ID

  const dataset =
    import.meta.env.PUBLIC_SANITY_DATASET ??
    import.meta.env.SANITY_STUDIO_DATASET ??
    process.env.PUBLIC_SANITY_DATASET ??
    process.env.SANITY_STUDIO_DATASET ??
    'production'

  if (!projectId) {
    throw new Error('Missing Sanity project ID. Set PUBLIC_SANITY_PROJECT_ID in .env')
  }

  return createClient({
    projectId,
    dataset,
    useCdn: true,
    apiVersion: '2025-01-01',
  })
}
