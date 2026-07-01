"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";

type CookiePreferences = {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    analytics: true,
    functional: true,
    marketing: false,
  });

  useEffect(() => {
    // Check if consent cookie exists
    const consent = document.cookie
      .split("; ")
      .find((row) => row.startsWith("jr_cookie_consent="));

    if (!consent) {
      setOpen(true);
    }
  }, []);

  function setConsentCookie(preferences: CookiePreferences) {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1); // 1 year expiry
    document.cookie = `jr_cookie_consent=${JSON.stringify(
      preferences
    )}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`;
    
    // Dispatch event to notify Analytics wrapper
    window.dispatchEvent(new Event("jr_cookie_consent_updated"));
    setOpen(false);
  }

  function handleAcceptAll() {
    const all = { analytics: true, functional: true, marketing: true };
    setConsentCookie(all);
  }

  function handleRejectAll() {
    const min = { analytics: false, functional: true, marketing: false };
    setConsentCookie(min);
  }

  function handleSavePrefs() {
    setConsentCookie(prefs);
  }

  if (!open) return null;

  return (
    <div 
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md bg-primary text-on-primary border border-on-primary/10 rounded-2xl p-6 shadow-2xl z-[999] animate-slide-up"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-on-primary/10 flex items-center justify-center shrink-0">
          <Icon name="cookie" className="text-xl" />
        </div>
        <div>
          <h3 id="cookie-consent-title" className="text-label-sm font-bold uppercase tracking-wider text-on-primary">
            Cookie Consent & DPDP Privacy
          </h3>
          <p id="cookie-consent-desc" className="text-xs text-on-primary/70 leading-relaxed mt-1">
            In compliance with the DPDP Act (India), we use cookies to provide secure forms, enhance your browsing experience, and analyze traffic. Data is retained for 365 days. You have the right to access, update, or request erasure of your data by contacting our Grievance Officer at{" "}
            <a href="mailto:adityajangid1409@gmail.com" className="underline font-semibold hover:text-on-primary transition-colors">
              adityajangid1409@gmail.com
            </a>{" "}
            or calling +91 94603 00750. Review our{" "}
            <Link href="/legal/cookies" className="underline font-semibold hover:text-on-primary transition-colors">
              Cookie Policy
            </Link>{" "}
            for details.
          </p>
        </div>
      </div>

      {showPrefs ? (
        <div className="bg-on-primary/5 rounded-xl p-4 mb-5 space-y-4 animate-fade-in border border-on-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold block">Essential Cookies</span>
              <span className="text-[10px] text-on-primary/50 block">Sessions, spam checking & security</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-on-primary/60 bg-on-primary/10 px-2 py-0.5 rounded">
              Required
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold block">Analytics Cookies</span>
              <span className="text-[10px] text-on-primary/50 block">Measure traffic and load times</span>
            </div>
            <input
              type="checkbox"
              checked={prefs.analytics}
              onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
              className="accent-secondary h-4 w-4 rounded border-on-primary/20 text-secondary focus:ring-0 focus:ring-offset-0"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold block">Marketing Cookies</span>
              <span className="text-[10px] text-on-primary/50 block">Tailored recommendations and releases</span>
            </div>
            <input
              type="checkbox"
              checked={prefs.marketing}
              onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
              className="accent-secondary h-4 w-4 rounded border-on-primary/20 text-secondary focus:ring-0 focus:ring-offset-0"
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {showPrefs ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSavePrefs}
              className="w-full bg-white text-primary py-3 rounded-lg font-bold text-label-xs uppercase tracking-widest hover:bg-surface-bright transition active:scale-[0.98]"
            >
              Save Preferences
            </button>
            <button
              onClick={() => setShowPrefs(false)}
              className="w-full border border-on-primary/20 text-on-primary py-3 rounded-lg font-bold text-label-xs uppercase tracking-widest hover:bg-on-primary/5 transition active:scale-[0.98]"
            >
              Back
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2.5">
              <button
                onClick={handleAcceptAll}
                className="flex-1 bg-white text-primary py-3 rounded-lg font-bold text-label-xs uppercase tracking-widest hover:bg-surface-bright transition active:scale-[0.98]"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectAll}
                className="flex-1 border border-on-primary/20 text-on-primary py-3 rounded-lg font-bold text-label-xs uppercase tracking-widest hover:bg-on-primary/5 transition active:scale-[0.98]"
              >
                Reject Non-Essential
              </button>
            </div>
            <button
              onClick={() => setShowPrefs(true)}
              className="w-full border border-on-primary/20 text-on-primary py-3 rounded-lg font-bold text-label-xs uppercase tracking-widest hover:bg-on-primary/5 transition active:scale-[0.98]"
            >
              Customize Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

