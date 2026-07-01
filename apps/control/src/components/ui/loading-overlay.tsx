"use client";

import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message?: string;
  fixed?: boolean; // If true, overlays the entire screen, otherwise overlays parent (parent must have position: relative)
  visible: boolean;
}

export function LoadingOverlay({
  message = "Loading...",
  fixed = false,
  visible,
}: LoadingOverlayProps) {
  // Prevent background scrolling when fixed full-page overlay is visible
  useEffect(() => {
    if (fixed && visible) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      if (fixed) {
        document.body.style.overflow = "";
      }
    };
  }, [fixed, visible]);

  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-busy="true"
      aria-valuetext={message}
      className={`z-50 bg-panel/75 backdrop-blur-xs flex flex-col items-center justify-center space-y-3.5 select-none focus:outline-none ${
        fixed ? "fixed inset-0" : "absolute inset-0 rounded-md"
      }`}
    >
      {/* Premium Loader Ring Spinner */}
      <div className="relative flex items-center justify-center">
        <Loader2 className="h-7 w-7 text-bronze animate-spin shrink-0" />
        <div className="absolute h-3 w-3 rounded-full bg-gold/15" />
      </div>

      {message && (
        <span className="text-xs font-medium text-bronze tracking-wide font-mono animate-pulse">
          {message.toUpperCase()}
        </span>
      )}
    </div>
  );
}
