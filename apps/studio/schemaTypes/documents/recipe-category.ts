import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons'
import {pickInternationalizedValue} from '../../lib/internationalizedValue'

export const recipeCategoryKinds = [
  {title: 'Cuisine', value: 'cuisine'},
  {title: 'Course', value: 'course'},
  {title: 'Style', value: 'style'},
] as const

export type RecipeCategoryKind = (typeof recipeCategoryKinds)[number]['value']

export const recipeCategory = defineType({
  name: 'recipeCategory',
  title: 'Recipe Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: {
        list: [...recipeCategoryKinds],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
      initialValue: 'cuisine',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Controls filter chip order within a kind group.',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc) => {
          const title = doc?.title as Array<{language?: string; value?: string}> | undefined
          return pickInternationalizedValue(title, 'en-US') ?? ''
        },
      },
    }),
  ],
  orderings: [
    {
      title: 'Kind, Sort Order',
      name: 'kindSortOrder',
      by: [
        {field: 'kind', direction: 'asc'},
        {field: 'sortOrder', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {title: 'title', kind: 'kind'},
    prepare({title, kind}) {
      const label = pickInternationalizedValue(title, 'en-US') ?? 'Category'
      return {
        title: label,
        subtitle: kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : undefined,
      }
    },
  },
})
