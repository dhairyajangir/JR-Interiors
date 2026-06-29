"use client";

import { useActionState } from "react";
import { requestConsultation } from "@/app/contact-actions";
import { Icon } from "@/components/Icon";
import { Honeypot } from "@/components/Honeypot";

const FIELD =
  "w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition";
const LABEL = "text-label-sm text-primary block mb-2";

export function ConsultationForm() {
  const [state, action, pending] = useActionState(requestConsultation, undefined);

  if (state?.ok) {
    return (
      <div className="bg-secondary-container/40 rounded-xl p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-4">
          <Icon name="check" className="text-2xl" />
        </div>
        <h3 className="text-subheading text-primary mb-2">Request received</h3>
        <p className="text-body-md text-on-surface-variant">
          Thank you - a member of our design studio will be in touch within one business day to confirm your consultation.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <Honeypot />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={LABEL} htmlFor="name">Name</label>
          <input id="name" name="name" required aria-required="true" autoComplete="name" placeholder="Your name" className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required aria-required="true" autoComplete="email" placeholder="you@example.com" className={FIELD} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={LABEL} htmlFor="phone">Phone (optional)</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="(555) 000-0000" className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="type">Project type</label>
          <select id="type" name="projectType" className={FIELD} defaultValue="Single room">
            <option>Single room</option>
            <option>Whole home</option>
            <option>Bespoke commission</option>
            <option>Just exploring</option>
          </select>
        </div>
      </div>
      <div>
        <fieldset className="border border-outline-variant/60 rounded-lg p-4">
          <legend className="text-label-sm text-primary px-2 font-semibold">Preferred Consultation Type *</legend>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2 text-body-md text-on-surface cursor-pointer">
              <input type="radio" name="consultation" value="in-home" defaultChecked required className="text-primary focus:ring-primary w-4 h-4 accent-primary" />
              In-home consultation
            </label>
            <label className="flex items-center gap-2 text-body-md text-on-surface cursor-pointer">
              <input type="radio" name="consultation" value="virtual" className="text-primary focus:ring-primary w-4 h-4 accent-primary" />
              Virtual consultation
            </label>
          </div>
        </fieldset>
      </div>
      <div>
        <label className={LABEL} htmlFor="message">Tell us about your space</label>
        <textarea id="message" name="message" rows={4} placeholder="A few words about the room, the feeling you want, and your timeline..." className={FIELD} />
      </div>
      {state?.error ? (
        <p className="rounded-lg bg-error-container/50 px-4 py-3 text-label-sm text-on-error-container">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-on-primary py-4 rounded-lg font-label-sm hover:opacity-90 transition active:scale-[0.98] disabled:opacity-70"
      >
        {pending ? "Sending request..." : "Request Consultation"}
      </button>
      <p className="text-label-xs text-on-surface-variant text-center">We reply within one business day. No obligation.</p>
    </form>
  );
}
