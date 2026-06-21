import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { computeTotals } from "@/lib/commerce";
import { simulateOrderConfirmationNotification } from "@/lib/notifications";

export type CheckoutInput = {
  email: string;
  fullName: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  region: string;
  postalCode: string;
  country?: string;
  shippingType?: string;
  saveAddress?: boolean;
  paymentMethod: "cod" | "razorpay";
  paymentStatus?: "pending" | "paid";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
};

export type CreateOrderResult =
  | { ok: true; number: string; totalCents: number }
  | { ok: false; error: string };

function orderNumber(): string {
  const y = new Date().getFullYear();
  const n = Math.floor(100000 + Math.random() * 900000);
  return `JR-${y}-${n}`;
}

/**
 * Create an Order from the active cart + checkout details, then clear the cart.
 * Shared by the COD server action and the Razorpay verification route.
 */
export async function createOrderFromCart(input: CheckoutInput): Promise<CreateOrderResult> {
  const cart = await getCart();
  const cartId = cart.id;
  if (!cartId || cart.lines.length === 0) return { ok: false, error: "Your cart is empty." };

  const user = await getCurrentUser();
  const shippingType = input.shippingType || "standard";
  const { subtotal, shipping, gst, total } = computeTotals(cart.subtotalCents, shippingType);

  const number = orderNumber();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          number,
          userId: user?.id ?? null,
          email: input.email || user?.email || "guest@jrinteriors.in",
          fullName: input.fullName || user?.fullName || "Guest",
          phone: input.phone || null,
          address1: input.address1,
          address2: input.address2 || null,
          city: input.city,
          region: input.region,
          postalCode: input.postalCode,
          country: input.country || "India",
          shippingType,
          subtotalCents: subtotal,
          shippingCents: shipping,
          taxCents: gst,
          totalCents: total,
          paymentMethod: input.paymentMethod,
          paymentStatus: input.paymentStatus ?? (input.paymentMethod === "cod" ? "pending" : "paid"),
          razorpayOrderId: input.razorpayOrderId ?? null,
          razorpayPaymentId: input.razorpayPaymentId ?? null,
          status: "confirmed",
          items: {
            create: cart.lines.map((l) => ({
              productId: l.productId,
              name: l.name,
              priceCents: l.priceCents,
              quantity: l.quantity,
              finish: l.finish,
              upholstery: l.upholstery,
              imageUrl: l.imageUrl,
              sellerId: l.sellerId,
            })),
          },
        },
      });

      // Save address to the user's account if requested
      if (user && input.saveAddress) {
        const hasDefault = (await tx.address.count({ where: { userId: user.id, isDefault: true } })) > 0;
        await tx.address.create({
          data: {
            userId: user.id,
            label: "Shipping",
            fullName: input.fullName || user.fullName,
            line1: input.address1,
            line2: input.address2 || null,
            city: input.city,
            region: input.region,
            postalCode: input.postalCode,
            country: input.country || "India",
            phone: input.phone || null,
            isDefault: !hasDefault,
          },
        });
      }

      // Clear cart items
      await tx.cartItem.deleteMany({ where: { cartId: cartId } });
    });
  } catch (error) {
    console.error("[Orders] Transaction failed:", error);
    return { ok: false, error: "Failed to place order. Please try again." };
  }

  const store = await cookies();
  store.delete("jr_cart");

  // Trigger simulated email/SMS tracking notifications
  simulateOrderConfirmationNotification({
    number,
    email: input.email || user?.email || "guest@jrinteriors.in",
    fullName: input.fullName || user?.fullName || "Guest",
    phone: input.phone || null,
    totalCents: total,
    paymentMethod: input.paymentMethod,
  });

  return { ok: true, number, totalCents: total };
}
