/**
 * Flatten field-level internationalizedArray values to plain strings/text.
 * Removes fieldTranslation.metadata documents (no longer used).
 *
 * Run: pnpm --filter studio migrate-field-i18n-to-plain
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({useCdn: false})

const SKIP_TYPES = new Set([
  'translation.metadata',
  'fieldTranslation.metadata',
  'ingredient',
  'recipeCategory',
  'pantryCategory',
])

const I18N_VALUE_TYPES = new Set([
  'internationalizedArrayStringValue',
  'internationalizedArrayTextValue',
])

type I18nEntry = {
  _type?: string
  _key?: string
  language?: string
  value?: string
}

function isI18nArray(value: unknown): value is I18nEntry[] {
  if (!Array.isArray(value) || value.length === 0) return false
  return value.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      typeof item._type === 'string' &&
      I18N_VALUE_TYPES.has(item._type),
  )
}

function pickString(entries: I18nEntry[], preferredLocale?: string): string | undefined {
  if (preferredLocale) {
    const match = entries.find(
      (entry) => entry.language === preferredLocale || entry._key === preferredLocale,
    )
    if (match?.value != null) return match.value
  }

  const en = entries.find((entry) => entry.language === 'en-US' || entry._key === 'en-US')
  if (en?.value != null) return en.value

  return entries[0]?.value
}

function flattenValue(value: unknown, preferredLocale?: string): unknown {
  if (isI18nArray(value)) {
    return pickString(value, preferredLocale) ?? ''
  }

  if (Array.isArray(value)) {
    return value.map((item) => flattenValue(item, preferredLocale))
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if ('_ref' in obj) return value

    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(obj)) {
      out[key] = flattenValue(val, preferredLocale)
    }
    return out
  }

  return value
}

function needsFlattening(value: unknown): boolean {
  if (isI18nArray(value)) return true
  if (Array.isArray(value)) return value.some(needsFlattening)
  if (value && typeof value === 'object' && !('_ref' in value)) {
    return Object.values(value as Record<string, unknown>).some(needsFlattening)
  }
  return false
}

function flattenDocument(doc: Record<string, unknown>): Record<string, unknown> {
  const preferredLocale = typeof doc.language === 'string' ? doc.language : 'en-US'
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(doc)) {
    if (key.startsWith('_') && key !== '_key') {
      result[key] = value
      continue
    }
    result[key] = flattenValue(value, preferredLocale)
  }

  return result
}

const docs = await client.fetch<Array<Record<string, unknown>>>(
  `*[
    !(_id in path("_.**")) &&
    !(_id in path("drafts.**")) &&
    !(_type in $skipTypes)
  ]`,
  {skipTypes: [...SKIP_TYPES]},
)

let migrated = 0

for (const doc of docs) {
  if (!needsFlattening(doc)) continue

  const next = flattenDocument(doc)
  const patch = client.patch(doc._id as string)

  for (const [key, value] of Object.entries(next)) {
    if (key.startsWith('_') && key !== '_key') continue
    if (JSON.stringify(doc[key]) !== JSON.stringify(value)) {
      patch.set({[key]: value})
    }
  }

  await patch.commit()
  migrated++
  console.log(`Flattened ${doc._id}`)
}

const fieldMetadataIds = await client.fetch<string[]>(`*[_type == "fieldTranslation.metadata"]._id`)

for (const id of fieldMetadataIds) {
  await client.delete(id)
  console.log(`Deleted ${id}`)
}

console.log(
  `Done. Flattened ${migrated} document(s), deleted ${fieldMetadataIds.length} fieldTranslation.metadata document(s).`,
)
