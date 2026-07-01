"use client";

import React from "react";
import { Loader2 } from "lucide-react";

// Helper pulse block component
function PulseBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-heavy/25 rounded animate-pulse ${className}`} />
  );
}

// 1. Page skeleton loading state
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header zone */}
      <div className="pb-5 border-b border-muted flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <PulseBlock className="h-7 w-48" />
          <PulseBlock className="h-4 w-96 max-w-full" />
        </div>
        <PulseBlock className="h-8 w-24 shrink-0" />
      </div>
      {/* Content body zone */}
      <div className="space-y-4">
        <PulseBlock className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <PulseBlock className="h-48 w-full" />
          <PulseBlock className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}

// 2. Table loading state
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full border border-muted rounded-md bg-panel overflow-hidden">
      {/* Table Head */}
      <div className="flex border-b border-muted bg-sidebar/35 px-6 py-3.5">
        {Array.from({ length: cols }).map((_, idx) => (
          <div key={idx} className="flex-1">
            <PulseBlock className="h-3 w-16" />
          </div>
        ))}
      </div>
      {/* Table Body Rows */}
      <div className="divide-y divide-muted/30">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex px-6 py-4 items-center">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <div key={colIdx} className="flex-1">
                <PulseBlock className={`h-3 ${colIdx === 0 ? "w-24" : "w-16"}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Card collection loading state
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-panel border border-muted rounded-md p-5 luxury-shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <PulseBlock className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <PulseBlock className="h-3 w-28" />
              <PulseBlock className="h-2.5 w-16" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <PulseBlock className="h-3 w-full" />
            <PulseBlock className="h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 4. Form inputs loading state
export function FormSkeleton() {
  return (
    <div className="space-y-5 bg-panel border border-muted rounded-md p-5 max-w-xl">
      <div className="space-y-1 pb-3 border-b border-muted">
        <PulseBlock className="h-4 w-32" />
        <PulseBlock className="h-3 w-48" />
      </div>
      <div className="space-y-4 pt-1">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <PulseBlock className="h-3.5 w-16" />
            <PulseBlock className="h-9 w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <PulseBlock className="h-8 w-20" />
        <PulseBlock className="h-8 w-24" />
      </div>
    </div>
  );
}

// 5. Sidebar loader skeleton
export function SidebarSkeleton() {
  return (
    <div className="w-64 border-r border-muted bg-sidebar flex flex-col h-full shrink-0 p-4 space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-muted">
        <PulseBlock className="h-8 w-8 rounded" />
        <div className="space-y-1.5 flex-1">
          <PulseBlock className="h-3 w-20" />
          <PulseBlock className="h-2 w-12" />
        </div>
      </div>
      <div className="flex-1 space-y-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <PulseBlock className="h-2.5 w-12" />
            <div className="space-y-1">
              <PulseBlock className="h-7 w-full" />
              <PulseBlock className="h-7 w-11/12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 6. Executive metrics snap dashboards loading state
export function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="bg-panel border border-muted rounded-md p-5 luxury-shadow-sm space-y-3.5">
          <div className="flex justify-between items-center">
            <PulseBlock className="h-3 w-20" />
            <PulseBlock className="h-4 w-4" />
          </div>
          <div className="space-y-1.5 py-1">
            <PulseBlock className="h-8 w-28" />
            <PulseBlock className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 7. Loading Button wrapper
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  children: React.ReactNode;
}

export function LoadingButton({ isLoading, children, className = "", disabled, ...props }: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all disabled:opacity-50 ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin shrink-0" />}
      {children}
    </button>
  );
}
