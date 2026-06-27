import {defineQuery} from 'groq'

/** Resolve a field-level internationalized string for the active locale. */
const localizedString = (fieldPath: string) =>
  `coalesce(${fieldPath}[language == $locale][0].value, ${fieldPath}[language == "en-US"][0].value, ${fieldPath}[0].value, ${fieldPath})`

/** After `[]->`, GROQ requires a projection object — not a bare function call. */
const localizedStringFromRef = (fieldPath: string) =>
  `{ "value": ${localizedString(fieldPath)} }.value`

export const HOME_PAGE_QUERY = defineQuery(`*[_type == "homePage" && language == $locale][0]{
  title,
  greeting,
  subtitle,
  quickActionLabels,
  mealsToday[]{
    _key,
    date,
    mealType,
    label,
    "recipeTitle": recipe->title,
    "recipeSlug": recipe->slug.current
  },
  featuredRecipes[]->{
    _id,
    title,
    slug,
    summary,
    prepTimeMinutes,
    cookTimeMinutes,
    heroImage
  }
}`)

export const RECIPES_QUERY = defineQuery(`*[
  _type == "recipe" &&
  language == $locale &&
  ($cuisine == "" || $cuisine in categories[]->slug.current) &&
  ($course == "" || $course in categories[]->slug.current)
] | order(title asc) {
  _id,
  title,
  slug,
  summary,
  prepTimeMinutes,
  cookTimeMinutes,
  servings,
  heroImage,
  tags,
  "categories": categories[]->${localizedStringFromRef('title')}
}`)

export const RECIPE_CATEGORIES_QUERY = defineQuery(`*[
  _type == "recipeCategory" &&
  kind in $kinds &&
  defined(slug.current)
] | order(kind asc, coalesce(sortOrder, 999) asc) {
  kind,
  "slug": slug.current,
  "title": ${localizedString('title')}
}`)

export const RECIPE_BY_SLUG_QUERY =
  defineQuery(`*[_type == "recipe" && language == $locale && slug.current == $slug][0]{
  _id,
  title,
  slug,
  summary,
  prepTimeMinutes,
  cookTimeMinutes,
  servings,
  heroImage,
  tags,
  nutrition,
  ingredients[]{
    _key,
    quantity,
    unit,
    note,
    "ingredientName": ${localizedString('ingredient->name')}
  },
  steps[]{
    _key,
    instruction,
    durationMinutes,
    tip
  },
  "categories": categories[]->${localizedStringFromRef('title')}
}`)

export const PANTRY_SNAPSHOT_QUERY =
  defineQuery(`*[_type == "pantrySnapshot" && language == $locale][0]{
  title,
  description,
  items[]{
    _key,
    quantity,
    capacity,
    unit,
    location,
    expiresAt,
    "ingredientName": ${localizedString('ingredient->name')},
    "categoryTitle": ${localizedString('category->title')}
  }
}`)

export const RECIPE_TRANSLATIONS_QUERY =
  defineQuery(`*[_type == "translation.metadata" && references($recipeId)][0]{
  translations[]{
    _key,
    "slug": value->slug.current,
    "language": value->language,
    "title": value->title
  }
}`)

export const RECIPE_SLUGS_QUERY = defineQuery(`*[_type == "recipe" && defined(slug.current)]{
  "locale": language,
  "slug": slug.current
}`)
