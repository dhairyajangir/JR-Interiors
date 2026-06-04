"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";

const fieldClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-steel/60 focus:border-mint";

export function LoginForm() {
  const [state, action] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-ink" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required className={fieldClass} placeholder="you@brand.com" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink" htmlFor="password">
          Password
        </label>
        <input id="password" name="password" type="password" required className={fieldClass} placeholder="Minimum 8 characters" />
      </div>

      {state?.error ? <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{state.error}</p> : null}

      <SubmitButton
        label="Enter dashboard"
        pendingLabel="Signing in..."
        className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-mint disabled:opacity-70"
      />

      <p className="text-sm text-steel">
        New here?{" "}
        <Link href="/register" className="font-semibold text-mint">
          Create account
        </Link>
      </p>
    </form>
  );
}
