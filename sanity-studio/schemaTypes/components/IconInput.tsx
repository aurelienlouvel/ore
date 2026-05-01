import {useState} from 'react'
import {set, unset} from 'sanity'
import type {StringInputProps} from 'sanity'
import {HugeiconsIcon} from '@hugeicons/react'
import {curatedIconList} from '../lib/hugeIcons'

const categories = ['All', 'Work', 'Design', 'Dev', 'People', 'Media', 'Labels']

export function IconInput(props: StringInputProps) {
  const {value, onChange} = props
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = curatedIconList.filter(({label, name, category: cat}) => {
    const matchSearch =
      label.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || cat === category
    return matchSearch && matchCat
  })

  const selectedEntry = value ? curatedIconList.find((e) => e.name === value) : null

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search icons…"
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
      <div style={{display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8}}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            style={{
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 11,
              border: '1px solid var(--card-border-color, #e2e8f0)',
              background: category === cat ? 'var(--card-fg-color, #0f172a)' : 'transparent',
              color: category === cat ? 'var(--card-bg-color, #fff)' : 'var(--card-muted-fg-color, #64748b)',
              cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          maxHeight: 200,
          overflowY: 'auto',
          padding: 2,
        }}
      >
        {filtered.map(({name, label, icon}) => (
          <button
            key={name}
            type="button"
            title={label}
            onClick={() => onChange(value === name ? unset() : set(name))}
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              border: `1.5px solid ${value === name ? 'var(--card-focus-ring-color, #3b82f6)' : 'var(--card-border-color, #e2e8f0)'}`,
              background: value === name ? 'var(--card-focus-ring-color, #3b82f6)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: value === name ? '#fff' : 'var(--card-fg-color, #0f172a)',
              flexShrink: 0,
            }}
          >
            <HugeiconsIcon icon={icon} size={18} color="currentColor" />
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
