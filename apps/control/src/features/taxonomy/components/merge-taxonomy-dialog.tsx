"use client";

import React, { useState, useEffect, useTransition } from "react";
import { GitMerge, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";
import { mergeTaxonomyAction, listTaxonomiesAction } from "../actions/taxonomy-actions";
import { TAX_KIND_LABELS } from "../constants";
import type { TaxKind } from "../types";

interface MergeTaxonomyDialogProps {
  sourceNode: {
    id: string;
    name: string;
    slug: string;
    kind: TaxKind;
    productCount: number;
    childCount: number;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface TaxOption {
  id: string;
  name: string;
  slug: string;
  kind: TaxKind;
  productCount: number;
}

export function MergeTaxonomyDialog({
  sourceNode,
  onClose,
  onSuccess,
}: MergeTaxonomyDialogProps) {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [targetNode, setTargetNode] = useState<TaxOption | null>(null);
  const [options, setOptions] = useState<TaxOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!sourceNode) return;
    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await listTaxonomiesAction(
        { search, kind: sourceNode.kind },
        { limit: 50, sortBy: "name", sortOrder: "asc" }
      );
      if (res.success) {
        setOptions(
          (res.data.nodes as TaxOption[]).filter((n) => n.id !== sourceNode.id)
        );
      }
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [search, sourceNode]);

  if (!sourceNode) return null;

  const handleMerge = () => {
    if (!targetId || !confirmed) return;
    setError(null);
    startTransition(async () => {
      const res = await mergeTaxonomyAction(sourceNode.id, targetId);
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
      aria-labelledby="merge-dialog-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-panel border border-muted rounded-lg shadow-2xl w-full max-w-lg p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-md bg-amber-500/10 border border-amber-500/20 shrink-0">
            <GitMerge className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h2 id="merge-dialog-title" className="text-sm font-semibold text-primary">
              Merge Taxonomy Nodes
            </h2>
            <p className="mt-1 text-xs text-secondary leading-relaxed">
              All products and children from the source will be moved to the target.
              The source node will be permanently deleted.
            </p>
          </div>
        </div>

        {/* Source → Target visual */}
        <div className="flex items-center gap-3 p-3 bg-heavy/20 rounded-md">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-secondary uppercase tracking-wider mb-0.5">Source (will be deleted)</p>
            <p className="text-xs font-medium text-primary truncate">{sourceNode.name}</p>
            <p className="text-[10px] text-secondary font-mono">/{sourceNode.slug}</p>
            <p className="text-[10px] text-secondary mt-1">
              {sourceNode.productCount} products • {sourceNode.childCount} children
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-secondary uppercase tracking-wider mb-0.5">Target (kept)</p>
            {targetNode ? (
              <>
                <p className="text-xs font-medium text-primary truncate">{targetNode.name}</p>
                <p className="text-[10px] text-secondary font-mono">/{targetNode.slug}</p>
              </>
            ) : (
              <p className="text-xs text-secondary italic">Select target below…</p>
            )}
          </div>
        </div>

        {/* Target picker */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-secondary uppercase tracking-wider">
            Select merge target
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${TAX_KIND_LABELS[sourceNode.kind]} nodes…`}
            className="
              w-full h-8 px-3 text-xs
              bg-sidebar border border-muted rounded-md
              text-primary placeholder:text-secondary
              focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/50
            "
          />
          <div className="max-h-48 overflow-y-auto border border-muted rounded-md divide-y divide-muted/30">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-secondary">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching…
              </div>
            ) : options.length === 0 ? (
              <p className="py-4 text-center text-xs text-secondary">No nodes found</p>
            ) : (
              options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { setTargetId(opt.id); setTargetNode(opt); setConfirmed(false); }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-xs
                    transition-colors text-left
                    ${targetId === opt.id ? "bg-gold/10 text-gold" : "hover:bg-heavy/30 text-primary"}
                  `}
                >
                  <span className="font-medium truncate">{opt.name}</span>
                  <span className="text-secondary font-mono shrink-0 ml-2">/{opt.slug}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Confirmation checkbox */}
        {targetId && (
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-3.5 h-3.5 rounded border-muted bg-panel text-gold focus:ring-gold/50"
            />
            <span className="text-xs text-secondary leading-relaxed">
              I understand that <span className="text-primary font-medium">"{sourceNode.name}"</span> will
              be permanently deleted and its {sourceNode.productCount} product(s) and {sourceNode.childCount} child node(s)
              will be moved to <span className="text-primary font-medium">"{targetNode?.name}"</span>.
            </span>
          </label>
        )}

        {/* Warning */}
        <div className="flex items-center gap-2 text-xs text-amber-400/80">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          This operation cannot be undone. Verify audit logs afterward.
        </div>

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
            onClick={handleMerge}
            disabled={!targetId || !confirmed || isPending}
            className="
              flex items-center gap-2 h-8 px-4 text-xs font-medium
              bg-amber-500/10 border border-amber-500/30 rounded-md
              text-amber-400 hover:bg-amber-500/20
              transition-all disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GitMerge className="h-3.5 w-3.5" />}
            {isPending ? "Merging…" : "Merge"}
          </button>
        </div>
      </div>
    </div>
  );
}
