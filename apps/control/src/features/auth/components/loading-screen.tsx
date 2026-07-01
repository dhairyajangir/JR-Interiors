"use client";

import React from "react";
import Image from "next/image";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base">
      <div className="flex flex-col items-center space-y-6">
        {/* Loading: Icon Only brand logo gently rotating — per brand spec */}
        <div className="relative h-16 w-16 animate-logo-rotate">
          <Image
            src="/logos/icon.svg"
            alt="JR Interiors Loader"
            fill
            sizes="64px"
            className="object-contain"
            priority
          />
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
