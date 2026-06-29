"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/app/actions";

export function DeleteProductButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this product listing?")) return;
        startTransition(async () => {
          const formData = new FormData();
          formData.set("id", id);
          await deleteProduct(formData);
        });
      }}
      className="rounded-full border border-rose-200 px-4 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
