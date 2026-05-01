export type TailwindColor = {title: string; value: string; hex: string}

export const tailwindColors: TailwindColor[] = [
  {title: 'Slate', value: 'slate-100', hex: '#f1f5f9'},
  {title: 'Gray', value: 'gray-100', hex: '#f3f4f6'},
  {title: 'Zinc', value: 'zinc-100', hex: '#f4f4f5'},
  {title: 'Neutral', value: 'neutral-100', hex: '#f5f5f5'},
  {title: 'Stone', value: 'stone-100', hex: '#f5f5f4'},
  {title: 'Red', value: 'red-100', hex: '#fee2e2'},
  {title: 'Orange', value: 'orange-100', hex: '#ffedd5'},
  {title: 'Amber', value: 'amber-100', hex: '#fef3c7'},
  {title: 'Yellow', value: 'yellow-100', hex: '#fef9c3'},
  {title: 'Lime', value: 'lime-100', hex: '#ecfccb'},
  {title: 'Green', value: 'green-100', hex: '#dcfce7'},
  {title: 'Emerald', value: 'emerald-100', hex: '#d1fae5'},
  {title: 'Teal', value: 'teal-100', hex: '#ccfbf1'},
  {title: 'Cyan', value: 'cyan-100', hex: '#cffafe'},
  {title: 'Sky', value: 'sky-100', hex: '#e0f2fe'},
  {title: 'Blue', value: 'blue-100', hex: '#dbeafe'},
  {title: 'Indigo', value: 'indigo-100', hex: '#e0e7ff'},
  {title: 'Violet', value: 'violet-100', hex: '#ede9fe'},
  {title: 'Purple', value: 'purple-100', hex: '#f3e8ff'},
  {title: 'Fuchsia', value: 'fuchsia-100', hex: '#fae8ff'},
  {title: 'Pink', value: 'pink-100', hex: '#fce7f3'},
  {title: 'Rose', value: 'rose-100', hex: '#ffe4e6'},
]

export const tailwindColorMap: Record<string, string> = Object.fromEntries(
  tailwindColors.map((c) => [c.value, c.hex]),
)
