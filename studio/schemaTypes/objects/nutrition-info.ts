import {defineField, defineType} from 'sanity'

export const nutritionInfo = defineType({
  name: 'nutritionInfo',
  title: 'Nutrition Info',
  type: 'object',
  fields: [
    defineField({name: 'calories', title: 'Calories', type: 'number'}),
    defineField({name: 'protein', title: 'Protein (g)', type: 'number'}),
    defineField({name: 'carbs', title: 'Carbs (g)', type: 'number'}),
    defineField({name: 'fat', title: 'Fat (g)', type: 'number'}),
    defineField({name: 'fiber', title: 'Fiber (g)', type: 'number'}),
  ],
})
