import {defineField, defineType} from 'sanity'
import {ComponentIcon} from '@sanity/icons'

export const pantryCategory = defineType({
  name: 'pantryCategory',
  title: 'Pantry Category',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
    }),
  ],
  preview: {
    select: {title: 'title'},
    prepare({title}) {
      const label = Array.isArray(title)
        ? (title.find((entry: {language?: string}) => entry.language === 'en-US')?.value ??
          title[0]?.value)
        : title
      return {title: label ?? 'Pantry category'}
    },
  },
})
