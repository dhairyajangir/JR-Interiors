import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/** True when Razorpay keys are present (test or live). */
export function razorpayEnabled(): boolean {
  return Boolean(KEY_ID && KEY_SECRET);
}

export function razorpayKeyId(): string | null {
  return KEY_ID ?? null;
}

type RzpOrder = { id: string; amount: number; currency: string };

/** Create a Razorpay order via REST (amount in paise). */
export async function createRazorpayOrder(
  amountPaise: number,
  receipt: string
): Promise<RzpOrder> {
  if (!razorpayEnabled()) throw new Error("Razorpay not configured");
  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      payment_capture: 1,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as RzpOrder;
  return { id: data.id, amount: data.amount, currency: data.currency };
}

/** Verify the payment signature returned by Razorpay Checkout. */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!KEY_SECRET) return false;
  const expected = createHmac("sha256", KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
