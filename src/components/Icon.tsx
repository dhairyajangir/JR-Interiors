import { clsx } from "@/lib/clsx";

export function Icon({
  name,
  className,
  fill = false,
  style,
}: {
  name: string;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      style={style}
      className={clsx("material-symbols-outlined", fill && "fill", className)}
    >
      {name}
    </span>
  );
}
