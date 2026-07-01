"use client";

import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface FormSectionConfig {
  id: string;
  label: string;
  hasError?: boolean;
  isComplete?: boolean;
}

interface FormWorkspaceProps {
  title: string;
  subtitle?: string;
  sections: FormSectionConfig[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  children: React.ReactNode;
  actionBar?: React.ReactNode;
  validationSummary?: React.ReactNode;
}

export function FormWorkspace({
  title,
  subtitle,
  sections,
  activeSection,
  onSectionChange,
  children,
  actionBar,
  validationSummary,
}: FormWorkspaceProps) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] relative pb-24">
      {/* Workspace Header */}
      <div className="mb-6 pb-4 border-b border-muted flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-primary font-display">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-secondary font-light mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Validation Summary if any */}
      {validationSummary && <div className="mb-6">{validationSummary}</div>}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 bg-panel border border-muted rounded-md p-3 luxury-shadow-sm sticky top-24">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary px-3 mb-2.5">
            Workspace Navigation
          </p>
          <nav className="space-y-1" aria-label="Editor sections">
            {sections.map((section) => {
              const isActive = section.id === activeSection;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onSectionChange(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-all duration-150 ${
                    isActive
                      ? "bg-bronze text-panel font-semibold shadow-sm"
                      : "text-secondary hover:text-primary hover:bg-base"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="truncate">{section.label}</span>
                  <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                    {section.hasError && (
                      <span title="Validation errors in section">
                        <AlertCircle
                          className={`h-4 w-4 ${isActive ? "text-panel" : "text-error"}`}
                        />
                      </span>
                    )}
                    {!section.hasError && section.isComplete && (
                      <span title="Section complete">
                        <CheckCircle2
                          className={`h-4 w-4 ${isActive ? "text-panel" : "text-success"}`}
                        />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Editor Pane */}
        <div className="flex-1 w-full space-y-8 bg-panel border border-muted rounded-md p-6 luxury-shadow-sm">
          {children}
        </div>
      </div>

      {/* Sticky Action Footer */}
      {actionBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-panel border-t border-muted px-6 py-4 luxury-shadow-md flex justify-between items-center transition-all duration-200">
          <div className="max-w-[1400px] w-full mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {actionBar}
          </div>
        </div>
      )}
    </div>
  );
}
