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
          title: 'Music',
          preview: {
            select: {subtitle: 'url'},
            prepare({subtitle}: {subtitle?: string}) {
              return {title: 'Music', subtitle}
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
          title: 'Activity',
          preview: {
            select: {subtitle: 'profileUrl'},
            prepare({subtitle}: {subtitle?: string}) {
              return {title: 'Activity', subtitle}
            },
          },
          fields: [
            defineField({
              name: 'profileUrl',
              title: 'Strava profile URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'shareHash',
              title: 'StatsHunters share hash',
              description: 'The hash from your StatsHunters share URL (e.g. "b97a7df6d0f9" from statshunters.com/share/b97a7df6d0f9)',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
        {
          type: 'object',
          name: 'storyAppleMaps',
          title: 'Location',
          preview: {
            select: {subtitle: 'address', label: 'label'},
            prepare({subtitle, label}: {subtitle?: string; label?: string}) {
              return {title: 'Location', subtitle: label ?? subtitle}
            },
          },
          fields: [
            defineField({
              name: 'address',
              title: 'Address',
              description: 'Street address or city name (e.g. "9 rue Courat, 75020 Paris")',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Display label (optional)',
              description: 'Override the label shown on the card (default: "City, Country")',
              type: 'string',
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
