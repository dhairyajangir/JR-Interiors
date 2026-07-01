"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SectionProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Section({
  title,
  description,
  actions,
  toolbar,
  collapsible = false,
  defaultCollapsed = false,
  children,
  className = "",
}: SectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsible ? defaultCollapsed : false);

  return (
    <section
      className={`bg-panel border border-muted rounded-md luxury-shadow-sm overflow-hidden transition-all duration-200 ease-in-out ${className}`}
    >
      {/* Section Header */}
      <div className="flex items-start justify-between p-4 md:p-5 border-b border-muted bg-panel select-none">
        <div className="space-y-0.5 flex-1 min-w-0 pr-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-semibold tracking-tight text-primary font-display truncate">
              {title}
            </h2>
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-0.5 rounded text-secondary hover:text-primary hover:bg-base transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-bronze/50"
                aria-label={isCollapsed ? "Expand section" : "Collapse section"}
                aria-expanded={!isCollapsed}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isCollapsed ? "-rotate-90" : "rotate-0"
                  }`}
                />
              </button>
            )}
          </div>
          {description && (
            <p className="text-[11px] text-secondary font-light max-w-xl truncate">
              {description}
            </p>
          )}
        </div>

        {/* Header Actions Zone */}
        {actions && (
          <div className="flex items-center space-x-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Optional Toolbar Zone */}
      {toolbar && !isCollapsed && (
        <div className="px-4 py-2 border-b border-muted bg-sidebar/35 flex items-center justify-between gap-4 flex-wrap">
          {toolbar}
        </div>
      )}

      {/* Section Content Area */}
      <div
        className={`transition-all duration-200 ease-in-out ${
          isCollapsed ? "max-h-0 opacity-0 pointer-events-none overflow-hidden" : "p-4 md:p-5 opacity-100"
        }`}
      >
        {children}
      </div>
    </section>
  );
}
