"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, PackagePlus, FilePlus2, UserPlus, FilePlus, X } from "lucide-react";
import { toast } from "sonner";

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const handleAction = (label: string) => {
    setIsOpen(false);
    toast.info(`Triggered: ${label}`, {
      description: "Business module CRUD implementation is scheduled for later Sprints.",
    });
  };

  const actionItems = [
    { label: "New Product", icon: PackagePlus, shortcut: "N+P" },
    { label: "New Quotation", icon: FilePlus2, shortcut: "N+Q" },
    { label: "New Customer", icon: UserPlus, shortcut: "N+C" },
    { label: "New Order", icon: FilePlus, shortcut: "N+O" },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Plus Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-md border border-muted text-secondary hover:text-primary hover:border-heavy hover:bg-base/35 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-bronze/50"
        title="Quick Actions (Alt+N)"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Open quick actions menu"
      >
        <Plus className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Quick actions menu"
          className="absolute right-0 mt-2 w-48 rounded-md border border-muted bg-panel luxury-shadow-md py-1 z-50 animate-fade-in origin-top-right focus:outline-none"
        >
          {/* Header */}
          <div className="px-3 py-1.5 border-b border-muted bg-sidebar/40 select-none">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
              Quick Creation
            </span>
          </div>

          {/* Action Options */}
          <div className="py-1">
            {actionItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleAction(item.label)}
                role="menuitem"
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-primary hover:bg-base hover:text-bronze transition-colors duration-150 text-left cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <item.icon className="h-4 w-4 text-secondary shrink-0 group-hover:text-bronze" />
                  <span>{item.label}</span>
                </div>
                <kbd className="hidden sm:inline-block text-[8px] font-mono text-secondary/50 select-none">
                  {item.shortcut}
                </kbd>
              </button>
            ))}
          </div>

          {/* Footer Info */}
          <div className="border-t border-muted py-1 bg-sidebar/20 text-center select-none">
            <span className="text-[9px] text-secondary/60 font-mono">
              Alt + N shortcuts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
