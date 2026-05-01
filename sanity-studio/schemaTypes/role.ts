import {createElement} from 'react'
import {defineField, defineType} from 'sanity'
import {HugeiconsIcon} from '@hugeicons/react'
import {ColorInput} from './components/ColorInput'
import {IconInput} from './components/IconInput'
import {hugeIconMap} from './lib/hugeIcons'
import {getColorShade} from './lib/tailwindColors'

export const roleType = defineType({
  name: 'role',
  title: 'Role',
  type: 'document',
  preview: {
    select: {name: 'name', icon: 'icon', color: 'color'},
    prepare({name, icon, color}: {name?: string; icon?: string; color?: string}) {
      const iconData = icon ? hugeIconMap[icon] : undefined
      const bg = color ? getColorShade(color, 100) : undefined
      const iconColor = color ? getColorShade(color, 800) : undefined
      const MediaComp = iconData
        ? () =>
            createElement(
              'div',
              {
                style: {
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: bg ?? 'transparent',
                  borderRadius: 2,
                },
              },
              createElement(HugeiconsIcon, {icon: iconData, size: 20, color: iconColor ?? 'currentColor'}),
            )
        : bg
          ? () =>
              createElement('div', {
                style: {width: '100%', height: '100%', background: bg, borderRadius: 4},
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
