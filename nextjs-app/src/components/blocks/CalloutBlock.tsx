import type { BlockCallout } from "@/sanity/queries";

const STYLES = {
  insight: { wrapper: "bg-blue-50 border-blue-200", label: "text-blue-500", body: "text-blue-900" },
  warning: { wrapper: "bg-amber-50 border-amber-200", label: "text-amber-500", body: "text-amber-900" },
  tip: { wrapper: "bg-green-50 border-green-200", label: "text-green-500", body: "text-green-900" },
  result: { wrapper: "bg-violet-50 border-violet-200", label: "text-violet-500", body: "text-violet-900" },
} as const;

export function CalloutBlock({ block }: { block: BlockCallout }) {
  const variant = block.variant ?? "insight";
  const s = STYLES[variant];

  return (
    <div className={`rounded-xl border px-5 py-4 ${s.wrapper}`}>
      <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${s.label}`}>
        {variant}
      </p>
      {block.title && (
        <p className={`font-semibold mb-1 ${s.body}`}>{block.title}</p>
      )}
      {block.body && (
        <p className={`text-sm leading-relaxed ${s.body} opacity-80`}>{block.body}</p>
      )}
    </div>
  );
}
