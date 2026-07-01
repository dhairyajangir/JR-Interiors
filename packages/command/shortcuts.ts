"use client";

import { useEffect } from "react";

export function useKeyboardShortcut(
  keys: string[],
  callback: (event: KeyboardEvent) => void,
  disabled = false
) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const activeEl = document.activeElement;
      
      // Determine if focus is in a text input context to avoid triggering shortcuts on standard typing
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable);

      // 1. Combo check: Ctrl+K or Cmd+K
      const isCtrlK =
        keys.includes("ctrl") &&
        keys.includes("k") &&
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k";

      // 2. Simple single key check: e.g. '/' or '?'
      const isSimpleKey =
        keys.length === 1 &&
        event.key === keys[0] &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey;

      if (isCtrlK) {
        event.preventDefault();
        callback(event);
        return;
      }

      if (isSimpleKey && !isInputFocused) {
        event.preventDefault();
        callback(event);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keys, callback, disabled]);
}
