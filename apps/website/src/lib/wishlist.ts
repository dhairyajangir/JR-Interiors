import "server-only";
import { prisma } from "@/lib/db";

export async function getWishlistProductIds(
  userId: string | undefined,
  productIds?: string[],
): Promise<Set<string>> {
  if (!userId || productIds?.length === 0) return new Set();

  const items = await prisma.wishlistItem.findMany({
    where: {
      userId,
      ...(productIds ? { productId: { in: productIds } } : {}),
    },
    select: { productId: true },
  });

  return new Set(items.map((item) => item.productId));
}
