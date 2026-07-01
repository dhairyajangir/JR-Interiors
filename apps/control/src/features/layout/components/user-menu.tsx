"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCurrentUser, useAuth } from "../../auth/hooks";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Lock,
  Monitor,
  Sliders,
  Keyboard,
  BookOpen,
  LogOut,
  ChevronDown,
  Sun,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export function UserMenu() {
  const user = useCurrentUser();
  const { logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Esc key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!user) return null;

  // Initials for avatar
  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "JR";

  const sections = [
    {
      groupName: "Account",
      items: [
        {
          label: "Profile",
          icon: UserIcon,
          action: () => router.push("/dashboard/settings#profile"),
        },
        {
          label: "Security",
          icon: Lock,
          action: () => router.push("/dashboard/settings#security"),
        },
        {
          label: "Sessions",
          icon: Monitor,
          action: () => router.push("/dashboard/settings#sessions"),
        },
        {
          label: "Preferences",
          icon: Sliders,
          action: () => router.push("/dashboard/settings#preferences"),
        },
      ],
    },
    {
      groupName: "Workspace",
      items: [
        {
          label: "Theme: Light",
          icon: Sun,
          action: () => toast.info("Theme selection is coming soon (Sprint 2 Phase C)."),
        },
        {
          label: "Keyboard Shortcuts",
          icon: Keyboard,
          action: () => {
            window.dispatchEvent(new CustomEvent("open-shortcut-help"));
          },
        },
        {
          label: "Documentation",
          icon: BookOpen,
          action: () => toast.info("System documentation is currently loading."),
        },
        {
          label: "About JR Control",
          icon: Info,
          action: () => toast.info("JR Control OS v1.0.1. Elegant Digital Atelier."),
        },
      ],
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center space-x-2.5 p-1.5 rounded-md hover:bg-base transition-colors duration-150 text-left focus:outline-none focus:ring-1 focus:ring-bronze/50 cursor-pointer"
      >
        <div className="h-8 w-8 rounded-full bg-bronze/10 border border-bronze/20 flex items-center justify-center text-xs font-semibold text-bronze tracking-wider select-none">
          {initials}
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-semibold text-primary leading-tight">
            {user.fullName}
          </p>
          <p className="text-[10px] text-secondary font-mono leading-none mt-0.5">
            {user.role}
          </p>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 mt-2 w-56 rounded-md border border-muted bg-panel luxury-shadow-md py-1 z-50 animate-fade-in origin-top-right focus:outline-none"
        >
          {/* Header Info */}
          <div className="px-4 py-2.5 border-b border-muted flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-primary truncate">{user.fullName}</p>
              <p className="text-[10px] text-secondary truncate mt-0.5">{user.email}</p>
            </div>
            {/* Session Indicator badge */}
            <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-success-bg border border-success-border text-success text-[8px] font-medium font-mono shrink-0 select-none">
              <span className="h-1 w-1 rounded-full bg-success animate-pulse" />
              <span>ACTIVE</span>
            </div>
          </div>

          {/* Grouped Options */}
          <div className="divide-y divide-muted/30">
            {sections.map((section) => (
              <div key={section.groupName} className="py-1">
                <div className="px-3 py-1 text-[8px] font-bold uppercase tracking-wider text-secondary/40 select-none">
                  {section.groupName}
                </div>
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setIsOpen(false);
                      item.action();
                    }}
                    role="menuitem"
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-primary hover:bg-base hover:text-bronze transition-colors duration-150 text-left cursor-pointer"
                  >
                    <item.icon className="h-4 w-4 text-secondary shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Action Trigger / Logout */}
          <div className="border-t border-muted py-1 bg-sidebar/10">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              disabled={isLoading}
              role="menuitem"
              className="flex w-full items-center space-x-2 px-4 py-2 text-xs text-error hover:bg-error-bg hover:text-error transition-colors duration-150 text-left disabled:opacity-50 cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>{isLoading ? "Signing Out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
