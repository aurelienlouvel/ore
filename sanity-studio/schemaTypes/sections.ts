import {defineArrayMember, defineField, defineType} from 'sanity'

export const sectionTextType = defineType({
  name: 'sectionText',
  title: 'Text',
  type: 'object',
  preview: {
    select: {title: 'heading'},
    prepare({title}) {
      return {title: title || 'Text section', subtitle: 'Text'}
    },
  },
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({type: 'block'}),
      ],
    }),
  ],
})

export const sectionImagesType = defineType({
  name: 'sectionImages',
  title: 'Images',
  type: 'object',
  preview: {
    select: {title: 'heading'},
    prepare({title}) {
      return {title: title || 'Images section', subtitle: 'Images'}
    },
  },
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'imageItem',
          preview: {select: {media: 'image', title: 'caption'}},
          fields: [
            defineField({name: 'image', type: 'image', options: {hotspot: true}}),
            defineField({name: 'caption', type: 'string', title: 'Caption'}),
            defineField({name: 'alt', type: 'string', title: 'Alt text'}),
          ],
        }),
      ],
    }),
  ],
})

export const sectionVideoType = defineType({
  name: 'sectionVideo',
  title: 'Video',
  type: 'object',
  preview: {
    select: {title: 'heading'},
    prepare({title}) {
      return {title: title || 'Video section', subtitle: 'Video'}
    },
  },
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube, Vimeo or direct link',
    }),
    defineField({
      name: 'file',
      title: 'Video File',
      type: 'file',
      description: 'Or upload a video file directly',
      options: {accept: 'video/*'},
    }),
  ],
})

export const sectionIntegrationType = defineType({
  name: 'sectionIntegration',
  title: 'Integration',
  type: 'object',
  preview: {
    select: {title: 'heading', provider: 'provider'},
    prepare({title, provider}: {title?: string; provider?: string}) {
      return {title: title || 'Integration', subtitle: provider || 'Embed'}
    },
  },
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'provider',
      title: 'Provider',
      type: 'string',
      description: 'e.g. Figma, CodePen, Loom…',
    }),
    defineField({
      name: 'url',
      title: 'Embed URL',
      type: 'url',
    }),
    defineField({
      name: 'embedCode',
      title: 'Embed Code',
      type: 'text',
      description: 'Raw iframe/embed HTML',
      rows: 4,
    }),
  ],
})

export const sectionSubPageType = defineType({
  name: 'sectionSubPage',
  title: 'Sub-page',
  type: 'object',
  preview: {
    select: {title: 'title'},
    prepare({title}) {
      return {title: title || 'Sub-page', subtitle: 'Sub-page'}
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
      ],
    }),
  ],
})
