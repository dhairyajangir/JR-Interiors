"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { INDIAN_STATES, PIN_PATTERN } from "@/lib/india";

const KEY = "jr_checkout";

const FIELD =
  "w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition";
const LABEL = "text-label-sm text-primary block mb-2";

export type SavedAddress = {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

export function CheckoutShippingForm({
  loggedIn = false,
  userEmail,
  userName,
  addresses = [],
}: {
  loggedIn?: boolean;
  userEmail?: string;
  userName?: string;
  addresses?: SavedAddress[];
}) {
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>({
    country: "India",
    shippingType: "standard",
    email: userEmail ?? "",
    fullName: userName ?? "",
  });

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (saved) {
        setV((cur) => ({ ...cur, ...JSON.parse(saved) }));
        return;
      }
    } catch {}
    // No draft yet: prefill from the user's default (first) saved address.
    if (addresses.length > 0) applyAddress(addresses[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyAddress(a: SavedAddress) {
    setV((cur) => ({
      ...cur,
      fullName: a.fullName,
      address1: a.line1,
      address2: a.line2 ?? "",
      city: a.city,
      region: a.region,
      postalCode: a.postalCode,
      country: a.country,
    }));
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setV((cur) => ({ ...cur, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem(KEY, JSON.stringify(v));
    router.push("/checkout/payment");
  }

  return (
    <form onSubmit={submit} className="space-y-stack-md">
      {addresses.length > 0 && (
        <fieldset>
          <legend className="text-subheading text-primary mb-4">Use a saved address</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {addresses.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => applyAddress(a)}
                className="text-left border border-outline-variant rounded-lg p-4 hover:border-primary hover:bg-surface-container-low transition"
              >
                <p className="text-label-sm font-semibold text-primary">{a.label}</p>
                <p className="text-label-xs text-on-surface-variant">
                  {a.fullName} · {a.line1}, {a.city} {a.region}
                </p>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-4">
        <legend className="text-subheading text-primary mb-4">Contact</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL} htmlFor="email">Email address</label>
            <input id="email" type="email" required autoComplete="email" placeholder="you@example.com" className={FIELD} value={v.email ?? ""} onChange={set("email")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="phone">Mobile number</label>
            <input id="phone" type="tel" required autoComplete="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} placeholder="98765 43210" className={FIELD} value={v.phone ?? ""} onChange={set("phone")} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-subheading text-primary mb-4">Shipping Address</legend>
        <div>
          <label className={LABEL} htmlFor="fullName">Full name</label>
          <input id="fullName" required autoComplete="name" placeholder="Jane Doe" className={FIELD} value={v.fullName ?? ""} onChange={set("fullName")} />
        </div>
        <div>
          <label className={LABEL} htmlFor="address1">Address</label>
          <input id="address1" required autoComplete="address-line1" placeholder="Flat / House no., Building, Street" className={FIELD} value={v.address1 ?? ""} onChange={set("address1")} />
        </div>
        <div>
          <label className={LABEL} htmlFor="address2">Area, landmark (optional)</label>
          <input id="address2" autoComplete="address-line2" placeholder="Colony, near landmark" className={FIELD} value={v.address2 ?? ""} onChange={set("address2")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={LABEL} htmlFor="city">City</label>
            <input id="city" required autoComplete="address-level2" placeholder="Mumbai" className={FIELD} value={v.city ?? ""} onChange={set("city")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="region">State</label>
            <select id="region" required autoComplete="address-level1" className={FIELD} value={v.region ?? ""} onChange={set("region")}>
              <option value="" disabled>Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="postalCode">PIN code</label>
            <input id="postalCode" required autoComplete="postal-code" inputMode="numeric" pattern={PIN_PATTERN} maxLength={6} placeholder="400001" className={FIELD} value={v.postalCode ?? ""} onChange={set("postalCode")} />
          </div>
        </div>
        <input type="hidden" name="country" value="India" />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-subheading text-primary mb-4">Delivery Method</legend>
        <label className="flex items-start gap-3 border border-outline-variant rounded-lg p-4 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-surface-container-low transition">
          <input type="radio" name="shippingType" value="standard" checked={v.shippingType === "standard"} onChange={set("shippingType")} className="mt-1 text-primary focus:ring-primary" />
          <div className="flex-1 flex justify-between">
            <div>
              <p className="text-label-sm text-primary font-semibold">White-Glove Standard</p>
              <p className="text-label-xs text-on-surface-variant">7–14 business days · in-room placement</p>
            </div>
            <span className="text-label-sm text-secondary font-semibold">Free</span>
          </div>
        </label>
        <label className="flex items-start gap-3 border border-outline-variant rounded-lg p-4 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-surface-container-low transition">
          <input type="radio" name="shippingType" value="express" checked={v.shippingType === "express"} onChange={set("shippingType")} className="mt-1 text-primary focus:ring-primary" />
          <div className="flex-1 flex justify-between">
            <div>
              <p className="text-label-sm text-primary font-semibold">Express Concierge</p>
              <p className="text-label-xs text-on-surface-variant">3–5 business days · priority handling</p>
            </div>
            <span className="text-label-sm text-primary font-semibold">₹2,500</span>
          </div>
        </label>
      </fieldset>

      {loggedIn && (
        <label className="flex items-center gap-2 text-label-sm text-on-surface-variant cursor-pointer">
          <input
            type="checkbox"
            checked={v.saveAddress === "on"}
            onChange={(e) => setV((cur) => ({ ...cur, saveAddress: e.target.checked ? "on" : "" }))}
            className="text-primary focus:ring-primary rounded"
          />
          Save this address to my account
        </label>
      )}

      <button type="submit" className="w-full bg-primary text-on-primary py-4 rounded-lg font-label-sm hover:opacity-90 transition active:scale-[0.98]">
        Continue to Payment
      </button>
    </form>
  );
}
