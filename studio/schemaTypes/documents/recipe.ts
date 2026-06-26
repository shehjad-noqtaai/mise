import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'
import {isUniqueOtherThanLanguage} from '../../lib/isUniqueOtherThanLanguage'
import {recipeIngredientLineMember} from '../objects/recipe-ingredient-line'
import {recipeStepMember} from '../objects/recipe-step'

export const recipe = defineType({
  name: 'recipe',
  title: 'Recipe',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', isUnique: isUniqueOtherThanLanguage},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'prepTimeMinutes',
      title: 'Prep Time (minutes)',
      type: 'number',
    }),
    defineField({
      name: 'cookTimeMinutes',
      title: 'Cook Time (minutes)',
      type: 'number',
    }),
    defineField({
      name: 'servings',
      title: 'Servings',
      type: 'number',
      validation: (rule) => rule.positive(),
    }),
    defineField({
      name: 'ingredients',
      title: 'Ingredients',
      type: 'array',
      of: [recipeIngredientLineMember],
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [recipeStepMember],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'nutrition',
      title: 'Nutrition',
      type: 'nutritionInfo',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'recipeCategory'}]})],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  orderings: [
    {title: 'Title, A–Z', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
    {
      title: 'Cook Time, Short',
      name: 'cookTimeAsc',
      by: [{field: 'cookTimeMinutes', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'title', media: 'heroImage', summary: 'summary'},
    prepare({title, media, summary}) {
      return {title, media, subtitle: summary}
    },
  },
})
