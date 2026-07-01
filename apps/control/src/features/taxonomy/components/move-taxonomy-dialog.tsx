"use client";

import React, { useState, useTransition } from "react";
import { FolderInput, Loader2 } from "lucide-react";
import { moveTaxonomyAction } from "../actions/taxonomy-actions";
import { ParentPicker } from "./parent-picker";
import type { TaxKind } from "../types";

interface MoveTaxonomyDialogProps {
  node: {
    id: string;
    name: string;
    slug: string;
    kind: TaxKind;
    parentId: string | null;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function MoveTaxonomyDialog({
  node,
  onClose,
  onSuccess,
}: MoveTaxonomyDialogProps) {
  const [newParentId, setNewParentId] = useState<string | null>(node?.parentId ?? null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!node) return null;

  const handleMove = () => {
    setError(null);
    startTransition(async () => {
      const res = await moveTaxonomyAction(node.id, newParentId);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error.message);
      }
    });
  };

  const hasChanged = newParentId !== node.parentId;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="move-dialog-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-panel border border-muted rounded-lg shadow-2xl w-full max-w-md p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-md bg-blue-500/10 border border-blue-500/20 shrink-0">
            <FolderInput className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 id="move-dialog-title" className="text-sm font-semibold text-primary">
              Move Node
            </h2>
            <p className="mt-1 text-xs text-secondary">
              Relocate{" "}
              <span className="font-medium text-primary">"{node.name}"</span>{" "}
              in the taxonomy tree.
            </p>
          </div>
        </div>

        {/* Parent picker */}
        <ParentPicker
          value={newParentId}
          onChange={setNewParentId}
          kind={node.kind}
          excludeId={node.id}
          label="New parent (leave empty for top-level)"
        />

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="h-8 px-4 text-xs font-medium bg-transparent border border-muted rounded-md text-secondary hover:text-primary transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleMove}
            disabled={!hasChanged || isPending}
            className="
              flex items-center gap-2 h-8 px-4 text-xs font-medium
              bg-blue-500/10 border border-blue-500/30 rounded-md
              text-blue-400 hover:bg-blue-500/20
              transition-all disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FolderInput className="h-3.5 w-3.5" />}
            {isPending ? "Moving…" : "Move"}
          </button>
        </div>
      </div>
    </div>
  );
}
