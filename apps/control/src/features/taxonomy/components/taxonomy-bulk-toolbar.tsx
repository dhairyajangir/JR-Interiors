"use client";

import React, { useTransition } from "react";
import {
  Trash2,
  ArchiveX,
  Globe,
  FolderInput,
  GitMerge,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";

interface TaxonomyBulkToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkPublish: () => Promise<void>;
  onBulkArchive: () => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onBulkMove: () => void;   // opens Move dialog
  onBulkMerge: () => void;  // opens Merge dialog (for 2 selected)
  onBulkRecalculate: () => Promise<void>;
  onBulkChangeVisibility: () => void;
  canPublish: boolean;
  canManage: boolean;
}

export function TaxonomyBulkToolbar({
  selectedCount,
  onClearSelection,
  onBulkPublish,
  onBulkArchive,
  onBulkDelete,
  onBulkMove,
  onBulkMerge,
  onBulkRecalculate,
  onBulkChangeVisibility,
  canPublish,
  canManage,
}: TaxonomyBulkToolbarProps) {
  const [isPending, startTransition] = useTransition();

  if (selectedCount === 0) return null;

  const runAsync = (fn: () => Promise<void>) => {
    startTransition(async () => {
      await fn();
    });
  };

  return (
    <div
      className="
        flex items-center gap-3 px-4 py-2.5
        bg-gold/10 border border-gold/25 rounded-md
        animate-in slide-in-from-bottom-2 duration-200
      "
      role="toolbar"
      aria-label="Bulk actions"
    >
      {/* Count + clear */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-semibold text-gold shrink-0">
          {selectedCount} selected
        </span>
        <button
          onClick={onClearSelection}
          className="text-secondary hover:text-primary transition-colors"
          aria-label="Clear selection"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-4 w-px bg-muted shrink-0" />

      {/* Actions */}
      <div className="flex items-center gap-1 flex-wrap">
        {canPublish && (
          <BulkButton
            icon={<Globe className="h-3 w-3" />}
            label="Publish"
            onClick={() => runAsync(onBulkPublish)}
            disabled={isPending}
            variant="success"
          />
        )}

        {canManage && (
          <>
            <BulkButton
              icon={<ArchiveX className="h-3 w-3" />}
              label="Archive"
              onClick={() => runAsync(onBulkArchive)}
              disabled={isPending}
            />
            <BulkButton
              icon={<FolderInput className="h-3 w-3" />}
              label="Move"
              onClick={onBulkMove}
              disabled={isPending}
            />
            {selectedCount === 2 && (
              <BulkButton
                icon={<GitMerge className="h-3 w-3" />}
                label="Merge"
                onClick={onBulkMerge}
                disabled={isPending}
              />
            )}
            <BulkButton
              icon={<Globe className="h-3 w-3" />}
              label="Visibility"
              onClick={onBulkChangeVisibility}
              disabled={isPending}
            />
            <BulkButton
              icon={<RefreshCw className="h-3 w-3" />}
              label="Recalculate"
              onClick={() => runAsync(onBulkRecalculate)}
              disabled={isPending}
            />
            <BulkButton
              icon={<Trash2 className="h-3 w-3" />}
              label="Delete"
              onClick={() => runAsync(onBulkDelete)}
              disabled={isPending}
              variant="danger"
            />
          </>
        )}
      </div>

      {isPending && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-secondary ml-auto shrink-0" />
      )}
    </div>
  );
}

// ── Inner button ──────────────────────────────────────────────────────────────

interface BulkButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger" | "success";
}

function BulkButton({
  icon,
  label,
  onClick,
  disabled,
  variant = "default",
}: BulkButtonProps) {
  const variantClass = {
    default: "text-secondary hover:text-primary hover:bg-heavy/30",
    danger:  "text-red-400 hover:text-red-300 hover:bg-red-500/10",
    success: "text-green-400 hover:text-green-300 hover:bg-green-500/10",
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-1.5 h-7 px-2.5 rounded text-xs font-medium
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClass}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
