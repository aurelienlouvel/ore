import type { BlockCard, CardItem } from "@/sanity/queries";
import { Icon } from "@/components/primitives/Icon";

function CardItemComponent({ item }: { item: CardItem }) {
  const bg = item.color ? `bg-${item.color}-50 border-${item.color}-100` : "bg-zinc-50 border-zinc-100";
  const textColor = item.color ? `text-${item.color}-950` : "text-zinc-900";

  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-2 ${bg}`}>
      {item.icon && (
        <div className="mb-1">
          <Icon name={item.icon} size={20} strokeWidth={1.8} />
        </div>
      )}
      {(item.value || item.unit) && (
        <div className={`flex items-baseline gap-1 ${textColor}`}>
          {item.value && (
            <span className="text-3xl font-bold tracking-tight">{item.value}</span>
          )}
          {item.unit && (
            <span className="text-sm font-medium opacity-60">{item.unit}</span>
          )}
        </div>
      )}
      {item.title && (
        <p className="text-sm font-semibold text-zinc-700">{item.title}</p>
      )}
      {item.description && (
        <p className="text-sm text-zinc-500 leading-relaxed">{item.description}</p>
      )}
    </div>
  );
}

export function CardBlock({ block }: { block: BlockCard }) {
  const items = block.items ?? [];
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <CardItemComponent key={item._key} item={item} />
      ))}
    </div>
  );
}
