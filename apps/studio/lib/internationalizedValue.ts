type InternationalizedEntry = {
  _type?: string
  _key?: string
  language?: string
  value?: string
}

const I18N_VALUE_TYPES = new Set([
  'internationalizedArrayStringValue',
  'internationalizedArrayTextValue',
])

export function isInternationalizedArray(value: unknown): value is InternationalizedEntry[] {
  if (!Array.isArray(value) || value.length === 0) return false
  return value.every(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      typeof entry._type === 'string' &&
      I18N_VALUE_TYPES.has(entry._type),
  )
}

/** Pick a localized string from an internationalized array or plain string. */
export function pickInternationalizedValue(
  value: InternationalizedEntry[] | string | null | undefined,
  locale = 'en-US',
  fallback = 'en-US',
): string | undefined {
  if (typeof value === 'string') return value || undefined
  if (!isInternationalizedArray(value)) return undefined

  const match = value.find((entry) => entry.language === locale || entry._key === locale)
  if (match?.value != null) return match.value

  const fallbackEntry = value.find(
    (entry) => entry.language === fallback || entry._key === fallback,
  )
  if (fallbackEntry?.value != null) return fallbackEntry.value

  return value[0]?.value
}

export function prepareInternationalizedPreview(
  value: InternationalizedEntry[] | string | null | undefined,
  fallbackLabel: string,
  locale = 'en-US',
) {
  return {
    title: pickInternationalizedValue(value, locale) ?? fallbackLabel,
  }
}
