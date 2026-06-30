"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/app/actions";
import { Icon } from "@/components/Icon";
import { Honeypot } from "@/components/Honeypot";

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, undefined);

  if (state?.ok) {
    return (
      <p className="text-secondary text-sm font-semibold animate-fade-in py-2">
        Thank you for joining the Atelier circle.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <Honeypot />
      <div className="flex border-b border-on-primary/20 pb-2 relative">
        <input
          required
          aria-label="Email address for newsletter"
          name="email"
          type="email"
          placeholder="Email Address"
          className="bg-transparent border-none focus:ring-0 w-full placeholder:text-on-primary/30 text-on-primary p-0 text-sm outline-none"
        />
        <button
          disabled={pending}
          aria-label="Subscribe"
          className="text-on-primary/40 hover:text-on-primary transition-colors disabled:opacity-50"
          type="submit"
        >
          <Icon name="arrow_forward" />
        </button>
      </div>
      
      {state?.error ? (
        <p className="text-xs text-error-container text-red-300 font-medium">
          {state.error}
        </p>
      ) : null}

      <p className="text-[10px] text-on-primary/50 leading-relaxed">
        By subscribing, you agree to our Privacy Policy and consent to receiving marketing communications.
      </p>
    </form>
  );
}
