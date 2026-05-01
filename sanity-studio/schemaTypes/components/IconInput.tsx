import {useEffect, useMemo, useRef, useState} from 'react'
import {set, unset} from 'sanity'
import type {StringInputProps} from 'sanity'
import {HugeiconsIcon} from '@hugeicons/react'
import {Search01Icon} from '@hugeicons/core-free-icons'
import {allIconEntries} from '../lib/hugeIcons'

export function IconInput(props: StringInputProps) {
  const {value, onChange} = props
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(
    () =>
      search.trim().length > 0
        ? allIconEntries.filter(({label}) => label.toLowerCase().includes(search.toLowerCase()))
        : allIconEntries,
    [search],
  )

  const selectedEntry = useMemo(
    () => (value ? allIconEntries.find((e) => e.name === value) : null),
    [value],
  )

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setTimeout(() => searchRef.current?.focus(), 10)
    }
  }, [isOpen])

  const handleSelect = (name: string) => {
    onChange(value === name ? unset() : set(name))
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} style={{position: 'relative'}}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '7px 10px',
          borderRadius: 6,
          border: `1px solid ${isOpen ? 'var(--card-focus-ring-color, #3b82f6)' : 'var(--card-border-color, #e2e8f0)'}`,
          background: 'var(--card-bg-color, #fff)',
          color: selectedEntry
            ? 'var(--card-fg-color, #0f172a)'
            : 'var(--card-muted-fg-color, #94a3b8)',
          cursor: 'pointer',
          fontSize: 13,
          textAlign: 'left',
        }}
      >
        {selectedEntry ? (
          <>
            <HugeiconsIcon icon={selectedEntry.icon} size={16} color="currentColor" />
            <span style={{fontFamily: 'monospace', flex: 1}}>{selectedEntry.label}</span>
          </>
        ) : (
          <span style={{flex: 1}}>Select an icon…</span>
        )}
        <span style={{fontSize: 10, opacity: 0.5}}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'var(--card-bg-color, #fff)',
            border: '1px solid var(--card-border-color, #e2e8f0)',
            borderRadius: 6,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          }}
        >
          <div
            style={{
              padding: 6,
              borderBottom: '1px solid var(--card-border-color, #e2e8f0)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: 'var(--card-muted-fg-color, #94a3b8)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <HugeiconsIcon icon={Search01Icon} size={14} color="currentColor" />
            </div>
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons…"
              style={{
                width: '100%',
                padding: '5px 8px 5px 28px',
                borderRadius: 4,
                border: '1px solid var(--card-border-color, #e2e8f0)',
                fontSize: 12,
                background: 'var(--card-bg-color, #fff)',
                color: 'var(--card-fg-color, #0f172a)',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>
          <div style={{maxHeight: 240, overflowY: 'auto'}}>
            {filtered.map(({name, label, icon}) => (
              <button
                key={name}
                type="button"
                onClick={() => handleSelect(name)}
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
                  contentVisibility: 'auto',
                  containIntrinsicHeight: '33px',
                } as React.CSSProperties}
              >
                <HugeiconsIcon icon={icon} size={15} color="currentColor" />
                <span style={{fontSize: 12, fontFamily: 'monospace'}}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
