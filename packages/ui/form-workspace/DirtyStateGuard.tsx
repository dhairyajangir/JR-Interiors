"use client";

import { useEffect } from "react";

interface DirtyStateGuardProps {
  isDirty: boolean;
}

export function DirtyStateGuard({ isDirty }: DirtyStateGuardProps) {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = "You have unsaved changes. Are you sure you want to leave?";
      e.returnValue = message; // Standard
      return message; // Legacy
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  return null;
}
