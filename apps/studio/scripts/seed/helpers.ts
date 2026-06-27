import {getPublishedId, type Reference} from 'sanity'

export function ref(id: string) {
  return {_type: 'reference', _ref: getPublishedId(id)} satisfies Reference
}

export function weakRef(id: string, type: string) {
  return {
    _type: 'reference',
    _ref: getPublishedId(id),
    _weak: true,
    _strengthenOnPublish: {type},
  } satisfies Reference
}

/** v5 internationalizedArray string entry for seed/bootstrap data. */
export function i18nString(en: string, hi: string) {
  return [
    {
      _type: 'internationalizedArrayStringValue' as const,
      _key: 'en-US',
      language: 'en-US',
      value: en,
    },
    {
      _type: 'internationalizedArrayStringValue' as const,
      _key: 'hi-IN',
      language: 'hi-IN',
      value: hi,
    },
  ]
}

/** v5 translation.metadata entry — language field + strong reference. */
export function translationMetadataEntry(language: string, documentId: string) {
  return {
    _key: language,
    _type: 'internationalizedArrayReferenceValue' as const,
    language,
    value: ref(documentId),
  }
}
