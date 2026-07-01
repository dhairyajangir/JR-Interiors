"use client";

import React, { useState, useCallback, useRef, useId } from "react";
import {
  ChevronRight,
  Package,
  MoreHorizontal,
  Pencil,
  FolderInput,
  GitMerge,
  ArchiveX,
  Trash2,
  Eye,
  Globe,
  EyeOff,
  GripVertical,
} from "lucide-react";
import type { TaxonomyTreeNode, TaxKind } from "../types";
import {
  TAX_STATUS_COLORS,
  TAX_VISIBILITY_COLORS,
  TAX_STATUS_LABELS,
  TAX_VISIBILITY_LABELS,
} from "../constants";

interface TaxonomyTreeNodeProps {
  node: TaxonomyTreeNode;
  /** Drag source element (for DnD) — null if DnD not enabled */
  onDragStart?: (e: React.DragEvent, nodeId: string) => void;
  onDragOver?: (e: React.DragEvent, nodeId: string) => void;
  onDrop?: (e: React.DragEvent, nodeId: string) => void;
  dragOverId?: string | null;
  /** Actions */
  onEdit: (node: TaxonomyTreeNode) => void;
  onMove: (node: TaxonomyTreeNode) => void;
  onMerge: (node: TaxonomyTreeNode) => void;
  onArchive: (node: TaxonomyTreeNode) => void;
  onDelete: (node: TaxonomyTreeNode) => void;
  onPreview: (node: TaxonomyTreeNode) => void;
  /** Permissions */
  canManage: boolean;
  /** Max depth for UI display (children beyond are still accessible via expand) */
  maxDisplayDepth?: number;
}

