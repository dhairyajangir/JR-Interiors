"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Tags,
  Plus,
  X,
  Loader2,
  Star,
  StarOff,
} from "lucide-react";
import {
  getProductTaxonomiesAction,
  assignProductAction,
  removeProductAction,
  listTaxonomiesAction,
} from "../actions/taxonomy-actions";
import {
  TAX_KIND_LABELS,
  TAX_KIND_COLORS,
} from "../constants";
import type { TaxKind } from "../types";

interface ProductAssignmentPanelProps {
  productId: string;
  canWrite: boolean;
}

interface AssignedTaxonomy {
  id: string;
  productId: string;
  taxonomyId: string;
  primary: boolean;
  taxonomy: {
    id: string;
    kind: TaxKind;
    name: string;
    slug: string;
    status: string;
  };
}

export function ProductAssignmentPanel({
  productId,
  canWrite,
}: ProductAssignmentPanelProps) {
  const [assignments, setAssignments] = useState<AssignedTaxonomy[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load existing assignments
  useEffect(() => {
    setLoading(true);
    getProductTaxonomiesAction(productId).then((res) => {
      if (res.success) setAssignments(res.data);
      setLoading(false);
    });
  }, [productId]);

  // Search taxonomy nodes for assignment
  useEffect(() => {
    if (!addOpen || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      const res = await listTaxonomiesAction(
        { search: searchQuery, status: "PUBLISHED" },
        { limit: 20, sortBy: "name", sortOrder: "asc" }
      );
      if (res.success) {
        const assignedIds = new Set(assignments.map((a) => a.taxonomyId));
        setSearchResults(res.data.nodes.filter((n: any) => !assignedIds.has(n.id)));
      }
      setSearchLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, addOpen, assignments]);

  const handleAssign = (taxonomyId: string, primary = false) => {
    startTransition(async () => {
      const res = await assignProductAction(productId, taxonomyId, primary);
      if (res.success) {
        const refresh = await getProductTaxonomiesAction(productId);
        if (refresh.success) setAssignments(refresh.data);
        setSearchQuery("");
        setAddOpen(false);
      }
    });
  };

  const handleRemove = (taxonomyId: string) => {
    startTransition(async () => {
      await removeProductAction(productId, taxonomyId);
      setAssignments((prev) => prev.filter((a) => a.taxonomyId !== taxonomyId));
    });
  };

  const handleSetPrimary = (taxonomyId: string) => {
    startTransition(async () => {
      await assignProductAction(productId, taxonomyId, true);
      const refresh = await getProductTaxonomiesAction(productId);
      if (refresh.success) setAssignments(refresh.data);
    });
  };

  // Group assignments by kind
  const grouped = assignments.reduce<Record<string, AssignedTaxonomy[]>>(
    (acc, a) => {
      const kind = a.taxonomy.kind;
      if (!acc[kind]) acc[kind] = [];
      acc[kind].push(a);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tags className="h-4 w-4 text-secondary" />
          <h3 className="text-sm font-medium text-primary">Taxonomy Assignments</h3>
          {assignments.length > 0 && (
            <span className="text-[10px] font-medium bg-heavy/30 text-secondary px-1.5 py-0.5 rounded-full">
              {assignments.length}
            </span>
          )}
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => setAddOpen((p) => !p)}
            className="flex items-center gap-1.5 h-7 px-3 text-xs font-medium border border-muted rounded-md text-secondary hover:text-primary hover:border-gold/30 transition-all"
          >
            <Plus className="h-3 w-3" />
            Assign
          </button>
        )}
      </div>

      {/* Add assignment panel */}
      {addOpen && (
        <div className="border border-muted rounded-md p-3 space-y-2 bg-sidebar/30">
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search taxonomy nodes to assign…"
            className="
              w-full h-8 px-3 text-xs
              bg-panel border border-muted rounded-md
              text-primary placeholder:text-secondary
              focus:outline-none focus:ring-1 focus:ring-gold/50
            "
          />
          {searchLoading && (
            <div className="flex items-center gap-2 text-xs text-secondary py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Searching…
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="border border-muted rounded-md divide-y divide-muted/30 max-h-48 overflow-y-auto">
              {searchResults.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <div>
                    <span className="text-xs font-medium text-primary">{node.name}</span>
                    <span
                      className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border ${TAX_KIND_COLORS[node.kind as TaxKind]}`}
                    >
                      {TAX_KIND_LABELS[node.kind as TaxKind]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAssign(node.id, true)}
                      disabled={isPending}
                      className="h-6 px-2 text-[10px] bg-gold/10 border border-gold/30 text-gold rounded hover:bg-gold/20 transition-all disabled:opacity-50"
                    >
                      Primary
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAssign(node.id, false)}
                      disabled={isPending}
                      className="h-6 px-2 text-[10px] border border-muted text-secondary rounded hover:text-primary hover:border-gold/30 transition-all disabled:opacity-50"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Existing assignments */}
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-secondary py-3">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading assignments…
        </div>
      ) : assignments.length === 0 ? (
        <p className="text-xs text-secondary italic py-2">
          No taxonomy assignments yet.{" "}
          {canWrite ? "Use the Assign button to categorize this product." : ""}
        </p>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([kind, group]) => (
            <div key={kind}>
              <p className="text-[10px] font-medium text-secondary uppercase tracking-wider mb-1.5">
                {TAX_KIND_LABELS[kind as TaxKind]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.map((a) => (
                  <div
                    key={a.id}
                    className={`
                      flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs
                      ${a.primary
                        ? "bg-gold/10 border-gold/30 text-gold"
                        : "bg-heavy/20 border-muted text-primary"
                      }
                    `}
                  >
                    {a.primary && <Star className="h-2.5 w-2.5" />}
                    <span>{a.taxonomy.name}</span>
                    {canWrite && (
                      <div className="flex items-center gap-0.5 ml-1">
                        {!a.primary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(a.taxonomyId)}
                            disabled={isPending}
                            title="Set as primary"
                            className="text-secondary hover:text-gold transition-colors disabled:opacity-50"
                          >
                            <StarOff className="h-2.5 w-2.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemove(a.taxonomyId)}
                          disabled={isPending}
                          title="Remove assignment"
                          className="text-secondary hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
