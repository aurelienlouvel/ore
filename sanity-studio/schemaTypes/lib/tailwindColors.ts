export type TailwindColor = {title: string; value: string; hex: string}

export const tailwindColors: TailwindColor[] = [
  // Neutral grays
  {title: 'White', value: 'white', hex: '#ffffff'},
  {title: 'Slate 100', value: 'slate-100', hex: '#f1f5f9'},
  {title: 'Slate 300', value: 'slate-300', hex: '#cbd5e1'},
  {title: 'Slate 500', value: 'slate-500', hex: '#64748b'},
  {title: 'Slate 700', value: 'slate-700', hex: '#334155'},
  {title: 'Slate 900', value: 'slate-900', hex: '#0f172a'},
  {title: 'Black', value: 'black', hex: '#000000'},
  // Red
  {title: 'Red 300', value: 'red-300', hex: '#fca5a5'},
  {title: 'Red 400', value: 'red-400', hex: '#f87171'},
  {title: 'Red 500', value: 'red-500', hex: '#ef4444'},
  {title: 'Red 600', value: 'red-600', hex: '#dc2626'},
  {title: 'Red 700', value: 'red-700', hex: '#b91c1c'},
  // Orange
  {title: 'Orange 300', value: 'orange-300', hex: '#fdba74'},
  {title: 'Orange 400', value: 'orange-400', hex: '#fb923c'},
  {title: 'Orange 500', value: 'orange-500', hex: '#f97316'},
  {title: 'Orange 600', value: 'orange-600', hex: '#ea580c'},
  {title: 'Orange 700', value: 'orange-700', hex: '#c2410c'},
  // Amber
  {title: 'Amber 300', value: 'amber-300', hex: '#fcd34d'},
  {title: 'Amber 400', value: 'amber-400', hex: '#fbbf24'},
  {title: 'Amber 500', value: 'amber-500', hex: '#f59e0b'},
  {title: 'Amber 600', value: 'amber-600', hex: '#d97706'},
  {title: 'Amber 700', value: 'amber-700', hex: '#b45309'},
  // Yellow
  {title: 'Yellow 300', value: 'yellow-300', hex: '#fde047'},
  {title: 'Yellow 400', value: 'yellow-400', hex: '#facc15'},
  {title: 'Yellow 500', value: 'yellow-500', hex: '#eab308'},
  {title: 'Yellow 600', value: 'yellow-600', hex: '#ca8a04'},
  {title: 'Yellow 700', value: 'yellow-700', hex: '#a16207'},
  // Lime
  {title: 'Lime 300', value: 'lime-300', hex: '#bef264'},
  {title: 'Lime 400', value: 'lime-400', hex: '#a3e635'},
  {title: 'Lime 500', value: 'lime-500', hex: '#84cc16'},
  {title: 'Lime 600', value: 'lime-600', hex: '#65a30d'},
  {title: 'Lime 700', value: 'lime-700', hex: '#4d7c0f'},
  // Green
  {title: 'Green 300', value: 'green-300', hex: '#86efac'},
  {title: 'Green 400', value: 'green-400', hex: '#4ade80'},
  {title: 'Green 500', value: 'green-500', hex: '#22c55e'},
  {title: 'Green 600', value: 'green-600', hex: '#16a34a'},
  {title: 'Green 700', value: 'green-700', hex: '#15803d'},
  // Emerald
  {title: 'Emerald 300', value: 'emerald-300', hex: '#6ee7b7'},
  {title: 'Emerald 400', value: 'emerald-400', hex: '#34d399'},
  {title: 'Emerald 500', value: 'emerald-500', hex: '#10b981'},
  {title: 'Emerald 600', value: 'emerald-600', hex: '#059669'},
  {title: 'Emerald 700', value: 'emerald-700', hex: '#047857'},
  // Teal
  {title: 'Teal 300', value: 'teal-300', hex: '#5eead4'},
  {title: 'Teal 400', value: 'teal-400', hex: '#2dd4bf'},
  {title: 'Teal 500', value: 'teal-500', hex: '#14b8a6'},
  {title: 'Teal 600', value: 'teal-600', hex: '#0d9488'},
  {title: 'Teal 700', value: 'teal-700', hex: '#0f766e'},
  // Cyan
  {title: 'Cyan 300', value: 'cyan-300', hex: '#67e8f9'},
  {title: 'Cyan 400', value: 'cyan-400', hex: '#22d3ee'},
  {title: 'Cyan 500', value: 'cyan-500', hex: '#06b6d4'},
  {title: 'Cyan 600', value: 'cyan-600', hex: '#0891b2'},
  {title: 'Cyan 700', value: 'cyan-700', hex: '#0e7490'},
  // Sky
  {title: 'Sky 300', value: 'sky-300', hex: '#7dd3fc'},
  {title: 'Sky 400', value: 'sky-400', hex: '#38bdf8'},
  {title: 'Sky 500', value: 'sky-500', hex: '#0ea5e9'},
  {title: 'Sky 600', value: 'sky-600', hex: '#0284c7'},
  {title: 'Sky 700', value: 'sky-700', hex: '#0369a1'},
  // Blue
  {title: 'Blue 300', value: 'blue-300', hex: '#93c5fd'},
  {title: 'Blue 400', value: 'blue-400', hex: '#60a5fa'},
  {title: 'Blue 500', value: 'blue-500', hex: '#3b82f6'},
  {title: 'Blue 600', value: 'blue-600', hex: '#2563eb'},
  {title: 'Blue 700', value: 'blue-700', hex: '#1d4ed8'},
  // Indigo
  {title: 'Indigo 300', value: 'indigo-300', hex: '#a5b4fc'},
  {title: 'Indigo 400', value: 'indigo-400', hex: '#818cf8'},
  {title: 'Indigo 500', value: 'indigo-500', hex: '#6366f1'},
  {title: 'Indigo 600', value: 'indigo-600', hex: '#4f46e5'},
  {title: 'Indigo 700', value: 'indigo-700', hex: '#4338ca'},
  // Violet
  {title: 'Violet 300', value: 'violet-300', hex: '#c4b5fd'},
  {title: 'Violet 400', value: 'violet-400', hex: '#a78bfa'},
  {title: 'Violet 500', value: 'violet-500', hex: '#8b5cf6'},
  {title: 'Violet 600', value: 'violet-600', hex: '#7c3aed'},
  {title: 'Violet 700', value: 'violet-700', hex: '#6d28d9'},
  // Purple
  {title: 'Purple 300', value: 'purple-300', hex: '#d8b4fe'},
  {title: 'Purple 400', value: 'purple-400', hex: '#c084fc'},
  {title: 'Purple 500', value: 'purple-500', hex: '#a855f7'},
  {title: 'Purple 600', value: 'purple-600', hex: '#9333ea'},
  {title: 'Purple 700', value: 'purple-700', hex: '#7e22ce'},
  // Fuchsia
  {title: 'Fuchsia 300', value: 'fuchsia-300', hex: '#f0abfc'},
  {title: 'Fuchsia 400', value: 'fuchsia-400', hex: '#e879f9'},
  {title: 'Fuchsia 500', value: 'fuchsia-500', hex: '#d946ef'},
  {title: 'Fuchsia 600', value: 'fuchsia-600', hex: '#c026d3'},
  {title: 'Fuchsia 700', value: 'fuchsia-700', hex: '#a21caf'},
  // Pink
  {title: 'Pink 300', value: 'pink-300', hex: '#f9a8d4'},
  {title: 'Pink 400', value: 'pink-400', hex: '#f472b6'},
  {title: 'Pink 500', value: 'pink-500', hex: '#ec4899'},
  {title: 'Pink 600', value: 'pink-600', hex: '#db2777'},
  {title: 'Pink 700', value: 'pink-700', hex: '#be185d'},
  // Rose
  {title: 'Rose 300', value: 'rose-300', hex: '#fda4af'},
  {title: 'Rose 400', value: 'rose-400', hex: '#fb7185'},
  {title: 'Rose 500', value: 'rose-500', hex: '#f43f5e'},
  {title: 'Rose 600', value: 'rose-600', hex: '#e11d48'},
  {title: 'Rose 700', value: 'rose-700', hex: '#be123c'},
]

export const tailwindColorMap: Record<string, string> = Object.fromEntries(
  tailwindColors.map((c) => [c.value, c.hex]),
)
