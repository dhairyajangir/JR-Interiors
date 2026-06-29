"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";

const fieldClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-steel/60 focus:border-mint";

export function RegisterForm() {
  const [state, action] = useActionState(register, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink" htmlFor="fullName">
            Full name
          </label>
          <input id="fullName" name="fullName" required className={fieldClass} placeholder="Mahima Gupta" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink" htmlFor="businessName">
            Business name
          </label>
          <input id="businessName" name="businessName" required className={fieldClass} placeholder="Studio North" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink" htmlFor="email">
            Work email
          </label>
          <input id="email" name="email" type="email" required className={fieldClass} placeholder="you@brand.com" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink" htmlFor="phone">
            Phone
          </label>
          <input id="phone" name="phone" className={fieldClass} placeholder="+91 98765 43210" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink" htmlFor="password">
          Password
        </label>
        <input id="password" name="password" type="password" required minLength={8} className={fieldClass} placeholder="Use 8 or more characters" />
      </div>

      {state?.error ? <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{state.error}</p> : null}

      <div className="rounded-3xl border border-line bg-sand/80 px-5 py-4 text-sm text-steel">
        Account created first. Then we take you to direct UPI checkout with ready-to-pay amount, payee ID, and payment reference.
      </div>

      <SubmitButton
        label="Create account"
        pendingLabel="Creating account..."
        className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-mint disabled:opacity-70"
      />

      <p className="text-sm text-steel">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-mint hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
