import {defineArrayMember, defineField, defineType} from 'sanity'
import {pickInternationalizedValue} from '../../lib/internationalizedValue'

export const recipeIngredientLine = defineType({
  name: 'recipeIngredientLine',
  title: 'Ingredient Line',
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
      title: 'Quantity',
      type: 'number',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'unit',
      title: 'Unit',
      type: 'string',
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'string',
      description: 'Optional prep note, e.g. "finely chopped"',
    }),
  ],
  preview: {
    select: {
      quantity: 'quantity',
      unit: 'unit',
      ingredientName: 'ingredient.name',
      locale: '^language',
    },
    prepare({quantity, unit, ingredientName, locale}) {
      const name = pickInternationalizedValue(ingredientName, locale ?? 'en-US') ?? 'Ingredient'
      return {
        title: [quantity, unit, name].filter(Boolean).join(' ').trim() || 'Ingredient',
      }
    },
  },
})

export const recipeIngredientLineMember = defineArrayMember({type: 'recipeIngredientLine'})
