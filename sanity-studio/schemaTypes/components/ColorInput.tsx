import {set, unset} from 'sanity'
import type {StringInputProps} from 'sanity'
import {tailwindColors} from '../lib/tailwindColors'

export function ColorInput(props: StringInputProps) {
  const {value, onChange} = props

  return (
    <div style={{padding: '6px 0'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
        {tailwindColors.map((color) => (
          <button
            key={color.value}
            type="button"
            title={color.title}
            onClick={() => onChange(value === color.value ? unset() : set(color.value))}
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              backgroundColor: color.hex,
              border:
                value === color.value
                  ? `3px solid white`
                  : color.hex === '#ffffff'
                    ? '1.5px solid #e2e8f0'
                    : '2px solid transparent',
              boxShadow: value === color.value ? `0 0 0 2px ${color.hex}` : 'none',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
              transition: 'transform 0.1s',
            }}
          />
        ))}
      </div>
      {value && (
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--card-muted-fg-color, #64748b)',
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor:
                tailwindColors.find((c) => c.value === value)?.hex ?? 'transparent',
              border: '1px solid rgba(0,0,0,0.1)',
              flexShrink: 0,
            }}
          />
          <code style={{fontFamily: 'monospace'}}>{value}</code>
        </div>
      )}
    </div>
  )
}
