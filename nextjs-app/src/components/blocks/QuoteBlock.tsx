import type { BlockQuote } from "@/sanity/queries";

export function QuoteBlock({ block }: { block: BlockQuote }) {
  return (
    <figure className="flex flex-col gap-5">
      <div className="text-5xl text-stone-200 font-serif leading-none select-none">
        "
      </div>
      <blockquote className="text-xl font-medium text-stone-800 leading-relaxed -mt-2">
        {block.quote}
      </blockquote>
      {(block.author || block.avatarUrl) && (
        <figcaption className="flex items-center gap-3">
          {block.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.avatarUrl}
              alt={block.author ?? ""}
              className="h-9 w-9 rounded-full object-cover"
            />
          )}
          <div>
            {block.author && (
              <p className="text-sm font-semibold text-stone-700">
                {block.author}
              </p>
            )}
            {block.authorRole && (
              <p className="text-xs text-stone-400">{block.authorRole}</p>
            )}
          </div>
        </figcaption>
      )}
    </figure>
  );
}
