const MAP: Record<string, { label: string; cls: string }> = {
  PUBLISHED: { label: "Published", cls: "bg-secondary-container text-on-secondary-container" },
  PENDING: { label: "Pending review", cls: "bg-tertiary-fixed text-on-tertiary-fixed" },
  REJECTED: { label: "Rejected", cls: "bg-error-container text-on-error-container" },
  DRAFT: { label: "Draft", cls: "bg-surface-container text-on-surface-variant" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? MAP.DRAFT;
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}
