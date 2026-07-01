"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandProvider } from "../../../providers/command-provider";
import { CommandPalette } from "./command-palette";
import { ShortcutHelpModal } from "./shortcut-help";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Sync collapsible state with localStorage on mount to prevent SSR hydration mismatches
  useEffect(() => {
    setIsMounted(true);
    const savedState = localStorage.getItem("jr-sidebar-collapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  const handleToggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("jr-sidebar-collapsed", String(nextState));
  };

  return (
    <CommandProvider>
      {/* Skip Navigation Link for accessibility (WCAG 2.1 AA) */}
      <a
        href="#main-content"
        className="absolute left-4 -top-20 focus:top-4 focus:z-50 bg-bronze text-panel border border-bronze hover:bg-bronze/90 text-xs font-semibold py-2.5 px-4 rounded shadow-md transition-all duration-150 uppercase tracking-wider outline-none focus:ring-2 focus:ring-gold"
      >
        Skip to main content
      </a>

      <div className="min-h-screen bg-base text-primary antialiased flex">
        {/* Premium Collapsible Navigation Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Main Layout Area */}
        <div
          className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-200 ease-in-out ${
            isMounted
              ? isCollapsed
                ? "md:pl-20"
                : "md:pl-[280px]"
              : "md:pl-[280px]" // Default width on initial server render before mount hydration
          }`}
        >
          {/* Sticky Top Navigation Bar */}
          <Topbar onOpenMobile={() => setIsMobileOpen(true)} />

          {/* Dynamic Page Content Viewport */}
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 p-5 md:p-8 max-w-[1400px] w-full mx-auto focus:outline-none"
          >
            {children}
          </main>
        </div>
      </div>

      {/* Global productivity overlays */}
      <CommandPalette />
      <ShortcutHelpModal />
    </CommandProvider>
  );
}
