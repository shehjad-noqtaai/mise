import type {ClientPerspective, QueryParams} from '@sanity/client'
import {getSecret} from 'astro:env/server'
import {sanityClient} from 'sanity:client'

function parsePerspective(raw: string | undefined): ClientPerspective | undefined {
  if (!raw) return undefined
  const decoded = decodeURIComponent(raw)
  if (decoded.startsWith('[')) {
    try {
      return JSON.parse(decoded) as ClientPerspective
    } catch {
      return undefined
    }
  }
  return decoded as ClientPerspective
}

export async function loadQuery<QueryResponse>({
  query,
  params,
  perspectiveCookie = undefined,
}: {
  query: string
  params?: QueryParams
  perspectiveCookie?: string | undefined
}) {
  const draftMode = perspectiveCookie ? true : false
  const token = getSecret('SANITY_API_READ_TOKEN')
  if (draftMode && !token) {
    throw new Error(
      'The `SANITY_API_READ_TOKEN` environment variable is required during Visual Editing.',
    )
  }

  const perspective: ClientPerspective = draftMode
    ? (parsePerspective(perspectiveCookie) ?? 'drafts')
    : 'published'

  const client = draftMode ? sanityClient.withConfig({useCdn: false, token}) : sanityClient

  const {result, resultSourceMap} = await client.fetch<QueryResponse>(query, params ?? {}, {
    filterResponse: false,
    perspective,
    resultSourceMap: draftMode ? 'withKeyArraySelector' : false,
    stega: draftMode,
  })

  return {
    data: result,
    sourceMap: resultSourceMap,
    perspective,
    draftMode,
  }
}
