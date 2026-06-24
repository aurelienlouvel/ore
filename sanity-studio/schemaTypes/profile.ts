import {defineField, defineType} from 'sanity'

export const profileType = defineType({
  name: 'profile',
  title: 'Profile',
  type: 'document',
  preview: {
    select: {firstName: 'firstName', lastName: 'lastName', media: 'stories.0.image'},
    prepare({firstName, lastName, media}: {firstName?: string; lastName?: string; media?: unknown}) {
      return {
        title: [firstName, lastName].filter(Boolean).join(' ') || 'Profile',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        media: media as any,
      }
    },
  },
  fields: [
    defineField({
      name: 'firstName',
      title: 'First Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'lastName',
      title: 'Last Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'pseudo',
      title: 'Pseudo',
      type: 'string',
    }),
    defineField({
      name: 'jobTitle',
      title: 'Job title',
      type: 'string',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'stories',
      title: 'Stories',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'storyPhoto',
          title: 'Photo',
          preview: {
            select: {media: 'image', title: 'caption'},
            prepare({media, title}: {media?: unknown; title?: string}) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return {title: title ?? 'Photo', media: media as any}
            },
          },
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {hotspot: true},
            }),
            defineField({name: 'alt', title: 'Alt text', type: 'string'}),
            defineField({name: 'caption', title: 'Caption', type: 'string'}),
          ],
        },
        {
          type: 'object',
          name: 'storyVideo',
          title: 'Video',
          preview: {
            select: {caption: 'caption'},
            prepare({caption}: {caption?: string}) {
              return {title: caption ?? 'Video'}
            },
          },
          fields: [
            defineField({
              name: 'file',
              title: 'Video file',
              type: 'file',
              options: {accept: 'video/*'},
            }),
            defineField({
              name: 'url',
              title: 'External URL',
              type: 'url',
            }),
            defineField({name: 'caption', title: 'Caption', type: 'string'}),
          ],
        },
        {
          type: 'object',
          name: 'storyAppleMusic',
          title: 'Apple Music',
          preview: {
            select: {subtitle: 'url'},
            prepare({subtitle}: {subtitle?: string}) {
              return {title: 'Apple Music', subtitle}
            },
          },
          fields: [
            defineField({
              name: 'url',
              title: 'Apple Music link',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
        {
          type: 'object',
          name: 'storyStrava',
          title: 'Strava',
          preview: {
            select: {subtitle: 'profileUrl'},
            prepare({subtitle}: {subtitle?: string}) {
              return {title: 'Strava', subtitle}
            },
          },
          fields: [
            defineField({
              name: 'profileUrl',
              title: 'Strava profile',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
        {
          type: 'object',
          name: 'storyAppleMaps',
          title: 'Apple Maps',
          preview: {
            select: {subtitle: 'address'},
            prepare({subtitle}: {subtitle?: string}) {
              return {title: 'Apple Maps', subtitle}
            },
          },
          fields: [
            defineField({
              name: 'address',
              title: 'Address / City',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
        {
          type: 'object',
          name: 'storyGithub',
          title: 'GitHub',
          preview: {
            select: {subtitle: 'username'},
            prepare({subtitle}: {subtitle?: string}) {
              return {title: 'GitHub', subtitle}
            },
          },
          fields: [
            defineField({
              name: 'username',
              title: 'GitHub username',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'tools',
      title: 'Favorite tools',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'tool'}]}],
    }),
  ],
})
