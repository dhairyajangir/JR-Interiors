"use client";

import React, { useState, useTransition } from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { deleteTaxonomyAction } from "../actions/taxonomy-actions";

interface DeleteTaxonomyDialogProps {
  node: {
    id: string;
    name: string;
    slug: string;
    childCount: number;
    productCount: number;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteTaxonomyDialog({
  node,
  onClose,
  onSuccess,
}: DeleteTaxonomyDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!node) return null;

  const hasBlockers = node.childCount > 0 || node.productCount > 0;

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteTaxonomyAction(node.id);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error.message);
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-panel border border-muted rounded-lg shadow-2xl w-full max-w-md p-6 space-y-5">
        {/* Icon + Title */}
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-md bg-red-500/10 border border-red-500/20 shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h2
              id="delete-dialog-title"
              className="text-sm font-semibold text-primary"
            >
              Delete Taxonomy Node
            </h2>
            <p className="mt-1 text-xs text-secondary leading-relaxed">
              You are about to permanently delete{" "}
              <span className="font-medium text-primary">"{node.name}"</span>.
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Blockers warning */}
        {hasBlockers && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-md p-3 space-y-1">
            <p className="text-xs font-medium text-red-400">
              This node cannot be deleted:
            </p>
            {node.childCount > 0 && (
              <p className="text-xs text-red-400/80">
                • Has {node.childCount} child node{node.childCount !== 1 ? "s" : ""}.
                Move or delete them first.
              </p>
            )}
            {node.productCount > 0 && (
              <p className="text-xs text-red-400/80">
                • Has {node.productCount} assigned product{node.productCount !== 1 ? "s" : ""}.
                Reassign or merge products first.
              </p>
            )}
          </div>
        )}

        {/* Details */}
        <div className="bg-heavy/20 rounded-md p-3 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-secondary">Name</span>
            <span className="text-primary font-medium">{node.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Slug</span>
            <span className="text-primary font-mono">/{node.slug}</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="
              h-8 px-4 text-xs font-medium
              bg-transparent border border-muted rounded-md
              text-secondary hover:text-primary hover:border-gold/40
              transition-all duration-150
              disabled:opacity-50
            "
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending || hasBlockers}
            className="
              flex items-center gap-2 h-8 px-4 text-xs font-medium
              bg-red-500/10 border border-red-500/30 rounded-md
              text-red-400 hover:bg-red-500/20 hover:text-red-300
              transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {isPending ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
