import {defineArrayMember, defineField, defineType} from 'sanity'
import {pickInternationalizedValue} from '../../lib/internationalizedValue'

export const pantryItem = defineType({
  name: 'pantryItem',
  title: 'Pantry Item',
  type: 'object',
  fields: [
    defineField({
      name: 'ingredient',
      title: 'Ingredient',
      type: 'reference',
      to: [{type: 'ingredient'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'quantity',
      title: 'Current Quantity',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'capacity',
      title: 'Capacity',
      type: 'number',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'unit',
      title: 'Unit',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires At',
      type: 'date',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'pantryCategory'}],
    }),
  ],
  preview: {
    select: {
      quantity: 'quantity',
      capacity: 'capacity',
      ingredientName: 'ingredient.name',
      locale: '^language',
    },
    prepare({quantity, capacity, ingredientName, locale}) {
      return {
        title: pickInternationalizedValue(ingredientName, locale ?? 'en-US') ?? 'Pantry item',
        subtitle: capacity ? `${quantity ?? 0} / ${capacity}` : undefined,
      }
    },
  },
})

export const pantryItemMember = defineArrayMember({type: 'pantryItem'})
