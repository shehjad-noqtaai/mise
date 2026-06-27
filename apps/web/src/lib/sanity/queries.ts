import {defineQuery} from 'groq'

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

export const RECIPES_QUERY = defineQuery(`*[_type == "recipe" && language == $locale] | order(title asc) {
  _id,
  title,
  slug,
  summary,
  prepTimeMinutes,
  cookTimeMinutes,
  servings,
  heroImage,
  tags,
  "categories": categories[]->title
}`)

export const RECIPE_BY_SLUG_QUERY = defineQuery(`*[_type == "recipe" && language == $locale && slug.current == $slug][0]{
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
    "ingredientName": ingredient->name
  },
  steps[]{
    _key,
    instruction,
    durationMinutes,
    tip
  },
  "categories": categories[]->title
}`)

export const PANTRY_SNAPSHOT_QUERY = defineQuery(`*[_type == "pantrySnapshot" && language == $locale][0]{
  title,
  description,
  items[]{
    _key,
    quantity,
    capacity,
    unit,
    location,
    expiresAt,
    "ingredientName": ingredient->name,
    "categoryTitle": category->title
  }
}`)

export const RECIPE_TRANSLATIONS_QUERY = defineQuery(`*[_type == "translation.metadata" && references($recipeId)][0]{
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
