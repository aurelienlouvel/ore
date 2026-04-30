import {defineField, defineType} from 'sanity'

export const organisationType = defineType({
  name: 'organisation',
  title: 'Organisation',
  type: 'document',
  preview: {
    select: {title: 'name', media: 'logo'},
  },
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Website URL',
      type: 'url',
    }),
  ],
})
