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
      roleName: 'role->name',
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare({firstName, lastName, media, roleName}: {firstName?: string; lastName?: string; media?: any; roleName?: string}) {
      return {
        title: [firstName, lastName].filter(Boolean).join(' ') || 'Untitled person',
        subtitle: roleName,
        media,
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
      title: 'LinkedIn URL',
      type: 'url',
    }),
  ],
})
