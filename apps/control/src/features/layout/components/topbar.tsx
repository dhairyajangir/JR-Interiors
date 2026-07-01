"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { UserMenu } from "./user-menu";
import { NAVIGATION_CONFIG } from "../config/navigation";
import { NotificationCenter } from "./notification-center";
import { QuickActions } from "./quick-actions";
import {
  Menu,
  Search,
  Sun,
  ChevronRight,
} from "lucide-react";

interface TopbarProps {
  onOpenMobile: () => void;
}

export function Topbar({ onOpenMobile }: TopbarProps) {
  const pathname = usePathname();

  // Dynamic breadcrumb generation from navigation configuration
  const getBreadcrumbs = () => {
    for (const group of NAVIGATION_CONFIG) {
      for (const item of group.items) {
        if (pathname === item.href) {
          return [group.groupName, item.title];
        }
        if (item.children) {
          for (const child of item.children) {
            if (pathname === child.href) {
              return [group.groupName, item.title, child.title];
            }
          }
        }
      }
    }
    // Fallback: capitalize path segments
    const segments = pathname.split("/").filter(Boolean);
    return segments.map(
      (seg) => seg.charAt(0).toUpperCase() + seg.slice(1)
    );
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 right-0 z-20 h-16 bg-panel/90 backdrop-blur-md border-b border-muted flex items-center justify-between px-4 md:px-6 shadow-sm">
      {/* Left side: Hamburger (mobile) + Breadcrumbs */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-1.5 -ml-1 rounded-md text-secondary hover:text-primary hover:bg-base focus:outline-none focus:ring-1 focus:ring-bronze/50 cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center space-x-1.5">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-secondary/40 shrink-0" />}
                <span
                  className={`text-xs ${
                    isLast
                      ? "font-medium text-primary"
                      : "text-secondary font-light"
                  }`}
                >
                  {crumb}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right side: Global Search, Quick Actions, Notifications, User Menu */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Session Status Dot */}
        <div 
          className="flex items-center space-x-1.5 px-2 py-1 rounded bg-success-bg border border-success-border text-success text-[10px] font-medium font-mono hidden lg:flex"
          title="Supabase security active"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span>CONNECTED</span>
        </div>

        {/* Global Search Input Trigger */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
          className="relative w-44 md:w-56 text-left flex items-center px-3 py-1.5 text-xs border border-muted rounded-md bg-base/50 text-secondary hover:border-heavy hover:bg-base/80 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-bronze/50 hidden sm:flex"
          title="Search / Command Palette"
        >
          <Search className="h-3.5 w-3.5 mr-2 shrink-0 text-secondary/65" />
          <span className="truncate flex-1 text-secondary/70">Spotlight search...</span>
          <kbd className="px-1.5 py-0.5 text-[8px] font-mono text-secondary/60 border border-muted bg-panel rounded select-none shrink-0 ml-1">
            ⌘K
          </kbd>
        </button>

        {/* Quick Actions (Plus Dropdown) */}
        <div className="hidden md:block">
          <QuickActions />
        </div>

        {/* Theme Toggle Placeholder */}
        <button
          disabled
          className="p-1.5 rounded-md text-secondary hover:text-primary hover:bg-base transition-colors duration-150 cursor-not-allowed opacity-60"
          title="Theme Toggle (Light Mode Default)"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4" />
        </button>

        {/* Notifications Center Panel */}
        <NotificationCenter />

        {/* Separator */}
        <span className="h-5 w-px bg-muted" />

        {/* User Account Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
