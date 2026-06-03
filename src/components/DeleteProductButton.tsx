"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { deleteSellerProduct } from "@/app/seller-actions";

export function DeleteProductButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="Delete product"
        className="text-on-surface-variant hover:text-error transition"
      >
        <Icon name="delete" className="text-[20px]" />
      </button>
    );
  }
  return (
    <form action={deleteSellerProduct} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-label-xs text-error font-semibold">Delete</button>
      <button type="button" onClick={() => setConfirming(false)} className="text-label-xs text-on-surface-variant">Cancel</button>
    </form>
  );
}
