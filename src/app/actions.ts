"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ensureCart, getCart } from "@/lib/cart";
import { createOrderFromCart } from "@/lib/orders";

export type ActionResult = { ok: boolean; count?: number; error?: string };

/** Add a product to the cart. Merges with an existing identical line. */
export async function addToCart(input: {
  productId: string;
  quantity?: number;
  finish?: string | null;
  upholstery?: string | null;
}): Promise<ActionResult> {
  const qty = Math.max(1, Math.min(input.quantity ?? 1, 99));
  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product || product.status !== "PUBLISHED") return { ok: false, error: "Product not available" };

  const cartId = await ensureCart();

  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId,
      productId: input.productId,
      finish: input.finish ?? null,
      upholstery: input.upholstery ?? null,
    },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: Math.min(existing.quantity + qty, 99) },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId,
        productId: input.productId,
        quantity: qty,
        finish: input.finish ?? null,
        upholstery: input.upholstery ?? null,
      },
    });
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  const cart = await getCart();
  return { ok: true, count: cart.count };
}

/** Set an exact quantity for a cart line. Quantity 0 removes it. */
export async function updateLine(itemId: string, quantity: number): Promise<ActionResult> {
  const qty = Math.max(0, Math.min(quantity, 99));
  try {
    if (qty === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: qty } });
    }
    revalidatePath("/cart");
    revalidatePath("/", "layout");
    const cart = await getCart();
    return { ok: true, count: cart.count };
  } catch (error) {
    console.error("[Cart] Failed to update line:", error);
    return { ok: false, error: "Failed to update quantity. Please try again." };
  }
}

export async function removeLine(itemId: string): Promise<ActionResult> {
  try {
    await prisma.cartItem.delete({ where: { id: itemId } });
    revalidatePath("/cart");
    revalidatePath("/", "layout");
    const cart = await getCart();
    return { ok: true, count: cart.count };
  } catch (error) {
    console.error("[Cart] Failed to remove line:", error);
    return { ok: false, error: "Failed to remove item. Please try again." };
  }
}

const str = (fd: FormData, k: string) => ((fd.get(k) as string) ?? "").trim();

/** Place a Cash-on-Delivery order from the current cart + shipping form. */
export async function placeOrder(formData: FormData): Promise<void> {
  const result = await createOrderFromCart({
    email: str(formData, "email"),
    fullName: str(formData, "fullName"),
    phone: str(formData, "phone"),
    address1: str(formData, "address1"),
    address2: str(formData, "address2"),
    city: str(formData, "city"),
    region: str(formData, "region"),
    postalCode: str(formData, "postalCode"),
    country: str(formData, "country") || "India",
    shippingType: str(formData, "shippingType") || "standard",
    saveAddress: formData.get("saveAddress") === "on",
    paymentMethod: "cod",
    paymentStatus: "pending",
  });

  if (!result.ok) redirect("/cart");
  revalidatePath("/", "layout");
  redirect(`/order/${result.number}`);
}
