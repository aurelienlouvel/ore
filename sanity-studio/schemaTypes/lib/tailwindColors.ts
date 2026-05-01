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

const shadeMap: Record<string, Record<100 | 800, string>> = {
  gray:    {100: '#f3f4f6', 800: '#1f2937'},
  red:     {100: '#fee2e2', 800: '#991b1b'},
  orange:  {100: '#ffedd5', 800: '#9a3412'},
  amber:   {100: '#fef3c7', 800: '#92400e'},
  yellow:  {100: '#fef9c3', 800: '#854d0e'},
  lime:    {100: '#f7fee7', 800: '#3f6212'},
  green:   {100: '#dcfce7', 800: '#166534'},
  emerald: {100: '#d1fae5', 800: '#065f46'},
  teal:    {100: '#ccfbf1', 800: '#115e59'},
  cyan:    {100: '#cffafe', 800: '#155e75'},
  sky:     {100: '#e0f2fe', 800: '#075985'},
  blue:    {100: '#dbeafe', 800: '#1e40af'},
  indigo:  {100: '#e0e7ff', 800: '#3730a3'},
  violet:  {100: '#ede9fe', 800: '#5b21b6'},
  purple:  {100: '#f3e8ff', 800: '#6b21a8'},
  fuchsia: {100: '#fae8ff', 800: '#86198f'},
  pink:    {100: '#fce7f3', 800: '#9d174d'},
  rose:    {100: '#ffe4e6', 800: '#9f1239'},
}

export const tailwindColorMap: Record<string, string> = Object.fromEntries(
  tailwindColors.map((c) => [c.value, c.hex]),
)

export function getColorShade(colorValue: string, shade: 100 | 800): string | undefined {
  const base = colorValue.replace(/-\d+$/, '')
  return shadeMap[base]?.[shade]
}
