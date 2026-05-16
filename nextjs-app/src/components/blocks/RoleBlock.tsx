"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { Role } from "@/components/primitives/Role";
import { HugeiconsIcon } from "@hugeicons/react";
import { CapIcon } from "@hugeicons/core-free-icons";

const MAX_WIDTH = 320;
const GAP = 4; // gap-1 = 4px

type RoleItem = {
  _id: string;
  name: string;
  icon: string | null;
};

export function RoleBlock({ roles }: { roles: RoleItem[] }) {
  const chipsRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = chipsRef.current;
    if (!el) return;

    function measure() {
      if (!el) return;
      const chips = Array.from(el.children) as HTMLElement[];
      if (!chips.length) return;

      // Group chips by row using their rendered top position
      const elTop = el.getBoundingClientRect().top;
      const rows = new Map<number, number>();
      for (const chip of chips) {
        const rect = chip.getBoundingClientRect();
        const top = Math.round(rect.top - elTop);
        // Initialize row at -GAP so first chip gives exactly its width
        rows.set(top, (rows.get(top) ?? -GAP) + GAP + rect.width);
      }

      const maxRowWidth = Math.max(...rows.values());
      setWidth(Math.min(Math.ceil(maxRowWidth), MAX_WIDTH));
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div style={width !== null ? { width } : undefined}>
      <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-400 mb-3">
        <HugeiconsIcon icon={CapIcon} size={12} strokeWidth={2} />
        {roles.length > 1 ? "roles" : "role"}
      </div>
      <div
        ref={chipsRef}
        className="flex flex-wrap gap-1"
        style={{ maxWidth: MAX_WIDTH }}
      >
        {roles.map((role, i) => (
          <Role
            key={role._id}
            name={role.name}
            icon={role.icon}
            comma={i < roles.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
