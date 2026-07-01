"use client";

import React from "react";
import { Loader2, Save, Send, ShieldAlert, Archive, Trash2, Eye } from "lucide-react";

interface StickyActionBarProps {
  status: string;
  isSaving: boolean;
  isDirty: boolean;
  canWrite: boolean;
  canPublish: boolean;
  canArchive: boolean;
  canDelete: boolean;
  onSaveDraft?: () => void;
  onSubmitReview?: () => void;
  onPublish?: () => void;
  onReject?: () => void; // for admin requesting changes
  onArchive?: () => void;
  onDelete?: () => void;
  onCancel?: () => void;
  onPreview?: () => void;
  publishChecklistComplete?: boolean;
}

export function StickyActionBar({
  status,
  isSaving,
  isDirty,
  canWrite,
  canPublish,
  canArchive,
  canDelete,
  onSaveDraft,
  onSubmitReview,
  onPublish,
  onReject,
  onArchive,
  onDelete,
  onCancel,
  onPreview,
  publishChecklistComplete = false,
}: StickyActionBarProps) {
  const isPublished = status === "PUBLISHED";
  const isPendingReview = status === "PENDING_REVIEW";
  const isArchived = status === "ARCHIVED";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4 text-xs">
      {/* Left section: Status Badge and Save State */}
      <div className="flex items-center space-x-3">
        <span className="text-secondary select-none font-medium uppercase tracking-wider text-[10px]">
          Status:
        </span>
        <span
          className={`px-2 py-0.5 rounded-full font-semibold text-[10px] tracking-wide uppercase ${
            isPublished
              ? "bg-success/10 text-success border border-success/20"
              : isPendingReview
              ? "bg-warning/10 text-warning border border-warning/20"
              : isArchived
              ? "bg-secondary/10 text-secondary border border-secondary/20"
              : "bg-bronze/10 text-bronze border border-bronze/20"
          }`}
        >
          {status.replace("_", " ")}
        </span>

        {isSaving ? (
          <div className="flex items-center space-x-1.5 text-secondary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Saving draft...</span>
          </div>
        ) : isDirty ? (
          <span className="text-warning font-medium">Unsaved changes</span>
        ) : (
          <span className="text-success font-medium">Saved to cloud</span>
        )}
      </div>

      {/* Right section: Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {onPreview && (
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center space-x-1.5 bg-panel hover:bg-base text-primary border border-muted py-2 px-3 rounded-md transition-all duration-150 font-medium"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
          </button>
        )}

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center bg-panel hover:bg-base text-secondary border border-muted py-2 px-3 rounded-md transition-all duration-150 font-medium"
          >
            Cancel
          </button>
        )}

        {/* Delete action (highly restricted) */}
        {onDelete && canDelete && (!isPublished || canPublish) && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center space-x-1.5 bg-error/10 hover:bg-error/20 text-error border border-error/20 py-2 px-3 rounded-md transition-all duration-150 font-medium"
            title={isPublished ? "Delete published catalog item" : "Delete item"}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        )}

        {/* Archive action */}
        {onArchive && canArchive && !isArchived && (
          <button
            type="button"
            onClick={onArchive}
            className="inline-flex items-center space-x-1.5 bg-panel hover:bg-base text-secondary border border-muted py-2 px-3 rounded-md transition-all duration-150 font-medium"
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Archive</span>
          </button>
        )}

        {/* Save Draft (Sellers and Admins) */}
        {onSaveDraft && canWrite && !isPublished && !isPendingReview && (
          <button
            type="button"
            onClick={onSaveDraft}
            className="inline-flex items-center space-x-1.5 bg-panel hover:bg-base text-primary border border-muted py-2 px-3.5 rounded-md transition-all duration-150 font-medium"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </button>
        )}

        {/* Submit for Review (Sellers only / or anyone with write who isn't admin) */}
        {onSubmitReview && canWrite && (status === "DRAFT" || status === "CHANGES_REQUESTED") && (
          <button
            type="button"
            onClick={onSubmitReview}
            className="inline-flex items-center space-x-1.5 bg-bronze hover:bg-bronze/90 text-panel py-2 px-3.5 rounded-md transition-all duration-150 font-medium"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Submit for Review</span>
          </button>
        )}

        {/* Admin Reject / Changes Requested */}
        {onReject && canPublish && isPendingReview && (
          <button
            type="button"
            onClick={onReject}
            className="inline-flex items-center space-x-1.5 bg-warning/10 hover:bg-warning/20 text-warning border border-warning/20 py-2 px-3.5 rounded-md transition-all duration-150 font-medium"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Request Changes</span>
          </button>
        )}

        {/* Admin Approve / Publish */}
        {onPublish && canPublish && !isPublished && (
          <button
            type="button"
            disabled={!publishChecklistComplete}
            onClick={onPublish}
            className={`inline-flex items-center space-x-1.5 py-2 px-4 rounded-md transition-all duration-150 font-medium text-primary ${
              publishChecklistComplete
                ? "bg-gold hover:bg-gold/90 shadow-sm"
                : "bg-gold/40 text-primary/40 border border-gold/10 cursor-not-allowed"
            }`}
            title={!publishChecklistComplete ? "Publish checklist requirements not satisfied" : "Publish item"}
          >
            <span>Publish Catalog Item</span>
          </button>
        )}
      </div>
    </div>
  );
}
