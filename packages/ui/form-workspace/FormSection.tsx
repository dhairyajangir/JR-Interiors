"use client";

import React from "react";

interface FormSectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function FormSection({ id, title, description, children }: FormSectionProps) {
  return (
    <section id={id} className="space-y-4 pt-4 first:pt-0">
      <div className="border-b border-muted pb-3">
        <h2 className="text-base font-semibold text-primary font-display">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-secondary font-light mt-0.5 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}
