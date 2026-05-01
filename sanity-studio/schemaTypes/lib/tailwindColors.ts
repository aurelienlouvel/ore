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

const shadeMap: Record<string, Record<200 | 800, string>> = {
  gray:    {200: '#e5e7eb', 800: '#1f2937'},
  red:     {200: '#fecaca', 800: '#991b1b'},
  orange:  {200: '#fed7aa', 800: '#9a3412'},
  amber:   {200: '#fde68a', 800: '#92400e'},
  yellow:  {200: '#fef08a', 800: '#854d0e'},
  lime:    {200: '#d9f99d', 800: '#3f6212'},
  green:   {200: '#bbf7d0', 800: '#166534'},
  emerald: {200: '#a7f3d0', 800: '#065f46'},
  teal:    {200: '#99f6e4', 800: '#115e59'},
  cyan:    {200: '#a5f3fc', 800: '#155e75'},
  sky:     {200: '#bae6fd', 800: '#075985'},
  blue:    {200: '#bfdbfe', 800: '#1e40af'},
  indigo:  {200: '#c7d2fe', 800: '#3730a3'},
  violet:  {200: '#ddd6fe', 800: '#5b21b6'},
  purple:  {200: '#e9d5ff', 800: '#6b21a8'},
  fuchsia: {200: '#f5d0fe', 800: '#86198f'},
  pink:    {200: '#fbcfe8', 800: '#9d174d'},
  rose:    {200: '#fecdd3', 800: '#9f1239'},
}

export const tailwindColorMap: Record<string, string> = Object.fromEntries(
  tailwindColors.map((c) => [c.value, c.hex]),
)

export function getColorShade(colorValue: string, shade: 200 | 800): string | undefined {
  const base = colorValue.replace(/-\d+$/, '')
  return shadeMap[base]?.[shade]
}
