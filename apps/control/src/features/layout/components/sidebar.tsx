"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "../../auth/hooks";
import { NAVIGATION_CONFIG, NavigationItem } from "../config/navigation";
import { can } from "@jr/auth";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const user = useCurrentUser();

  // Helper to check if user has permission for an item
  const hasPermission = (item: NavigationItem) => {
    if (!item.permission) return true;
    if (!user) return false;
    return can(user, item.permission);
  };

  // Filter navigation configuration based on permissions
  const filteredNav = NAVIGATION_CONFIG.map((group) => {
    const items = group.items.filter(hasPermission);
    return { ...group, items };
  }).filter((group) => group.items.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar border-r border-muted select-none">
      {/* Brand Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-muted">
        <Link href="/dashboard" aria-label="JR Interiors — Atelier Control">
          {isCollapsed ? (
            /* Collapsed: Icon Only — per brand spec */
            <Image
              src="/logos/icon.svg"
              alt="JR Interiors"
              width={32}
              height={32}
              priority
              className="object-contain"
            />
          ) : (
            /* Expanded: Secondary Horizontal — per brand spec */
            <Image
              src="/logos/secondary-horizontal.svg"
              alt="JR Interiors"
              width={180}
              height={46}
              priority
              className="object-contain h-8 w-auto"
            />
          )}
        </Link>

        {/* Mobile close button only */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1 rounded-md text-secondary hover:text-primary focus:outline-none focus:ring-1 focus:ring-bronze/50 cursor-pointer"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {filteredNav.map((group) => (
          <div key={group.groupName} className="space-y-1.5">
            {/* Group Label */}
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-semibold uppercase tracking-wider text-secondary/60">
                {group.groupName}
              </h3>
            )}

            {/* Group Items */}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.title}>
                    <Link
                      href={item.href || "#"}
                      onClick={onCloseMobile}
                      title={isCollapsed ? item.title : undefined}
                      className={`relative flex items-center rounded-md px-3 py-2 text-xs font-medium transition-all duration-150 group cursor-pointer focus:outline-none focus:ring-1 focus:ring-bronze/50 ${
                        isActive
                          ? "bg-panel text-bronze shadow-sm"
                          : "text-secondary hover:bg-panel/50 hover:text-primary"
                      }`}
                    >
                      {/* Left Active indicator stripe */}
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gold rounded-r" />
                      )}

                      <item.icon
                        className={`h-4 w-4 shrink-0 transition-colors duration-150 ${
                          isActive
                            ? "text-bronze"
                            : "text-secondary/75 group-hover:text-primary"
                        } ${isCollapsed ? "mx-auto" : "mr-3"}`}
                      />

                      {!isCollapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer / Toggle Section */}
      <div className="p-3 border-t border-muted hidden md:block">
        <button
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center py-2 rounded-md border border-muted hover:border-bronze/40 hover:bg-panel hover:text-bronze text-secondary transition-all duration-150 text-xs font-medium cursor-pointer"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex items-center space-x-2">
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed side navigation) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 hidden md:block transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-[280px]"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide over navigation) */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-xs"
          onClick={onCloseMobile}
        />
        {/* Drawer Panel */}
        <div
          className={`absolute top-0 bottom-0 left-0 w-72 bg-sidebar transition-transform duration-300 ease-in-out ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
