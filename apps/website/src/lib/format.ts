// Money is stored as integer paise (1 rupee = 100 paise). Indian retail shows
// whole rupees with the Indian digit grouping system (₹1,45,000 / ₹1,23,45,678).
const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Format integer paise as Indian Rupees, e.g. 8500000 -> ₹85,000 */
export function price(paise: number): string {
  return inr.format(Math.round(paise) / 100);
}

/** Alias kept for cart/checkout call sites — INR has no paise in retail display. */
export const priceExact = price;

export const CURRENCY = "INR";
export const CURRENCY_SYMBOL = "₹";
