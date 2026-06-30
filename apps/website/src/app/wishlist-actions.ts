"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export type WishlistResult =
  | { ok: true; saved: boolean }
  | { ok: false; requiresAuth?: boolean; error?: string };

export async function toggleWishlist(productId: string): Promise<WishlistResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, requiresAuth: true };

  const product = await prisma.product.findFirst({
    where: { id: productId, status: "PUBLISHED" },
    select: { id: true, slug: true },
  });
  if (!product) return { ok: false, error: "Product is no longer available." };

  const key = { userId_productId: { userId: user.id, productId } };
  const existing = await prisma.wishlistItem.findUnique({ where: key });

  if (existing) {
    await prisma.wishlistItem.delete({ where: key });
  } else {
    await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
  }

  revalidatePath("/wishlist");
  revalidatePath("/account");
  revalidatePath(`/product/${product.slug}`);
  return { ok: true, saved: !existing };
}
