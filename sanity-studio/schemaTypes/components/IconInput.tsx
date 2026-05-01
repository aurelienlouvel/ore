import {useMemo, useState} from 'react'
import {set, unset} from 'sanity'
import type {StringInputProps} from 'sanity'
import {HugeiconsIcon} from '@hugeicons/react'
import type {IconSvgElement} from '@hugeicons/react'
import * as AllIconsModule from '@hugeicons/core-free-icons'

type IconEntry = {name: string; label: string; icon: IconSvgElement}

const allIcons: IconEntry[] = (
  Object.entries(AllIconsModule) as [string, IconSvgElement][]
)
  .filter(([name]) => name.endsWith('Icon'))
  .map(([name, icon]) => ({
    name,
    label: name.replace(/Icon$/, ''),
    icon,
  }))
  .sort((a, b) => a.label.localeCompare(b.label))

export function IconInput(props: StringInputProps) {
  const {value, onChange} = props
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      search.trim().length > 0
        ? allIcons.filter(({label}) => label.toLowerCase().includes(search.toLowerCase()))
        : allIcons,
    [search],
  )

  const selectedEntry = useMemo(
    () => (value ? allIcons.find((e) => e.name === value) : null),
    [value],
  )

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`Search ${allIcons.length} icons…`}
        style={{
          width: '100%',
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid var(--card-border-color, #e2e8f0)',
          marginBottom: 6,
          fontSize: 13,
          background: 'var(--card-bg-color, #fff)',
          color: 'var(--card-fg-color, #0f172a)',
          boxSizing: 'border-box',
        }}
      />
      <div
        style={{
          maxHeight: 260,
          overflowY: 'auto',
          border: '1px solid var(--card-border-color, #e2e8f0)',
          borderRadius: 6,
        }}
      >
        {filtered.map(({name, label, icon}) => (
          <button
            key={name}
            type="button"
            onClick={() => onChange(value === name ? unset() : set(name))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '6px 10px',
              border: 'none',
              borderBottom: '1px solid var(--card-border-color, #e2e8f0)',
              background:
                name === value ? 'var(--card-focus-ring-color, #3b82f6)' : 'transparent',
              color: name === value ? '#fff' : 'var(--card-fg-color, #0f172a)',
              cursor: 'pointer',
              textAlign: 'left',
              flexShrink: 0,
              contentVisibility: 'auto',
              containIntrinsicHeight: '33px',
            } as React.CSSProperties}
          >
            <HugeiconsIcon icon={icon} size={16} color="currentColor" />
            <span style={{fontSize: 12, fontFamily: 'monospace'}}>{label}</span>
          </button>
        ))}
      </div>
      {selectedEntry && (
        <div
          style={{
            marginTop: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--card-muted-fg-color, #64748b)',
          }}
        >
          <HugeiconsIcon icon={selectedEntry.icon} size={14} color="currentColor" />
          <code style={{fontFamily: 'monospace'}}>{selectedEntry.label}</code>
        </div>
      )}
    </div>
  )
}
