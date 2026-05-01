export type TailwindColor = {title: string; value: string; hex: string}

export const tailwindColors: TailwindColor[] = [
  // Neutral
  {title: 'Gray', value: 'gray-300', hex: '#d1d5db'},
  // Chromatic
  {title: 'Red', value: 'red-300', hex: '#fca5a5'},
  {title: 'Orange', value: 'orange-300', hex: '#fdba74'},
  {title: 'Amber', value: 'amber-300', hex: '#fcd34d'},
  {title: 'Yellow', value: 'yellow-300', hex: '#fde047'},
  {title: 'Lime', value: 'lime-300', hex: '#bef264'},
  {title: 'Green', value: 'green-300', hex: '#86efac'},
  {title: 'Emerald', value: 'emerald-300', hex: '#6ee7b7'},
  {title: 'Teal', value: 'teal-300', hex: '#5eead4'},
  {title: 'Cyan', value: 'cyan-300', hex: '#67e8f9'},
  {title: 'Sky', value: 'sky-300', hex: '#7dd3fc'},
  {title: 'Blue', value: 'blue-300', hex: '#93c5fd'},
  {title: 'Indigo', value: 'indigo-300', hex: '#a5b4fc'},
  {title: 'Violet', value: 'violet-300', hex: '#c4b5fd'},
  {title: 'Purple', value: 'purple-300', hex: '#d8b4fe'},
  {title: 'Fuchsia', value: 'fuchsia-300', hex: '#f0abfc'},
  {title: 'Pink', value: 'pink-300', hex: '#f9a8d4'},
  {title: 'Rose', value: 'rose-300', hex: '#fda4af'},
]

export const tailwindColorMap: Record<string, string> = Object.fromEntries(
  tailwindColors.map((c) => [c.value, c.hex]),
)
