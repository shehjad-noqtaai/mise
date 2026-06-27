import {defineField, defineType} from 'sanity'
import {CalendarIcon} from '@sanity/icons'

export const mealPlanEntry = defineType({
  name: 'mealPlanEntry',
  title: 'Meal Plan Entry',
  type: 'document',
  icon: CalendarIcon,
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
    }),
  ],
  preview: {
    select: {
      date: 'date',
      mealType: 'mealType',
      recipeTitle: 'recipe.title',
      label: 'label',
      language: 'language',
    },
    prepare({date, mealType, recipeTitle, label, language}) {
      return {
        title: recipeTitle ?? label ?? 'Meal',
        subtitle: [language?.toUpperCase(), date, mealType].filter(Boolean).join(' · '),
      }
    },
  },
})
