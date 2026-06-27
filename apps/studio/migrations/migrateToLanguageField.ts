import {at, defineMigration, set} from 'sanity/migrate'
import {
  normalizeTranslationMetadataItems,
  translationMetadataNeedsNormalization,
  type TranslationMetadataItem,
} from '../lib/translation-metadata.ts'

/**
 * Migrates translation.metadata `translations[]` to v5 (language field) and
 * replaces weak references with strong refs for liveEdit metadata documents.
 */
export default defineMigration({
  title: 'Migrate translation.metadata translations to v5 language field',
  documentTypes: ['translation.metadata'],
  migrate: {
    document(doc) {
      const translations = doc.translations as TranslationMetadataItem[] | undefined
      if (!translationMetadataNeedsNormalization(translations)) return

      return at('translations', set(normalizeTranslationMetadataItems(translations)))
    },
  },
})
