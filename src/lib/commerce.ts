// Single source of truth for money math. Amounts in integer paise.

/** GST on furniture in India is 18%. */
export const GST_RATE = 0.18;

/** Delivery options (paise). White-glove standard is free; express is ₹2,500. */
export const SHIPPING = { standard: 0, express: 250000 } as const;
export type ShippingType = keyof typeof SHIPPING;

export function shippingCost(type: string): number {
  return SHIPPING[(type as ShippingType)] ?? 0;
}

export type Totals = {
  subtotal: number;
  shipping: number;
  gst: number;
  total: number;
};

export function computeTotals(subtotalPaise: number, shippingType: string): Totals {
  const shipping = shippingCost(shippingType);
  const gst = Math.round(subtotalPaise * GST_RATE);
  return { subtotal: subtotalPaise, shipping, gst, total: subtotalPaise + shipping + gst };
}
