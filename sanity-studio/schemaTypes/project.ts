import {defineField, defineType} from 'sanity'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  preview: {
    select: {title: 'title', subtitle: 'description'},
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
      description: 'Leave empty for solo projects',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'object',
      fields: [
        defineField({
          name: 'mediaType',
          title: 'Type',
          type: 'string',
          initialValue: 'image',
          options: {
            list: [
              {title: 'Image', value: 'image'},
              {title: 'Video', value: 'video'},
            ],
            layout: 'radio',
          },
        }),
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {hotspot: true},
          hidden: ({parent}) => (parent as {mediaType?: string})?.mediaType !== 'image',
        }),
        defineField({
          name: 'video',
          title: 'Video',
          type: 'file',
          options: {accept: 'video/*'},
          hidden: ({parent}) => (parent as {mediaType?: string})?.mediaType !== 'video',
        }),
      ],
    }),
    defineField({
      name: 'redirectUrl',
      title: 'Redirect URL',
      type: 'url',
      description: 'Optional — redirects to an external URL instead of the project page',
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
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
