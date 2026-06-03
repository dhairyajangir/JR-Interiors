"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Icon } from "@/components/Icon";
import { login, register, type AuthState } from "@/app/auth-actions";

const FIELD =
  "w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition";
const LABEL = "text-label-sm text-primary block mb-2";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const action = mode === "login" ? login : register;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div role="alert" className="flex items-start gap-2 bg-error-container text-on-error-container rounded-lg px-4 py-3 text-label-sm">
          <Icon name="error" className="text-[18px]" />
          {state.error}
        </div>
      )}

      {mode === "register" && (
        <div>
          <label className={LABEL} htmlFor="fullName">Full name</label>
          <input id="fullName" name="fullName" required autoComplete="name" placeholder="Jane Doe" className={FIELD} />
        </div>
      )}

      <div>
        <label className={LABEL} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={FIELD} />
      </div>

      <div>
        <label className={LABEL} htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
          className={FIELD}
        />
      </div>

      <button type="submit" disabled={pending} className="w-full bg-primary text-on-primary py-4 rounded-lg font-label-sm hover:opacity-90 transition active:scale-[0.98] disabled:opacity-70">
        {pending ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
      </button>

      <p className="text-label-sm text-on-surface-variant text-center">
        {mode === "login" ? (
          <>New to JR Interiors? <Link href="/account/register" className="text-primary font-semibold hover:underline">Create an account</Link></>
        ) : (
          <>Already have an account? <Link href="/account/login" className="text-primary font-semibold hover:underline">Sign in</Link></>
        )}
      </p>
    </form>
  );
}
