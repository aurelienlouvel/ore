import {createElement} from 'react'
import {defineField, defineType} from 'sanity'
import {HugeiconsIcon} from '@hugeicons/react'
import {ColorInput} from './components/ColorInput'
import {IconInput} from './components/IconInput'
import {hugeIconMap} from './lib/hugeIcons'
import {tailwindColorMap} from './lib/tailwindColors'

export const roleType = defineType({
  name: 'role',
  title: 'Role',
  type: 'document',
  preview: {
    select: {name: 'name', icon: 'icon', color: 'color'},
    prepare({name, icon, color}: {name?: string; icon?: string; color?: string}) {
      const iconData = icon ? hugeIconMap[icon] : undefined
      const hex = color ? tailwindColorMap[color] : undefined
      const MediaComp = iconData
        ? () => createElement(HugeiconsIcon, {icon: iconData, size: 24, color: hex ?? 'currentColor'})
        : hex
          ? () =>
              createElement('div', {
                style: {
                  width: '100%',
                  height: '100%',
                  background: hex,
                  borderRadius: 4,
                },
              })
          : undefined
      return {
        title: name ?? 'Untitled role',
        media: MediaComp,
      }
    },
  },
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      components: {input: IconInput},
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      components: {input: ColorInput},
    }),
  ],
})