export function TaxonomyTreeNodeItem({
  node,
  onDragStart,
  onDragOver,
  onDrop,
  dragOverId,
  onEdit,
  onMove,
  onMerge,
  onArchive,
  onDelete,
  onPreview,
  canManage,
  maxDisplayDepth = 10,
}: TaxonomyTreeNodeProps) {
  const [expanded, setExpanded] = useState(node.depth === 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const hasChildren = node.children.length > 0;
  const indentPx = Math.min(node.depth * 20, 120); // cap indent for very deep trees
  const isDragOver = dragOverId === node.id;

  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((p) => !p);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          if (!expanded && hasChildren) { e.preventDefault(); setExpanded(true); }
          break;
        case "ArrowLeft":
          if (expanded) { e.preventDefault(); setExpanded(false); }
          break;
        case "Enter":
          onPreview(node);
          break;
      }
    },
    [expanded, hasChildren, node, onPreview]
  );

  const statusColor = TAX_STATUS_COLORS[node.status];
  const visibilityColor = TAX_VISIBILITY_COLORS[node.visibility];

  return (
    <li
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-label={node.name}
      className={`
        group relative
        ${isDragOver ? "ring-1 ring-gold/50 rounded-md" : ""}
      `}
      draggable={canManage}
      onDragStart={canManage ? (e) => onDragStart?.(e, node.id) : undefined}
      onDragOver={canManage ? (e) => { e.preventDefault(); onDragOver?.(e, node.id); } : undefined}
      onDrop={canManage ? (e) => onDrop?.(e, node.id) : undefined}
    >
      {/* Node row */}
      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="
          flex items-center gap-2 px-2 py-1.5 rounded-md
          hover:bg-heavy/30 focus:outline-none focus:bg-heavy/30
          focus-visible:ring-1 focus-visible:ring-gold/40
          cursor-default transition-colors group/row
        "
        style={{ paddingLeft: `${indentPx + 8}px` }}
      >
        {/* Drag handle */}
        {canManage && (
          <GripVertical className="h-3 w-3 text-secondary/40 group-hover/row:text-secondary shrink-0 cursor-grab active:cursor-grabbing" />
        )}

        {/* Expand/collapse toggle */}
        <button
          type="button"
          onClick={toggleExpand}
          className={`
            shrink-0 h-4 w-4 flex items-center justify-center
            text-secondary transition-all duration-150
            ${hasChildren ? "hover:text-primary" : "opacity-0 pointer-events-none"}
          `}
          aria-label={expanded ? "Collapse" : "Expand"}
          tabIndex={-1}
        >
          <ChevronRight
            className={`h-3 w-3 transition-transform duration-150 ${expanded ? "rotate-90" : ""}`}
          />
        </button>

        {/* Name + breadcrumb hint */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onPreview(node)}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary truncate">
              {node.name}
            </span>
            {/* Status badge */}
            <span
              className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border ${statusColor}`}
            >
              {TAX_STATUS_LABELS[node.status]}
            </span>
            {/* Unlisted/private indicator */}
            {node.visibility !== "PUBLIC" && (
              <span
                className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border ${visibilityColor}`}
              >
                {TAX_VISIBILITY_LABELS[node.visibility]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-secondary font-mono truncate">
              /{node.slug}
            </span>
            {/* Breadcrumb preview (visible on hover) */}
            {node.depth > 0 && (
              <span className="hidden group-hover/row:block text-[10px] text-secondary/60 truncate">
                {node.breadcrumb.slice(0, -1).join(" › ")}
              </span>
            )}
          </div>
        </div>

        {/* Counters */}
        <div className="hidden group-hover/row:flex items-center gap-3 shrink-0 text-[10px] text-secondary">
          {node.childCount > 0 && (
            <span className="flex items-center gap-1">
              <ChevronRight className="h-2.5 w-2.5" />
              {node.childCount}
            </span>
          )}
          {node.productCount > 0 && (
            <span className="flex items-center gap-1">
              <Package className="h-2.5 w-2.5" />
              {node.productCount}
            </span>
          )}
        </div>

        {/* Visibility icon */}
        <div className="shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
          {node.visibility === "PUBLIC" ? (
            <Globe className="h-3 w-3 text-secondary/60" />
          ) : node.visibility === "UNLISTED" ? (
            <Eye className="h-3 w-3 text-secondary/60" />
          ) : (
            <EyeOff className="h-3 w-3 text-secondary/60" />
          )}
        </div>

        {/* Context menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            id={menuId}
            onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p); }}
            className="
              h-6 w-6 flex items-center justify-center rounded
              opacity-0 group-hover/row:opacity-100 transition-opacity
              text-secondary hover:text-primary hover:bg-heavy/50
            "
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Node actions"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>

          {menuOpen && (
            <ContextMenu
              onEdit={() => { setMenuOpen(false); onEdit(node); }}
              onMove={() => { setMenuOpen(false); onMove(node); }}
              onMerge={() => { setMenuOpen(false); onMerge(node); }}
              onArchive={() => { setMenuOpen(false); onArchive(node); }}
              onDelete={() => { setMenuOpen(false); onDelete(node); }}
              onClose={() => setMenuOpen(false)}
              canManage={canManage}
            />
          )}
        </div>
      </div>

      {/* Recursively render children */}
      {hasChildren && expanded && (
        <ul role="group" className="mt-0.5">
          {node.children.map((child) => (
            <TaxonomyTreeNodeItem
              key={child.id}
              node={child}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              dragOverId={dragOverId}
              onEdit={onEdit}
              onMove={onMove}
              onMerge={onMerge}
              onArchive={onArchive}
              onDelete={onDelete}
              onPreview={onPreview}
              canManage={canManage}
              maxDisplayDepth={maxDisplayDepth}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ── Context menu ──────────────────────────────────────────────────────────────

interface ContextMenuProps {
  onEdit: () => void;
  onMove: () => void;
  onMerge: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClose: () => void;
  canManage: boolean;
}

function ContextMenu({
  onEdit,
  onMove,
  onMerge,
  onArchive,
  onDelete,
  onClose,
  canManage,
}: ContextMenuProps) {
  // Close on outside click
  React.useEffect(() => {
    const handler = () => onClose();
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [onClose]);

  return (
    <div
      role="menu"
      className="
        absolute right-0 top-7 z-50 w-44
        bg-panel border border-muted rounded-md shadow-xl
        py-1 overflow-hidden
        animate-in slide-in-from-top-1 duration-100
      "
      onClick={(e) => e.stopPropagation()}
    >
      <MenuAction icon={<Pencil className="h-3 w-3" />} label="Edit" onClick={onEdit} />

      {canManage && (
        <>
          <MenuAction icon={<FolderInput className="h-3 w-3" />} label="Move to…" onClick={onMove} />
          <MenuAction icon={<GitMerge className="h-3 w-3" />} label="Merge into…" onClick={onMerge} />
          <div className="my-1 border-t border-muted/50" />
          <MenuAction
            icon={<ArchiveX className="h-3 w-3" />}
            label="Archive"
            onClick={onArchive}
            variant="warning"
          />
          <MenuAction
            icon={<Trash2 className="h-3 w-3" />}
            label="Delete"
            onClick={onDelete}
            variant="danger"
          />
        </>
      )}
    </div>
  );
}

interface MenuActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger" | "warning";
}

function MenuAction({ icon, label, onClick, variant = "default" }: MenuActionProps) {
  const variantClass = {
    default: "text-secondary hover:text-primary hover:bg-heavy/30",
    danger:  "text-red-400 hover:text-red-300 hover:bg-red-500/10",
    warning: "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10",
  }[variant];

  return (
    <button
      role="menuitem"
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors
        ${variantClass}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
