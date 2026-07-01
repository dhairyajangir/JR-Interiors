"use client";

import React, {
  useState,
  useCallback,
  useTransition,
  useMemo,
  useRef,
} from "react";
import {
  GitBranch,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { TaxonomyTreeNodeItem } from "./taxonomy-tree-node";
import {
  reorderTaxonomyAction,
  archiveTaxonomyAction,
  recalculateCountsAction,
} from "../actions/taxonomy-actions";
import { DeleteTaxonomyDialog } from "./delete-taxonomy-dialog";
import { MergeTaxonomyDialog } from "./merge-taxonomy-dialog";
import { MoveTaxonomyDialog } from "./move-taxonomy-dialog";
import { CreateTaxonomyDialog } from "./create-taxonomy-dialog";
import type { TaxonomyTreeNode as TreeNode, TaxKind } from "../types";

interface TaxonomyTreeProps {
  initialTree: TreeNode[];
  kind?: TaxKind;
  onRefresh: () => void;
  canManage: boolean;
  canPublish: boolean;
}

export function TaxonomyTree({
  initialTree,
  kind,
  onRefresh,
  canManage,
  canPublish,
}: TaxonomyTreeProps) {
  const [tree, setTree] = useState<TreeNode[]>(initialTree);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Dialog state
  const [editNode, setEditNode] = useState<TreeNode | null>(null);
  const [deleteNode, setDeleteNode] = useState<any | null>(null);
  const [mergeSourceNode, setMergeSourceNode] = useState<any | null>(null);
  const [moveNode, setMoveNode] = useState<any | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // DnD state
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Flat search filter (tree search)
  const filteredTree = useMemo(() => {
    if (!search.trim()) return tree;
    const q = search.toLowerCase();
    return filterTree(tree, q);
  }, [tree, search]);

  // ── Drag & Drop ─────────────────────────────────────────────────────────────

  const handleDragStart = useCallback(
    (e: React.DragEvent, nodeId: string) => {
      e.dataTransfer.effectAllowed = "move";
      setDragSourceId(nodeId);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, nodeId: string) => {
      e.preventDefault();
      setDragOverId(nodeId);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (!dragSourceId || dragSourceId === targetId) {
        setDragOverId(null);
        return;
      }

      // Collect siblings of the drag source
      const siblings = collectSiblings(tree, dragSourceId);
      if (siblings.length === 0) {
        setDragOverId(null);
        return;
      }

      // Reorder: move dragSource after the target within siblings
      const reordered = reorderArray(siblings, dragSourceId, targetId);
      const orderedIds = reordered.map((n) => n.id);
      const parentId = findParentId(tree, dragSourceId);

      setDragSourceId(null);
      setDragOverId(null);

      startTransition(async () => {
        const res = await reorderTaxonomyAction(orderedIds, parentId);
        if (res.success) onRefresh();
      });
    },
    [dragSourceId, tree, onRefresh]
  );

  // ── Recalculate all counts ─────────────────────────────────────────────────

  const handleRecalculate = useCallback(async () => {
    setIsRecalculating(true);
    await recalculateCountsAction();
    setIsRecalculating(false);
    onRefresh();
  }, [onRefresh]);

  // ── Handlers passed to tree nodes ──────────────────────────────────────────

  const handleArchive = useCallback(
    (node: TreeNode) => {
      startTransition(async () => {
        await archiveTaxonomyAction(node.id);
        onRefresh();
      });
    },
    [onRefresh]
  );

  // ── Expand all / collapse all ──────────────────────────────────────────────
  // (We pass the tree to child nodes which manage their own state;
  //  expand-all can be implemented by iterating nodes via key reset)
  const [treeKey, setTreeKey] = useState(0);
  const expandAll = () => setTreeKey((k) => k + 1);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Tree search */}
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-secondary pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter tree…"
            className="
              w-full h-7 pl-8 pr-7 text-xs
              bg-panel border border-muted rounded-md
              text-primary placeholder:text-secondary
              focus:outline-none focus:ring-1 focus:ring-gold/50
            "
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Recalculate counts */}
          {canManage && (
            <button
              type="button"
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="flex items-center gap-1.5 h-7 px-3 text-xs text-secondary hover:text-primary border border-muted rounded-md hover:border-gold/30 transition-all disabled:opacity-50"
              title="Rebuild all product and child counts"
            >
              <RefreshCw className={`h-3 w-3 ${isRecalculating ? "animate-spin" : ""}`} />
              Recalculate
            </button>
          )}

          {isPending && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-secondary" />
          )}
        </div>
      </div>

      {/* Tree */}
      <div className="bg-panel border border-muted rounded-md overflow-hidden">
        {filteredTree.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="p-3 rounded-full bg-heavy/30">
              <GitBranch className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">
                {search ? "No nodes match your filter" : "No taxonomy nodes yet"}
              </p>
              <p className="text-xs text-secondary mt-1">
                {search
                  ? "Try a different search term"
                  : "Create your first node to build the taxonomy tree"}
              </p>
            </div>
          </div>
        ) : (
          <ul
            role="tree"
            aria-label="Taxonomy tree"
            className="p-2 space-y-0.5"
            key={treeKey}
          >
            {filteredTree.map((rootNode) => (
              <TaxonomyTreeNodeItem
                key={rootNode.id}
                node={rootNode}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                dragOverId={dragOverId}
                onEdit={setEditNode}
                onMove={setMoveNode}
                onMerge={setMergeSourceNode}
                onArchive={handleArchive}
                onDelete={setDeleteNode}
                onPreview={(node) => {
                  // Preview: open edit in read-only mode or navigate
                  setEditNode(node);
                }}
                canManage={canManage}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Dialogs */}
      {editNode && (
        <CreateTaxonomyDialog
          open={!!editNode}
          onClose={() => setEditNode(null)}
          onSuccess={() => { setEditNode(null); onRefresh(); }}
          editNode={editNode}
          defaultKind={kind}
        />
      )}

      <DeleteTaxonomyDialog
        node={deleteNode}
        onClose={() => setDeleteNode(null)}
        onSuccess={onRefresh}
      />

      <MergeTaxonomyDialog
        sourceNode={mergeSourceNode}
        onClose={() => setMergeSourceNode(null)}
        onSuccess={onRefresh}
      />

      <MoveTaxonomyDialog
        node={moveNode}
        onClose={() => setMoveNode(null)}
        onSuccess={onRefresh}
      />
    </div>
  );
}

// ── Tree utilities (pure functions, no React state) ────────────────────────────

function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  return nodes.reduce<TreeNode[]>((acc, node) => {
    const matches =
      node.name.toLowerCase().includes(query) ||
      node.slug.toLowerCase().includes(query) ||
      node.description?.toLowerCase().includes(query);

    const filteredChildren = filterTree(node.children, query);

    if (matches || filteredChildren.length > 0) {
      acc.push({ ...node, children: filteredChildren });
    }
    return acc;
  }, []);
}

function findParentId(nodes: TreeNode[], id: string): string | null {
  for (const node of nodes) {
    if (node.children.some((c) => c.id === id)) return node.id;
    const found = findParentId(node.children, id);
    if (found) return found;
  }
  return null;
}

function collectSiblings(nodes: TreeNode[], id: string): TreeNode[] {
  // Top-level siblings
  if (nodes.some((n) => n.id === id)) return nodes;
  for (const node of nodes) {
    const result = collectSiblings(node.children, id);
    if (result.length > 0) return result;
  }
  return [];
}

function reorderArray(arr: TreeNode[], sourceId: string, targetId: string): TreeNode[] {
  const sourceIdx = arr.findIndex((n) => n.id === sourceId);
  const targetIdx = arr.findIndex((n) => n.id === targetId);
  if (sourceIdx === -1 || targetIdx === -1) return arr;
  const result = [...arr];
  const [moved] = result.splice(sourceIdx, 1);
  result.splice(targetIdx, 0, moved);
  return result;
}
