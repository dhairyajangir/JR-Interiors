"use client";

import { useState, useTransition } from "react";
import { enable2FA, disable2FA, prepare2FASetup } from "@/app/actions";

export function TwoFactorSettings({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [step, setStep] = useState(0); // 0 = default, 1 = show setup QR
  const [secret, setSecret] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSetup() {
    setError("");
    startTransition(async () => {
      try {
        const res = await prepare2FASetup();
        setSecret(res.secret);
        setQrDataUrl(res.qrDataUrl);
        setStep(1);
      } catch (err: any) {
        setError(err.message || "Failed to prepare 2FA setup.");
      }
    });
  }

  function handleVerify() {
    setError("");
    if (code.trim().length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    startTransition(async () => {
      const res = await enable2FA(secret, code);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setEnabled(true);
        setStep(0);
        setCode("");
        setSecret("");
        setQrDataUrl("");
      }
    });
  }

  function handleDisable() {
    setError("");
    if (!window.confirm("Are you sure you want to disable two-factor authentication? This reduces your workspace security.")) {
      return;
    }
    startTransition(async () => {
      const res = await disable2FA();
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setEnabled(false);
        setStep(0);
      }
    });
  }

  const fieldClass =
    "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-steel/60 focus:border-mint";

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">
          {error}
        </div>
      ) : null}

      {enabled ? (
        <div className="rounded-2xl border border-line bg-mist p-5">
          <div className="flex items-start gap-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint/10 text-mint text-xl font-bold">
              ✓
            </span>
            <div>
              <h3 className="text-sm font-semibold text-ink">Two-Factor Authentication is Active</h3>
              <p className="mt-1 text-xs text-steel">
                Your account is protected by an additional verification layer. You will be prompted for a passcode during sign-in.
              </p>
              <button
                type="button"
                disabled={pending}
                onClick={handleDisable}
                className="mt-4 rounded-full border border-coral/30 bg-white px-4 py-2 text-xs font-semibold text-coral transition hover:bg-coral/5 disabled:opacity-60"
              >
                {pending ? "Disabling..." : "Disable 2FA"}
              </button>
            </div>
          </div>
        </div>
      ) : step === 1 ? (
        <div className="rounded-2xl border border-line bg-white p-5 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-ink">Set up Authenticator App</h3>
            <p className="mt-1 text-xs text-steel leading-relaxed">
              Scan this QR code with Google Authenticator, Authy, or your password manager.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-mist rounded-xl border border-line">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="2FA QR Code" className="h-44 w-44 object-contain" />
            ) : (
              <div className="h-44 w-44 flex items-center justify-center text-xs text-steel">Generating QR...</div>
            )}
            <div className="mt-3 text-center">
              <p className="text-[10px] uppercase font-bold text-steel">Manual Setup Key</p>
              <code className="text-xs font-mono select-all bg-white px-2 py-1 rounded border border-line block mt-1 tracking-wider text-ink font-semibold">
                {secret}
              </code>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-ink" htmlFor="verificationCode">
              Enter 6-Digit Passcode to Verify
            </label>
            <input
              id="verificationCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={fieldClass}
              placeholder="e.g. 123456"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={handleVerify}
              className="flex-1 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-mint disabled:opacity-75"
            >
              {pending ? "Verifying..." : "Verify & Enable"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setStep(0)}
              className="rounded-full border border-line bg-white px-5 py-2.5 text-xs font-semibold text-steel transition hover:bg-mist disabled:opacity-75"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-start gap-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-steel/10 text-steel text-lg font-bold">
              !
            </span>
            <div>
              <h3 className="text-sm font-semibold text-ink">Two-Factor Authentication is Disabled</h3>
              <p className="mt-1 text-xs text-steel leading-relaxed">
                Add an extra layer of security to your admin account by requiring a verification code at login.
              </p>
              <button
                type="button"
                disabled={pending}
                onClick={handleSetup}
                className="mt-4 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-mint disabled:opacity-60"
              >
                {pending ? "Loading..." : "Set up 2FA"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
