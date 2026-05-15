import {defineField, defineType} from 'sanity'

export const contractTypeType = defineType({
  name: 'contractType',
  title: 'Contract type',
  type: 'document',
  preview: {
    select: {name: 'name'},
    prepare({name}: {name?: string}) {
      return {title: name ?? 'Untitled contract type'}
    },
  },
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
})
