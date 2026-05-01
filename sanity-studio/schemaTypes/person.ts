import {createElement} from 'react'
import {defineField, defineType} from 'sanity'
import {HugeiconsIcon} from '@hugeicons/react'
import {hugeIconMap} from './lib/hugeIcons'
import {tailwindColorMap} from './lib/tailwindColors'

export const personType = defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      avatar: 'avatar',
      roleName: 'role->name',
      roleIcon: 'role->icon',
      roleColor: 'role->color',
    },
    prepare({
      firstName,
      lastName,
      avatar,
      roleName,
      roleIcon,
      roleColor,
    }: {
      firstName?: string
      lastName?: string
      avatar?: unknown
      roleName?: string
      roleIcon?: string
      roleColor?: string
    }) {
      const iconData = roleIcon ? hugeIconMap[roleIcon] : undefined
      const hex = roleColor ? tailwindColorMap[roleColor] : undefined

      const media = avatar
        ? avatar
        : iconData
          ? () =>
              createElement(
                'div',
                {
                  style: {
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                },
                createElement(HugeiconsIcon, {
                  icon: iconData,
                  size: 20,
                  color: hex ?? 'currentColor',
                }),
                hex
                  ? createElement('div', {
                      style: {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: hex,
                        borderRadius: '0 0 2px 2px',
                      },
                    })
                  : null,
              )
          : undefined

      return {
        title: [firstName, lastName].filter(Boolean).join(' ') || 'Untitled person',
        subtitle: roleName,
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
      title: 'LinkedIn URL',
      type: 'url',
    }),
  ],
})
