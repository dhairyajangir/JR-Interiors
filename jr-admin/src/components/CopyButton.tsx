"use client";

import { useState } from "react";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-line px-4 py-2 text-sm font-medium text-steel transition hover:border-ink hover:text-ink"
    >
      {copied ? `${label} copied` : `Copy ${label}`}
    </button>
  );
}
