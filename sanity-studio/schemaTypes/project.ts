import {defineField, defineType} from 'sanity'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      media: 'thumbnail',
    },
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'file',
      options: {accept: 'image/*,video/*'},
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'organisation',
      title: 'Organisation',
      type: 'reference',
      to: [{type: 'organisation'}],
    }),
    defineField({
      name: 'startDate',
      title: 'Start Month',
      type: 'date',
      options: {dateFormat: 'YYYY-MM'},
    }),
    defineField({
      name: 'endDate',
      title: 'End Month',
      type: 'date',
      options: {dateFormat: 'YYYY-MM'},
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'tag'}]}],
    }),
    defineField({
      name: 'roles',
      title: 'Roles',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'role'}]}],
    }),
    defineField({
      name: 'contributors',
      title: 'Contributors',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'person'}]}],
    }),
    defineField({
      name: 'redirectUrl',
      title: 'Link',
      type: 'url',
    }),
    defineField({
      name: 'sections',
      title: 'Content',
      type: 'array',
      of: [
        {type: 'sectionText'},
        {type: 'sectionImages'},
        {type: 'sectionVideo'},
        {type: 'sectionIntegration'},
        {type: 'sectionSubPage'},
      ],
    }),
  ],
})
