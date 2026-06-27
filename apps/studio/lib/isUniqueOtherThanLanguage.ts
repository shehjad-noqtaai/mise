import {getPublishedId} from 'sanity'
import type {SlugValidationContext} from 'sanity'

/**
 * Custom slug uniqueness check that scopes uniqueness to the same language.
 * This allows translated documents to share the same slug across different languages.
 *
 * Uses `getPublishedId` + `sanity::versionOf` so release/draft versions of the
 * current document are excluded (required for Content Releases).
 *
 * @see https://github.com/sanity-io/document-internationalization/blob/main/docs/05-allowing-the-same-slug-for-translations.md
 */
export async function isUniqueOtherThanLanguage(slug: string, context: SlugValidationContext) {
  const {document, getClient} = context
  if (!document?.language || !document._id) {
    return true
  }
  const client = getClient({apiVersion: '2025-02-19'})
  const publishedId = getPublishedId(document._id)
  const params = {
    publishedId,
    language: document.language,
    slug,
    docType: document._type,
  }
  const query = `!defined(*[
    _type == $docType &&
    !(sanity::versionOf($publishedId)) &&
    slug.current == $slug &&
    language == $language
  ][0]._id)`
  const result = await client.fetch(query, params, {tag: 'validation.slug-unique'})
  return result
}
