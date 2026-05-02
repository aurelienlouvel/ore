import {defineField, defineType} from 'sanity'

export const personType = defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      media: 'avatar',
    },
    prepare({firstName, lastName, media}: {firstName?: string; lastName?: string; media?: unknown}) {
      return {
        title: [firstName, lastName].filter(Boolean).join(' ') || 'Untitled person',
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
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'reference',
      to: [{type: 'role'}],
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn',
      type: 'url',
    }),
  ],
})
