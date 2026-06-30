import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { createOrderFromCart } from "@/lib/orders";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    shipping,
  } = body as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    shipping?: Record<string, string>;
  };

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const s = shipping ?? {};
  const result = await createOrderFromCart({
    email: s.email ?? "",
    fullName: s.fullName ?? "",
    phone: s.phone,
    address1: s.address1 ?? "",
    address2: s.address2,
    city: s.city ?? "",
    region: s.region ?? "",
    postalCode: s.postalCode ?? "",
    country: s.country || "India",
    shippingType: s.shippingType || "standard",
    saveAddress: s.saveAddress === "on",
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ number: result.number });
}
