"use client";

import React from "react";
import {
  Inbox,
  SearchX,
  Users,
  ShoppingCart,
  BellOff,
  ShieldOff,
  LucideIcon,
} from "lucide-react";

export type EmptyStateType =
  | "no-results"
  | "no-products"
  | "no-customers"
  | "no-orders"
  | "no-notifications"
  | "permission-denied";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  type = "no-results",
  title,
  description,
  icon: CustomIcon,
  action,
  className = "",
}: EmptyStateProps) {
  // Default values based on Empty State type
  const config: Record<
    EmptyStateType,
    { title: string; description: string; icon: LucideIcon }
  > = {
    "no-results": {
      title: "No results found",
      description: "We couldn't find matches for your current filters or query.",
      icon: SearchX,
    },
    "no-products": {
      title: "No products in catalog",
      description: "Start adding furniture specifications and fabrics to your catalog.",
      icon: Inbox,
    },
    "no-customers": {
      title: "No customer records",
      description: "CRM leads and customer histories will be synchronized here.",
      icon: Users,
    },
    "no-orders": {
      title: "No orders placed",
      description: "Showroom checkout sales and purchase sheets appear in this list.",
      icon: ShoppingCart,
    },
    "no-notifications": {
      title: "All caught up",
      description: "You have no unread notifications or platform alerts.",
      icon: BellOff,
    },
    "permission-denied": {
      title: "Access Restricted",
      description: "Your assigned role doesn't have permissions to view this module.",
      icon: ShieldOff,
    },
  };

  const activeConfig = config[type];
  const DisplayIcon = CustomIcon || activeConfig.icon;
  const displayTitle = title || activeConfig.title;
  const displayDesc = description || activeConfig.description;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-muted rounded-md bg-panel/30 select-none ${className}`}
    >
      {/* Decorative Icon Container */}
      <div className="p-4 rounded-full bg-sidebar/50 border border-muted text-secondary mb-4">
        <DisplayIcon className="h-6 w-6 stroke-secondary/70" />
      </div>

      {/* Text Info */}
      <div className="space-y-1 max-w-sm mb-6">
        <h3 className="text-sm font-semibold tracking-tight text-primary font-display">
          {displayTitle}
        </h3>
        <p className="text-xs text-secondary leading-normal font-light">
          {displayDesc}
        </p>
      </div>

      {/* Optional Action Button */}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}
