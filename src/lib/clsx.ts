type ClassValue = string | number | boolean | undefined | null | ClassValue[];

/** Tiny classnames joiner — no dependency needed. */
export function clsx(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const v of values) {
    if (!v) continue;
    if (Array.isArray(v)) {
      const inner = clsx(...v);
      if (inner) out.push(inner);
    } else if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
    }
  }
  return out.join(" ");
}
