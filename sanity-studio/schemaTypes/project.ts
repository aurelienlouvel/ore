import {createElement} from 'react'
import {defineField, defineType} from 'sanity'
import {orderRankField} from '@sanity/orderable-document-list'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      thumbnail: 'thumbnail',
    },
    prepare({title, subtitle, thumbnail}: {title?: string; subtitle?: string; thumbnail?: {asset?: {_ref?: string}}}) {
      const ref = thumbnail?.asset?._ref
      const match = ref?.match(/^file-([a-f0-9]+)-(\w+)$/)
      const imgExts = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'])
      const media =
        match && imgExts.has(match[2])
          ? () =>
              createElement('img', {
                src: `https://cdn.sanity.io/files/87awwrcu/production/${match[1]}.${match[2]}`,
                style: {width: '100%', height: '100%', objectFit: 'cover'},
              })
          : undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return {title: title ?? 'Untitled project', subtitle, media: media as any}
    },
  },
  fields: [
    orderRankField({type: 'project'}),
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
      title: 'Mates',
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
