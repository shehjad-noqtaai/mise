import {defineArrayMember, defineField, defineType} from 'sanity'

export const recipeStep = defineType({
  name: 'recipeStep',
  title: 'Recipe Step',
  type: 'object',
  fields: [
    defineField({
      name: 'instruction',
      title: 'Instruction',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Duration (minutes)',
      type: 'number',
    }),
    defineField({
      name: 'tip',
      title: 'Tip',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {instruction: 'instruction'},
    prepare({instruction}) {
      return {title: instruction?.slice(0, 80) ?? 'Step'}
    },
  },
})

export const recipeStepMember = defineArrayMember({type: 'recipeStep'})
