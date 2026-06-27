import {getRelativeLocaleUrl} from 'astro:i18n'
import type {Locale} from './i18n'

export type RecipeFilters = {
  cuisine?: string
  course?: string
}

export function parseRecipeFilters(searchParams: URLSearchParams): RecipeFilters {
  const cuisine = searchParams.get('cuisine') ?? undefined
  const course = searchParams.get('course') ?? undefined
  return {
    ...(cuisine ? {cuisine} : {}),
    ...(course ? {course} : {}),
  }
}

export function recipeDirectoryUrl(locale: Locale, filters: RecipeFilters = {}) {
  const params = new URLSearchParams()
  if (filters.cuisine) params.set('cuisine', filters.cuisine)
  if (filters.course) params.set('course', filters.course)
  const query = params.toString()
  const path = query ? `recipes/?${query}` : 'recipes/'
  return getRelativeLocaleUrl(locale, path)
}

export function clearRecipeFilter(
  current: RecipeFilters,
  key: keyof RecipeFilters,
): RecipeFilters {
  const next = {...current}
  delete next[key]
  return next
}

/** Toggle a filter value on or off while preserving the other dimension. */
export function toggleRecipeFilter(
  current: RecipeFilters,
  key: keyof RecipeFilters,
  slug: string,
): RecipeFilters {
  const next = {...current}
  if (next[key] === slug) {
    delete next[key]
  } else {
    next[key] = slug
  }
  return next
}

export const filterGroupLabels: Record<
  Locale,
  {cuisine: string; course: string; all: string; empty: string}
> = {
  'en-US': {
    cuisine: 'Cuisine',
    course: 'Course',
    all: 'All',
    empty: 'No recipes match these filters.',
  },
  'hi-IN': {
    cuisine: 'व्यंजन',
    course: 'कोर्स',
    all: 'सभी',
    empty: 'इन फ़िल्टर से कोई रेसिपी नहीं मिली।',
  },
}
