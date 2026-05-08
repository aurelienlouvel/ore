import { Icon } from "./Icon";

export function Role({
  name,
  icon,
  comma,
}: {
  name: string;
  icon: string | null;
  comma?: boolean;
}) {
  return (
    <div className="h-auto flex flex-row items-center gap-1 font-semibold text-lg text-zinc-700">
      {name}
      {icon && <Icon name={icon} size={16} strokeWidth={2.4} />}
      {comma && <span>, </span>}
    </div>
  );
}
