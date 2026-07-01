"use client";

import React from "react";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-muted"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-bronze animate-spin"></div>
        </div>
        <div className="text-center animate-pulse">
          <h2 className="text-sm font-medium tracking-widest text-bronze uppercase">
            JR Interiors
          </h2>
          <p className="mt-1 text-xs text-secondary font-light">
            Securing operational console...
          </p>
        </div>
      </div>
    </div>
  );
}
