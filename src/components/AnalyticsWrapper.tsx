"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export function AnalyticsWrapper() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    function checkConsent() {
      try {
        const consentRow = document.cookie
          .split("; ")
          .find((row) => row.startsWith("jr_cookie_consent="));
        
        if (consentRow) {
          const consentVal = JSON.parse(decodeURIComponent(consentRow.split("=")[1]));
          setConsented(Boolean(consentVal.analytics));
        } else {
          setConsented(false);
        }
      } catch (e) {
        setConsented(false);
      }
    }

    checkConsent();
    window.addEventListener("jr_cookie_consent_updated", checkConsent);
    return () => {
      window.removeEventListener("jr_cookie_consent_updated", checkConsent);
    };
  }, []);

  if (!consented) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
