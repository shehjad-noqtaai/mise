/**
 * Assign cuisine/course/style categories to recipes in production.
 * Uses slug-based mappings for known recipes and title heuristics for the rest.
 *
 * Run: pnpm --filter studio migrate-recipe-categories
 */
import {getCliClient} from 'sanity/cli'
import {ref} from './seed/helpers.ts'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({useCdn: false})

/** Category refs by slug — applied per recipe slug (language-agnostic). */
const categoriesBySlug: Record<string, string[]> = {
  'classic-chicken-biryani': ['category-indian', 'category-main-course', 'category-comfort'],
  'herbed-lentil-stew': ['category-comfort', 'category-main-course'],
  'garlic-butter-pasta': ['category-italian', 'category-main-course', 'category-comfort'],
  'cheese-cake': ['category-dessert', 'category-comfort'],
  'cheesecake': ['category-dessert', 'category-comfort'],
}

function inferCategories(title: string, slug: string, tags: string[] = []) {
  const haystack = `${title} ${slug} ${tags.join(' ')}`.toLowerCase()

  const categories = new Set<string>()

  if (/biryani|curry|dal|lentil|masala|tikka|naan|basmati/.test(haystack)) {
    categories.add('category-indian')
  }
  if (/pasta|spaghetti|risotto|parmesan|italian|marinara|carbonara/.test(haystack)) {
    categories.add('category-italian')
  }

  if (/cake|cheesecake|cookie|brownie|dessert|pie|tart|pudding|ice cream|sweet/.test(haystack)) {
    categories.add('category-dessert')
  } else if (/salad|bread|dip|side|appetizer|starter|snack/.test(haystack)) {
    categories.add('category-side')
  } else {
    categories.add('category-main-course')
  }

  if (/comfort|stew|one-pot|weekend|family|butter/.test(haystack)) {
    categories.add('category-comfort')
  }

  return [...categories]
}

function toCategoryRefs(ids: string[]) {
  return ids.map((id) => ref(id))
}

type RecipeDoc = {
  _id: string
  title?: string
  slug?: {current?: string}
  tags?: string[]
  categories?: Array<{_ref?: string}>
}

const recipes = await client.fetch<RecipeDoc[]>(
  `*[_type == "recipe" && !(_id in path("drafts.**"))]{
    _id,
    title,
    slug,
    tags,
    "categories": categories[]._ref
  }`,
)

let updated = 0
let skipped = 0

for (const recipe of recipes) {
  const slug = recipe.slug?.current
  if (!slug) {
    skipped++
    continue
  }

  const mapped = categoriesBySlug[slug]
  const categoryIds = mapped ?? inferCategories(recipe.title ?? '', slug, recipe.tags ?? [])
  const nextRefs = toCategoryRefs(categoryIds)
  const currentRefs = (recipe.categories ?? []).slice().sort()
  const nextSorted = categoryIds.slice().sort()

  if (JSON.stringify(currentRefs) === JSON.stringify(nextSorted)) {
    skipped++
    continue
  }

  await client.patch(recipe._id).set({categories: nextRefs}).commit()
  updated++
  console.log(`Updated ${recipe._id} (${slug}) → ${categoryIds.join(', ')}`)
}

console.log(`Done. Updated ${updated} recipe(s), skipped ${skipped}.`)
