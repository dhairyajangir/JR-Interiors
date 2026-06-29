"use client";

import Link from "next/link";
import { useActionState } from "react";
import { demoLogin, login } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";

const fieldClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-steel/60 focus:border-mint";

export function LoginForm({ demoEnabled }: { demoEnabled: boolean }) {
  const [state, action] = useActionState(login, undefined);
  const [demoState, demoAction] = useActionState(demoLogin, undefined);

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
      {demoState?.error ? <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{demoState.error}</p> : null}

      <SubmitButton
        label="Enter dashboard"
        pendingLabel="Signing in..."
        className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-mint disabled:opacity-70"
      />

      {demoEnabled ? (
        <div className="rounded-2xl border border-line bg-mist p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-mint">Demo access</p>
          <p className="mt-1 text-xs text-steel font-medium">Quick admin sign-in for pre-deployment testing.</p>
          <div className="mt-3 rounded-xl border border-line bg-white px-3 py-2 text-xs text-steel font-semibold">
            <p className="text-ink">admin@jrinteriors.com</p>
            <p className="mt-0.5">Password: Demo@Admin2024</p>
          </div>
          <button
            formAction={demoAction}
            formNoValidate
            className="mt-4 w-full rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-steel transition hover:bg-mist hover:border-ink hover:text-ink"
          >
            Quick Demo Login
          </button>
        </div>
      ) : null}

      <p className="text-sm text-steel">
        New here?{" "}
        <Link href="/register" className="font-semibold text-mint hover:underline">
          Create account
        </Link>
      </p>
    </form>
  );
}
