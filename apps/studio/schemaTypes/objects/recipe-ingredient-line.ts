import {defineArrayMember, defineField, defineType} from 'sanity'

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
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'internationalizedArrayString',
      description: 'Optional prep note, e.g. "finely chopped"',
    }),
  ],
  preview: {
    select: {
      quantity: 'quantity',
      ingredientName: 'ingredient.name',
    },
    prepare({quantity, ingredientName}) {
      return {
        title: `${quantity ?? ''} ${ingredientName ?? 'Ingredient'}`.trim(),
      }
    },
  },
})

export const recipeIngredientLineMember = defineArrayMember({type: 'recipeIngredientLine'})
