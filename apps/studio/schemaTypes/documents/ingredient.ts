import {defineField, defineType} from 'sanity'
import {BasketIcon} from '@sanity/icons'

export const ingredient = defineType({
  name: 'ingredient',
  title: 'Ingredient',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'defaultUnit',
      title: 'Default Unit',
      type: 'internationalizedArrayString',
    }),
  ],
  preview: {
    select: {name: 'name'},
    prepare({name}) {
      const title = Array.isArray(name)
        ? (name.find((entry: {language?: string}) => entry.language === 'en-US')?.value ??
          name[0]?.value)
        : name
      return {title: title ?? 'Ingredient'}
    },
  },
})
