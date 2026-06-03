"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="pt-32 pb-stack-lg min-h-[70vh] flex items-center">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
        <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-4 block">
          Something went wrong
        </span>
        <h1 className="font-display-hero text-display-hero-mobile text-primary mb-6">
          A moment of pause.
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-md mx-auto mb-10">
          We hit an unexpected snag. Please try again — if it persists, our studio is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-primary text-on-primary px-10 py-4 rounded-lg font-label-sm hover:opacity-90 transition"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-outline-variant text-primary px-10 py-4 rounded-lg font-label-sm hover:bg-surface-container-low transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
