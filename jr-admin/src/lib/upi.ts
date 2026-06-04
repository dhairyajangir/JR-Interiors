export type UpiConfig = {
  payeeVpa: string;
  payeeName: string;
  registrationFeeInr: number;
};

export function getUpiConfig(): UpiConfig {
  const rawFee = Number.parseInt(process.env.REGISTRATION_FEE_INR ?? "1499", 10);
  return {
    payeeVpa: process.env.UPI_PAYEE_VPA ?? "jradminconsole@upi",
    payeeName: process.env.UPI_PAYEE_NAME ?? "JR Admin Console",
    registrationFeeInr: Number.isFinite(rawFee) && rawFee > 0 ? rawFee : 1499,
  };
}

export function buildPaymentReference(email: string): string {
  const prefix = email.split("@")[0]?.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase() || "USER";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `JR${Date.now().toString().slice(-6)}${prefix}${suffix}`;
}

export function buildUpiLink(args: {
  payeeVpa: string;
  payeeName: string;
  amountInr: number;
  reference: string;
  note: string;
}): string {
  const params = new URLSearchParams({
    pa: args.payeeVpa,
    pn: args.payeeName,
    am: args.amountInr.toFixed(2),
    cu: "INR",
    tr: args.reference,
    tn: args.note,
  });
  return `upi://pay?${params.toString()}`;
}
