import {defineArrayMember, defineField, defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons'
import {mealPlanEntryMember} from '../objects/meal-plan-entry'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Dashboard Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'greeting',
      title: 'Greeting Change only dev',
      type: 'string',
    }),
    defineField({
      name: 'newField',
      title: 'New Field Only Dev',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'mealsToday',
      title: 'Meals Today',
      type: 'array',
      of: [mealPlanEntryMember],
    }),
    defineField({
      name: 'featuredRecipes',
      title: 'Featured Recipes',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'recipe'}]})],
    }),
    defineField({
      name: 'quickActionLabels',
      title: 'Quick Action Labels',
      type: 'object',
      fields: [
        defineField({name: 'logMeal', title: 'Log a Meal', type: 'string'}),
        defineField({name: 'newRecipe', title: 'New Recipe', type: 'string'}),
        defineField({name: 'addToPantry', title: 'Add to Pantry', type: 'string'}),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', language: 'language'},
    prepare({title, language}) {
      return {title: title ?? 'Home Page', subtitle: language?.toUpperCase()}
    },
  },
})
