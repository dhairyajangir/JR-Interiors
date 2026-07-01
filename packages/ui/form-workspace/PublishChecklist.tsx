"use client";

import React from "react";
import { Check, X, AlertCircle } from "lucide-react";

export interface PublishChecklistItems {
  hasName: boolean;
  hasDescription: boolean;
  hasMaterial: boolean;
  hasRoom: boolean;
  hasType: boolean;
  hasPrimaryImage: boolean;
  hasCategory: boolean;
  hasValidPrice: boolean;
  hasValidStock: boolean;
  hasSEO: boolean;
}

interface PublishChecklistProps {
  items: PublishChecklistItems;
}

export function PublishChecklist({ items }: PublishChecklistProps) {
  const checklist = [
    { label: "Product Name & Details", met: items.hasName && items.hasDescription && items.hasMaterial && items.hasRoom && items.hasType },
    { label: "Primary Cover Photo", met: items.hasPrimaryImage },
    { label: "Taxonomy Category Assignment", met: items.hasCategory },
    { label: "Base Price (Positive Integer)", met: items.hasValidPrice },
    { label: "Inventory Stock Count", met: items.hasValidStock },
    { label: "SEO Config (Slug, Meta Title & Desc)", met: items.hasSEO },
  ];

  const satisfiedCount = checklist.filter((c) => c.met).length;
  const isAllMet = satisfiedCount === checklist.length;

  return (
    <div className="bg-panel border border-muted rounded-md p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-muted pb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-bronze">
          Publish Checklist
        </h3>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            isAllMet ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
          }`}
        >
          {satisfiedCount} / {checklist.length} satisfied
        </span>
      </div>

      <div className="space-y-2.5">
        {checklist.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className={item.met ? "text-primary" : "text-secondary font-light"}>
              {item.label}
            </span>
            <span className="shrink-0 ml-4">
              {item.met ? (
                <span className="p-0.5 bg-success/15 text-success rounded-full flex">
                  <Check className="h-3 w-3" />
                </span>
              ) : (
                <span className="p-0.5 bg-secondary/10 text-secondary/40 rounded-full flex">
                  <AlertCircle className="h-3 w-3" />
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {!isAllMet && (
        <div className="mt-3 pt-3 border-t border-muted flex items-start space-x-2 text-[10px] text-secondary font-light leading-normal">
          <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
          <span>Publishing is disabled until all checklist requirements are fully satisfied.</span>
        </div>
      )}
    </div>
  );
}
