import { DynamicIcon } from "../DynamicIcon";

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
    <div className="h-auto flex flex-row items-center gap-1 font-semibold text-lg text-zinc-600">
      {name}
      {icon && <DynamicIcon name={icon} size={16} />}
      {comma && <span>, </span>}
    </div>
  );
}
