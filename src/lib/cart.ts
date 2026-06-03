import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const COOKIE = "jr_cart";

export type CartLine = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  tagline: string | null;
  imageUrl: string;
  priceCents: number;
  quantity: number;
  finish: string | null;
  upholstery: string | null;
  lineTotalCents: number;
};

export type CartSummary = {
  id: string | null;
  lines: CartLine[];
  count: number;
  subtotalCents: number;
};

const EMPTY: CartSummary = { id: null, lines: [], count: 0, subtotalCents: 0 };

/** Read current cart id from cookie (no mutation). */
async function readCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE)?.value ?? null;
}

/** Ensure a cart row + cookie exist. Call only from a Server Action / Route Handler. */
export async function ensureCart(): Promise<string> {
  const store = await cookies();
  const existing = store.get(COOKIE)?.value;
  if (existing) {
    const found = await prisma.cart.findUnique({ where: { id: existing } });
    if (found) return existing;
  }
  const cart = await prisma.cart.create({ data: {} });
  store.set(COOKIE, cart.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return cart.id;
}

/** Full cart for rendering. Safe to call from Server Components. */
export async function getCart(): Promise<CartSummary> {
  const id = await readCartId();
  if (!id) return EMPTY;

  const cart = await prisma.cart.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { id: "asc" },
        include: { product: true },
      },
    },
  });
  if (!cart) return EMPTY;

  const lines: CartLine[] = cart.items.map((item) => {
    const lineTotal = item.product.priceCents * item.quantity;
    return {
      id: item.id,
      productId: item.productId,
      slug: item.product.slug,
      name: item.product.name,
      tagline: item.product.tagline,
      imageUrl: item.product.imageUrl,
      priceCents: item.product.priceCents,
      quantity: item.quantity,
      finish: item.finish,
      upholstery: item.upholstery,
      lineTotalCents: lineTotal,
    };
  });

  return {
    id: cart.id,
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotalCents: lines.reduce((s, l) => s + l.lineTotalCents, 0),
  };
}

/** Lightweight item count for the nav badge. */
export async function getCartCount(): Promise<number> {
  const id = await readCartId();
  if (!id) return 0;
  const agg = await prisma.cartItem.aggregate({
    where: { cartId: id },
    _sum: { quantity: true },
  });
  return agg._sum.quantity ?? 0;
}
