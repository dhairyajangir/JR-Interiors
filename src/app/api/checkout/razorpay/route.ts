import { NextResponse } from "next/server";
import { getCart } from "@/lib/cart";
import { computeTotals } from "@/lib/commerce";
import { createRazorpayOrder, razorpayEnabled, razorpayKeyId } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!razorpayEnabled()) {
    return NextResponse.json({ error: "Online payment is not configured." }, { status: 503 });
  }

  const cart = await getCart();
  if (!cart.id || cart.lines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const shippingType = typeof body?.shippingType === "string" ? body.shippingType : "standard";
  const { total } = computeTotals(cart.subtotalCents, shippingType);

  try {
    const order = await createRazorpayOrder(total, `jr_${Date.now()}`);
    return NextResponse.json({
      keyId: razorpayKeyId(),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (e) {
    console.error("Razorpay order error:", e);
    return NextResponse.json({ error: "Could not start payment. Try again." }, { status: 502 });
  }
}
