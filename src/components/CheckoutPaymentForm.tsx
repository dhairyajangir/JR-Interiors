"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

const KEY = "jr_checkout";

type Shipping = Record<string, string>;

export function CheckoutPaymentForm() {
  const [shipping, setShipping] = useState<Shipping | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (saved) setShipping(JSON.parse(saved));
    } catch {}
  }, []);

  if (!shipping) {
    return <div className="py-16 text-center text-on-surface-variant">Loading your enquiry details…</div>;
  }

  const fields = [
    ["fullName", "Full name"],
    ["email", "Email"],
    ["phone", "Phone"],
    ["city", "City"],
    ["region", "State"],
    ["postalCode", "PIN code"],
  ] as const;

  return (
    <div className="space-y-stack-md">
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6 md:p-8">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon name="chat_bubble" className="text-[20px]" />
          </div>
          <div>
            <h2 className="text-subheading text-primary mb-2">Your enquiry is ready</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              We will review your selections and contact you with pricing, delivery details, and next steps.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant/20 p-6 md:p-8">
        <h3 className="text-label-sm uppercase tracking-widest text-primary mb-4 font-bold">Enquiry Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-md">
          {fields.map(([key, label]) => (
            <div key={key}>
              <p className="text-label-xs uppercase tracking-widest text-on-surface-variant mb-1">{label}</p>
              <p className="text-primary">{shipping[key] || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6 md:p-8">
        <h3 className="text-label-sm uppercase tracking-widest text-primary mb-4 font-bold">What happens next</h3>
        <ul className="space-y-3 text-body-md text-on-surface-variant leading-relaxed">
          <li>1. Our team reviews your enquiry and product selection.</li>
          <li>2. We confirm availability, finish options, and delivery timeline.</li>
          <li>3. You receive a tailored quote and consultation follow-up.</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/checkout/shipping"
          className="w-full sm:w-auto flex-1 text-center border border-outline-variant rounded-lg py-4 font-semibold text-primary hover:bg-surface-container-low transition"
        >
          Edit enquiry details
        </Link>
        <Link
          href="/contact"
          className="w-full sm:w-auto flex-1 text-center bg-primary text-on-primary rounded-lg py-4 font-semibold hover:opacity-90 transition"
        >
          Send enquiry to team
        </Link>
      </div>
    </div>
  );
}
