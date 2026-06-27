import {getPublishedId} from 'sanity'

export type TranslationMetadataItem = {
  _key?: string
  _type?: string
  language?: string
  value?: {
    _ref?: string
    _type?: string
    _weak?: boolean
    _strengthenOnPublish?: {type?: string}
  }
}

/**
 * Normalizes a translation.metadata `translations[]` entry to v5 format.
 * Uses strong references — weak refs trigger OptimisticallyStrengthen patches
 * that fail on liveEdit (read-only) metadata documents.
 */
export function normalizeTranslationMetadataItem(
  item: TranslationMetadataItem,
): TranslationMetadataItem {
  const language = item.language ?? item._key
  if (!language || !item.value?._ref) {
    return item
  }

  return {
    _key: item._key ?? language,
    _type: 'internationalizedArrayReferenceValue',
    language,
    value: {
      _type: 'reference',
      _ref: getPublishedId(item.value._ref),
    },
  }
}

export function normalizeTranslationMetadataItems(
  items: TranslationMetadataItem[] | undefined,
): TranslationMetadataItem[] | undefined {
  if (!Array.isArray(items)) return items
  return items.map(normalizeTranslationMetadataItem)
}

export function translationMetadataNeedsNormalization(
  items: TranslationMetadataItem[] | undefined,
): boolean {
  if (!Array.isArray(items)) return false
  return items.some((item) => {
    const normalized = normalizeTranslationMetadataItem(item)
    return JSON.stringify(item) !== JSON.stringify(normalized)
  })
}
