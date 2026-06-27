import {defineField, defineType} from 'sanity'
import {ComponentIcon} from '@sanity/icons'
import {pickInternationalizedValue} from '../../lib/internationalizedValue'

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
      return {
        title: pickInternationalizedValue(title, 'en-US') ?? 'Pantry category',
      }
    },
  },
})
