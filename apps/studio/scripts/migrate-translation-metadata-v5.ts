/**
 * Normalize translation.metadata documents to v5 format with strong references.
 *
 * Run: pnpm --filter studio migrate-translation-metadata
 */
import {getCliClient} from 'sanity/cli'
import {
  normalizeTranslationMetadataItems,
  translationMetadataNeedsNormalization,
  type TranslationMetadataItem,
} from '../lib/translation-metadata.ts'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({useCdn: false})

const docs = await client.fetch<
  Array<{_id: string; translations?: TranslationMetadataItem[]}>
>(`*[_type == "translation.metadata"]{_id, translations}`)

let migrated = 0

for (const doc of docs) {
  const translations = doc.translations
  if (!translationMetadataNeedsNormalization(translations)) continue

  const nextTranslations = normalizeTranslationMetadataItems(translations)

  await client.patch(doc._id).set({translations: nextTranslations}).commit()
  migrated++
  console.log(`Normalized ${doc._id}`)
}

console.log(`Done. Updated ${migrated} translation.metadata document(s).`)
