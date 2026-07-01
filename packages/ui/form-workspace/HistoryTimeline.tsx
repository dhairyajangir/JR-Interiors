"use client";

import React, { useState } from "react";
import { Clock, User, ChevronDown, ChevronUp } from "lucide-react";

export interface HistoryItem {
  id: string;
  action: string;
  createdAt: string;
  userEmail: string;
  userName: string;
  userRole: string;
  details?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    changedFields?: string[];
    reason?: string | null;
  };
}

interface HistoryTimelineProps {
  logs: HistoryItem[];
}

export function HistoryTimeline({ logs }: HistoryTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "PRODUCT_CREATED":
        return { text: "Product Created", color: "bg-bronze/10 text-bronze border-bronze/20" };
      case "PRODUCT_UPDATED":
        return { text: "Product Updated", color: "bg-primary/5 text-primary border-primary/10" };
      case "PRODUCT_APPROVED":
      case "PRODUCT_PUBLISHED":
        return { text: "Product Published", color: "bg-success/10 text-success border-success/20" };
      case "PRODUCT_REJECTED":
        return { text: "Changes Requested", color: "bg-warning/10 text-warning border-warning/20" };
      case "PRODUCT_ARCHIVED":
        return { text: "Product Archived", color: "bg-secondary/15 text-secondary border-secondary/20" };
      default:
        return { text: action.replace("PRODUCT_", ""), color: "bg-base text-secondary" };
    }
  };

  if (logs.length === 0) {
    return (
      <div className="py-8 text-center text-secondary text-xs font-light">
        No audit log history available for this product.
      </div>
    );
  }

  return (
    <div className="relative border-l border-muted ml-3 pl-6 space-y-6">
      {logs.map((log) => {
        const label = getActionLabel(log.action);
        const isExpanded = expandedId === log.id;
        const formattedDate = new Date(log.createdAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        });

        return (
          <div key={log.id} className="relative select-none">
            {/* Timeline Dot Icon */}
            <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-panel border-2 border-bronze">
              <span className="h-1.5 w-1.5 rounded-full bg-bronze" />
            </span>

            <div className="bg-base/30 border border-muted rounded-md p-4 space-y-2 hover:bg-base/50 transition-colors duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase border ${label.color}`}>
                    {label.text}
                  </span>
                  <div className="flex items-center space-x-1 text-secondary text-xs">
                    <User className="h-3.5 w-3.5 shrink-0 text-secondary/70" />
                    <span className="font-medium text-primary">{log.userName}</span>
                    <span className="text-[10px] text-secondary">({log.userRole})</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-[10px] text-secondary font-light">
                  <Clock className="h-3.5 w-3.5 text-secondary/60 shrink-0" />
                  <span>{formattedDate}</span>
                </div>
              </div>

              {log.details?.reason && (
                <div className="bg-warning/5 border border-warning/10 p-2.5 rounded text-xs text-warning leading-relaxed font-light">
                  <span className="font-semibold block text-[10px] uppercase tracking-wider mb-0.5">Moderator Note:</span>
                  {log.details.reason}
                </div>
              )}

              {log.details?.changedFields && log.details.changedFields.length > 0 && (
                <div className="flex flex-wrap gap-1 text-[10px] text-secondary font-light">
                  <span className="font-medium">Edited:</span>
                  {log.details.changedFields.map((field) => (
                    <span key={field} className="px-1.5 py-0.5 bg-muted rounded text-primary font-mono text-[9px]">
                      {field}
                    </span>
                  ))}
                </div>
              )}

              {/* Collapsible Details */}
              {log.details?.before && log.details?.after && (
                <div className="pt-1.5">
                  <button
                    type="button"
                    onClick={() => toggleExpand(log.id)}
                    className="inline-flex items-center space-x-1 text-[10px] font-medium text-bronze hover:text-bronze/80 uppercase tracking-wider"
                  >
                    <span>{isExpanded ? "Hide detail diff" : "View detail diff"}</span>
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 bg-panel border border-muted p-3.5 rounded text-xs font-mono select-text overflow-x-auto">
                      <div>
                        <span className="text-[10px] text-error font-semibold uppercase tracking-wider block mb-1">Before change</span>
                        <pre className="text-[10px] text-secondary font-light whitespace-pre-wrap leading-normal">
                          {JSON.stringify(log.details.before, null, 2)}
                        </pre>
                      </div>
                      <div className="border-t sm:border-t-0 sm:border-l border-muted pt-3 sm:pt-0 sm:pl-3">
                        <span className="text-[10px] text-success font-semibold uppercase tracking-wider block mb-1">After change</span>
                        <pre className="text-[10px] text-secondary font-light whitespace-pre-wrap leading-normal">
                          {JSON.stringify(log.details.after, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
