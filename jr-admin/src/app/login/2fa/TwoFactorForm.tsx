"use client";

import { useActionState } from "react";
import { verify2FAAndLogin } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";

const fieldClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-steel/60 focus:border-mint text-center text-xl tracking-[0.5em] font-semibold";

export function TwoFactorForm({ tempToken }: { tempToken: string }) {
  const bindVerify = (_prev: any, fd: FormData) => {
    const code = ((fd.get("code") as string) ?? "").trim();
    return verify2FAAndLogin(tempToken, code);
  };
  const [state, action] = useActionState(bindVerify, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-center text-ink" htmlFor="code">
          Verification Code
        </label>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          autoComplete="one-time-code"
          autoFocus
          className={fieldClass}
          placeholder="000000"
        />
      </div>

      {state?.error ? (
        <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-center text-coral">
          {state.error}
        </p>
      ) : null}

      <SubmitButton
        label="Verify & Login"
        pendingLabel="Verifying..."
        className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-mint disabled:opacity-70"
      />
    </form>
  );
}
