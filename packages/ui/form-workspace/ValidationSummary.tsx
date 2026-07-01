"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationSummaryProps {
  errors: ValidationError[];
}

export function ValidationSummary({ errors }: ValidationSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div
      role="alert"
      className="bg-error-bg border border-error-border rounded-md p-4 text-xs space-y-2 animate-fade-in"
    >
      <div className="flex items-center space-x-2 text-error font-semibold">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>Validation Blockers ({errors.length})</span>
      </div>
      <p className="text-secondary font-light">
        Please resolve the following issues before submitting the product details:
      </p>
      <ul className="list-disc pl-5 space-y-1 text-primary">
        {errors.map((error, idx) => (
          <li key={idx}>
            <span className="font-semibold capitalize">{error.field.replace(/([A-Z])/g, " $1")}: </span>
            <span className="font-light">{error.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
