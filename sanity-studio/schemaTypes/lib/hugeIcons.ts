import type {IconSvgElement} from '@hugeicons/react'
import * as AllIconsModule from '@hugeicons/core-free-icons'

export type IconEntry = {name: string; label: string; icon: IconSvgElement}

export const allIconEntries: IconEntry[] = (
  Object.entries(AllIconsModule) as [string, IconSvgElement][]
)
  .filter(([name]) => name.endsWith('Icon'))
  .map(([name, icon]) => ({
    name,
    label: name.replace(/Icon$/, ''),
    icon,
  }))
  .sort((a, b) => a.label.localeCompare(b.label))

export const hugeIconMap: Record<string, IconSvgElement> = Object.fromEntries(
  allIconEntries.map(({name, icon}) => [name, icon]),
)
