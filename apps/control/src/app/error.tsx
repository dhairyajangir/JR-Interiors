"use client";

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-md p-8 bg-panel rounded-md border border-muted luxury-shadow-md text-center space-y-6">
        <div className="flex justify-center text-error">
          <AlertCircle className="h-12 w-12 text-error" />
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-primary">An unexpected error occurred</h2>
          <p className="text-xs text-secondary leading-relaxed font-light">
            {error.message || "Something went wrong inside the operational workspace."}
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center py-2 px-4 border border-heavy hover:border-bronze hover:text-bronze text-xs font-medium rounded-md w-full bg-panel space-x-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
}
