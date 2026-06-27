/**
 * Set `kind` and `sortOrder` on recipe categories and create missing course categories.
 *
 * Run: pnpm --filter studio migrate-recipe-category-kinds
 */
import {getCliClient} from 'sanity/cli'
import {getPublishedId} from 'sanity'
import {recipeCategories} from './seed/mise-data.ts'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({useCdn: false})

const seedById = new Map(recipeCategories.map((doc) => [doc._id, doc]))

const existingIds = await client.fetch<string[]>(`*[_type == "recipeCategory"]._id`)

let created = 0
let updated = 0

for (const doc of recipeCategories) {
  if (existingIds.includes(doc._id)) continue
  await client.createOrReplace(doc)
  created++
  console.log(`Created ${doc._id}`)
}

for (const id of existingIds) {
  const seed = seedById.get(getPublishedId(id))
  if (!seed) continue

  const patch: Record<string, unknown> = {}
  if (seed.kind) patch.kind = seed.kind
  if (seed.sortOrder != null) patch.sortOrder = seed.sortOrder

  if (Object.keys(patch).length === 0) continue

  await client.patch(id).set(patch).commit()
  updated++
  console.log(`Updated ${id}`)
}

console.log(`Done. Created ${created}, updated ${updated} recipe category document(s).`)
