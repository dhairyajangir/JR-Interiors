"use client";

import dynamic from "next/dynamic";

const AnalyticsWrapper = dynamic(() => import("./AnalyticsWrapper").then((m) => m.AnalyticsWrapper), { ssr: false });
const CookieConsent = dynamic(() => import("./CookieConsent").then((m) => m.CookieConsent), { ssr: false });

export function ClientOnlyComponents() {
  return (
    <>
      <AnalyticsWrapper />
      <CookieConsent />
    </>
  );
}
