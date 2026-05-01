import {set, unset} from 'sanity'
import type {StringInputProps} from 'sanity'
import {tailwindColors} from '../lib/tailwindColors'

export function ColorInput(props: StringInputProps) {
  const {value, onChange} = props

  return (
    <div style={{padding: '6px 0', display: 'flex', flexWrap: 'wrap', gap: 6}}>
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
            border: value === color.value ? '3px solid white' : '2px solid transparent',
            boxShadow: value === color.value ? `0 0 0 2px ${color.hex}` : 'none',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  )
}
