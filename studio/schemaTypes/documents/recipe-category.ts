import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons'

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
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc) => {
          const title = doc?.title as Array<{language?: string; value?: string}> | undefined
          return (
            title?.find((entry) => entry.language === 'en-US')?.value ?? title?.[0]?.value ?? ''
          )
        },
      },
    }),
  ],
  preview: {
    select: {title: 'title'},
    prepare({title}) {
      const label = Array.isArray(title)
        ? (title.find((entry: {language?: string}) => entry.language === 'en-US')?.value ??
          title[0]?.value)
        : title
      return {title: label ?? 'Category'}
    },
  },
})
