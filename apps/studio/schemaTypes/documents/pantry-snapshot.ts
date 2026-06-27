import {defineField, defineType} from 'sanity'
import {StackCompactIcon} from '@sanity/icons'
import {pantryItemMember} from '../objects/pantry-item'

export const pantrySnapshot = defineType({
  name: 'pantrySnapshot',
  title: 'Pantry Snapshot',
  type: 'document',
  icon: StackCompactIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [pantryItemMember],
    }),
  ],
  preview: {
    select: {title: 'title', language: 'language', count: 'items'},
    prepare({title, language, count}) {
      return {
        title: title ?? 'Pantry',
        subtitle: [language?.toUpperCase(), count?.length ? `${count.length} items` : undefined]
          .filter(Boolean)
          .join(' · '),
      }
    },
  },
})
