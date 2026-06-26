import {defineArrayMember, defineField, defineType} from 'sanity'

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
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'internationalizedArrayString',
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
    },
    prepare({quantity, capacity, ingredientName}) {
      return {
        title: ingredientName ?? 'Pantry item',
        subtitle: capacity ? `${quantity ?? 0} / ${capacity}` : undefined,
      }
    },
  },
})

export const pantryItemMember = defineArrayMember({type: 'pantryItem'})
