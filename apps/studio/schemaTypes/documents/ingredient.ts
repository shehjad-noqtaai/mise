import {defineField, defineType} from 'sanity'
import {BasketIcon} from '@sanity/icons'
import {pickInternationalizedValue} from '../../lib/internationalizedValue'

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
      return {
        title: pickInternationalizedValue(name, 'en-US') ?? 'Ingredient',
      }
    },
  },
})
