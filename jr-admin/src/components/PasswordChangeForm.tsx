"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";

const fieldClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-steel/60 focus:border-mint";

export function PasswordChangeForm() {
  const [state, action] = useActionState(changePassword, undefined);

  return (
    <form action={action} className="mt-5 space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-ink" htmlFor="currentPassword">
          Current password
        </label>
        <input id="currentPassword" name="currentPassword" type="password" className={fieldClass} required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-ink" htmlFor="nextPassword">
          New password
        </label>
        <input id="nextPassword" name="nextPassword" type="password" className={fieldClass} minLength={8} required />
      </div>
      {state?.error ? (
        <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{state.error}</p>
      ) : null}
      <SubmitButton
        label="Change password"
        pendingLabel="Updating..."
        className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-mint disabled:opacity-70"
      />
    </form>
  );
}
