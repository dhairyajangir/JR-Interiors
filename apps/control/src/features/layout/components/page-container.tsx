"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { NAVIGATION_CONFIG } from "../config/navigation";
import { ChevronRight } from "lucide-react";

interface PageContainerProps {
  title: string;
  description?: string;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  showBreadcrumbs?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function PageContainer({
  title,
  description,
  primaryAction,
  secondaryActions,
  showBreadcrumbs = false,
  footer,
  children,
}: PageContainerProps) {
  const pathname = usePathname();

  // Helper to generate breadcrumbs dynamically if requested
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
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="space-y-6 animate-fade-in flex flex-col min-h-[calc(100vh-100px)]">
      {/* Dynamic Inline Breadcrumbs */}
      {showBreadcrumbs && (
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-[10px] text-secondary select-none">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb}>
                {idx > 0 && <ChevronRight className="h-2.5 w-2.5 text-secondary/40 shrink-0" />}
                <span className={isLast ? "font-medium text-primary" : "font-light"}>
                  {crumb}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Page Header Zone */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 pb-5 border-b border-muted">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-primary font-display truncate">
            {title}
          </h1>
          {description && (
            <p className="text-xs md:text-sm text-secondary font-light max-w-2xl leading-normal">
              {description}
            </p>
          )}
        </div>

        {/* Action Buttons Zone */}
        {(primaryAction || secondaryActions) && (
          <div className="flex items-center space-x-3 shrink-0">
            {secondaryActions && (
              <div className="flex items-center space-x-2">
                {secondaryActions}
              </div>
            )}
            {primaryAction && (
              <div className="flex items-center">
                {primaryAction}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full min-h-0">
        {children}
      </div>

      {/* Optional Page Footer */}
      {footer && (
        <footer className="mt-8 pt-5 border-t border-muted flex items-center justify-end space-x-3 bg-sidebar/10 p-4 rounded-md">
          {footer}
        </footer>
      )}
    </div>
  );
}
