/**
 * Restore field-level internationalizedArray values on shared taxonomy documents.
 * Uses seed data for known demo documents; unknown docs get en-US only.
 *
 * Run: pnpm --filter studio migrate-taxonomy-to-field-i18n
 */
import {getCliClient} from 'sanity/cli'
import {getPublishedId} from 'sanity'
import {
  ingredients,
  pantryCategories,
  recipeCategories,
} from './seed/mise-data.ts'
import {isInternationalizedArray} from '../lib/internationalizedValue'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({useCdn: false})

const TAXONOMY_TYPES = ['ingredient', 'recipeCategory', 'pantryCategory'] as const

const seedById = new Map(
  [...ingredients, ...recipeCategories, ...pantryCategories].map((doc) => [doc._id, doc]),
)

const FIELD_MAP: Record<(typeof TAXONOMY_TYPES)[number], readonly string[]> = {
  ingredient: ['name', 'defaultUnit'],
  recipeCategory: ['title'],
  pantryCategory: ['title'],
}

function resolveFieldValue(
  docId: string,
  field: string,
  current: unknown,
): unknown {
  if (isInternationalizedArray(current)) return current

  const seed = seedById.get(getPublishedId(docId))
  const seedValue = seed?.[field as keyof typeof seed]
  if (isInternationalizedArray(seedValue)) return seedValue

  if (typeof current !== 'string') return current

  return [
    {
      _type: 'internationalizedArrayStringValue',
      _key: 'en-US',
      language: 'en-US',
      value: current,
    },
  ]
}

const docs = await client.fetch<Array<Record<string, unknown>>>(
  `*[_type in $types && !(_id in path("_.**")) && !(_id in path("drafts.**"))]`,
  {types: [...TAXONOMY_TYPES]},
)

let migrated = 0

for (const doc of docs) {
  const docId = doc._id as string
  const type = doc._type as (typeof TAXONOMY_TYPES)[number]
  const fields = FIELD_MAP[type]
  const patch = client.patch(docId)
  let changed = false

  for (const field of fields) {
    const next = resolveFieldValue(docId, field, doc[field])
    if (JSON.stringify(doc[field]) !== JSON.stringify(next)) {
      patch.set({[field]: next})
      changed = true
    }
  }

  if (!changed) continue

  await patch.commit()
  migrated++
  console.log(`Restored field i18n on ${docId}`)
}

console.log(`Done. Updated ${migrated} taxonomy document(s).`)
