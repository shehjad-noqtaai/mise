import {defineArrayMember, defineField, defineType} from 'sanity'

export const mealPlanEntryObject = defineType({
  name: 'mealPlanEntryObject',
  title: 'Meal Plan Entry',
  type: 'object',
  fields: [
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mealType',
      title: 'Meal Type',
      type: 'string',
      options: {
        list: [
          {title: 'Breakfast', value: 'breakfast'},
          {title: 'Lunch', value: 'lunch'},
          {title: 'Dinner', value: 'dinner'},
          {title: 'Snack', value: 'snack'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'recipe',
      title: 'Recipe',
      type: 'reference',
      to: [{type: 'recipe'}],
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Display label when no recipe is linked',
    }),
  ],
  preview: {
    select: {
      date: 'date',
      mealType: 'mealType',
      recipeTitle: 'recipe.title',
      label: 'label',
    },
    prepare({date, mealType, recipeTitle, label}) {
      return {
        title: recipeTitle ?? label ?? 'Meal',
        subtitle: [date, mealType].filter(Boolean).join(' · '),
      }
    },
  },
})

export const mealPlanEntryMember = defineArrayMember({type: 'mealPlanEntryObject'})
