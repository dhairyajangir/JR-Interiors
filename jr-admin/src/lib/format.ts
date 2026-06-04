const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatInr(value: number): string {
  return INR.format(value);
}

export function formatDate(value: Date): string {
  return DATE.format(value);
}
