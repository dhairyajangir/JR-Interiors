"use client";

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface PageErrorProps {
  error?: Error | string | null;
  reset?: () => void;
  title?: string;
  message?: string;
}

export function PageError({
  error,
  reset,
  title = "Failed to load data",
  message = "There was an error retrieving information from the server. Please check your network connection and try again.",
}: PageErrorProps) {
  const errorMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10 border border-error-border rounded-md bg-error-bg/20 text-center w-full max-w-xl mx-auto my-6 select-none animate-fade-in">
      {/* Alert Triangle / Circle */}
      <div className="p-3 rounded-full bg-error-bg border border-error-border text-error mb-4 shrink-0">
        <AlertCircle className="h-5 w-5" />
      </div>

      {/* Message Info */}
      <div className="space-y-1.5 max-w-md mb-6">
        <h3 className="text-sm font-semibold tracking-tight text-primary font-display">
          {title}
        </h3>
        <p className="text-xs text-secondary leading-normal font-light">
          {message}
        </p>
      </div>

      {/* Developer Log Output */}
      {process.env.NODE_ENV === "development" && errorMessage && (
        <div className="w-full text-left bg-error-bg/40 border border-error-border rounded-md p-3 mb-6 max-h-[120px] overflow-auto select-text font-mono text-[9px] text-error whitespace-pre-wrap">
          <strong>Developer Log:</strong> {errorMessage}
        </div>
      )}

      {/* Retry recovery trigger button */}
      {reset && (
        <button
          onClick={reset}
          className="inline-flex items-center space-x-1.5 border border-muted hover:border-bronze/45 hover:bg-panel hover:text-bronze text-secondary text-xs font-semibold py-1.5 px-3.5 rounded-md transition-all duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-bronze/50 shadow-sm"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Retry Loading</span>
        </button>
      )}
    </div>
  );
}
export default PageError;
