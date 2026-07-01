"use client";

import React, { useState, useEffect, useRef } from "react";
import { useKeyboardShortcut } from "@jr/command";
import { Keyboard, X } from "lucide-react";

export function ShortcutHelpModal() {
  const [isOpen, setIsOpen] = useState(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Bind '?' key globally to open help (if not typing in input)
  useKeyboardShortcut(["?"], () => {
    setIsOpen(true);
  });

  // Bind 'Esc' key to close help if it's currently open
  useKeyboardShortcut(["Escape"], () => {
    setIsOpen(false);
  }, !isOpen);

  // Listen for programmatic open trigger events (e.g. from user menu click)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-shortcut-help", handleOpen);
    return () => window.removeEventListener("open-shortcut-help", handleOpen);
  }, []);

  // Capture/restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    } else {
      if (previousFocusRef.current) {
        const el = previousFocusRef.current;
        setTimeout(() => el.focus(), 50);
        previousFocusRef.current = null;
      }
    }
  }, [isOpen]);

  // Tab key trap inside modal keydown listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const sections = [
    {
      title: "Global Shortcuts",
      shortcuts: [
        { keys: ["⌘", "K"], description: "Open Command Palette (Mac)" },
        { keys: ["Ctrl", "K"], description: "Open Command Palette (Windows/Linux)" },
        { keys: ["/"], description: "Focus global search / open command palette" },
        { keys: ["?"], description: "Open keyboard shortcuts help panel" },
        { keys: ["Esc"], description: "Close active overlay, drawer, or dialog" },
      ],
    },
    {
      title: "Navigation Shortcuts (Palette)",
      shortcuts: [
        { keys: ["↑", "↓"], description: "Navigate items in active lists" },
        { keys: ["Enter"], description: "Execute selected item action" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-xs"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcut-title"
        className="relative bg-panel border border-muted w-full max-w-md rounded-md luxury-shadow-md p-6 overflow-hidden animate-fade-in z-50 text-left focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-muted pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-bronze/10 text-bronze">
              <Keyboard className="h-4 w-4" />
            </div>
            <h2 id="shortcut-title" className="text-sm font-semibold uppercase tracking-wider text-primary">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-secondary hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-bronze/50 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-secondary/60">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.shortcuts.map((shortcut, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-secondary font-light">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center space-x-1 shrink-0">
                      {shortcut.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          {keyIdx > 0 && <span className="text-secondary/40 text-[10px]">+</span>}
                          <kbd className="px-1.5 py-0.5 min-w-[20px] text-center font-mono text-[10px] text-primary border border-muted bg-base rounded luxury-shadow-sm font-semibold">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-muted text-center">
          <p className="text-[10px] text-secondary font-light">
            Press <kbd className="px-1 py-0.5 text-[9px] font-mono border border-muted bg-base rounded">Esc</kbd> to close at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
