"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

const FIELD =
  "w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition";
const LABEL = "text-label-sm text-primary block mb-2";

export function ConsultationForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="bg-secondary-container/40 rounded-xl p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-4">
          <Icon name="check" className="text-2xl" />
        </div>
        <h3 className="text-subheading text-primary mb-2">Request received</h3>
        <p className="text-body-md text-on-surface-variant">
          Thank you — a member of our design studio will be in touch within one business day to confirm your consultation.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={LABEL} htmlFor="name">Name</label>
          <input id="name" required autoComplete="name" placeholder="Your name" className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" placeholder="you@example.com" className={FIELD} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={LABEL} htmlFor="phone">Phone (optional)</label>
          <input id="phone" type="tel" autoComplete="tel" placeholder="(555) 000-0000" className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="type">Project type</label>
          <select id="type" className={FIELD} defaultValue="Single room">
            <option>Single room</option>
            <option>Whole home</option>
            <option>Bespoke commission</option>
            <option>Just exploring</option>
          </select>
        </div>
      </div>
      <div>
        <label className={LABEL} htmlFor="message">Tell us about your space</label>
        <textarea id="message" rows={4} placeholder="A few words about the room, the feeling you want, and your timeline…" className={FIELD} />
      </div>
      <button type="submit" className="w-full bg-primary text-on-primary py-4 rounded-lg font-label-sm hover:opacity-90 transition active:scale-[0.98]">
        Request Consultation
      </button>
      <p className="text-label-xs text-on-surface-variant text-center">We reply within one business day. No obligation.</p>
    </form>
  );
}
