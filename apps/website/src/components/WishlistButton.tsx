"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleWishlist } from "@/app/wishlist-actions";
import { Icon } from "@/components/Icon";
import { clsx } from "@/lib/clsx";

export function WishlistButton({
  productId,
  initialSaved = false,
  className,
}: {
  productId: string;
  initialSaved?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  const label = saved ? "Remove from wishlist" : "Save to wishlist";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={saved}
      title={label}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await toggleWishlist(productId);
          if (!result.ok && result.requiresAuth) {
            router.push(`/account/login?redirect=${encodeURIComponent(pathname)}`);
            return;
          }
          if (result.ok) {
            setSaved(result.saved);
            router.refresh();
          }
        });
      }}
      className={clsx(
        "flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/50 bg-surface/90 text-primary shadow-sm backdrop-blur-sm transition hover:bg-white active:scale-95 disabled:opacity-60",
        className,
      )}
    >
      <Icon name="favorite" fill={saved} className={clsx("text-[22px]", saved && "text-primary")} />
    </button>
  );
}
