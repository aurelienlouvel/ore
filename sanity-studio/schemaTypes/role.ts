import {defineField, defineType} from 'sanity'

export const roleType = defineType({
  name: 'role',
  title: 'Role',
  type: 'document',
  preview: {
    select: {title: 'name', subtitle: 'color'},
  },
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Emoji or icon name',
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      description: 'Hex color (e.g. #FF5733)',
      validation: (Rule) =>
        Rule.regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
          name: 'hex color',
          invert: false,
        }).warning('Should be a valid hex color'),
    }),
  ],
})
