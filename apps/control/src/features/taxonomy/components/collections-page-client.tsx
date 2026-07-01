"use client";

import React, { useState, useCallback, useTransition } from "react";
import { TaxonomyTable } from "./taxonomy-table";
import { listTaxonomiesAction } from "../actions/taxonomy-actions";
import type {
  TaxonomyWithParent,
  TaxonomyFilters,
  TaxonomySortField,
  SortOrder,
  TaxonomyTreeNode,
} from "../types";

interface CollectionsPageClientProps {
  initialNodes: TaxonomyWithParent[];
  initialTree: TaxonomyTreeNode[];
  totalCount: number;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  canManage: boolean;
  canPublish: boolean;
}

export function CollectionsPageClient({
  initialNodes,
  initialTree,
  totalCount,
  pageInfo,
  canManage,
  canPublish,
}: CollectionsPageClientProps) {
  const [nodes, setNodes] = useState(initialNodes);
  const [tree] = useState(initialTree);
  const [count, setCount] = useState(totalCount);
  const [currentPageInfo, setPageInfo] = useState(pageInfo);
  const [filters, setFilters] = useState<TaxonomyFilters>({ kind: "COLLECTION" });
  const [sortField, setSortField] = useState<TaxonomySortField>("sortOrder");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [cursor, setCursor] = useState<string | undefined>();
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const fetchPage = useCallback(
    async (
      overrideFilters?: TaxonomyFilters,
      overrideCursor?: string,
      overrideSortField?: TaxonomySortField,
      overrideSortOrder?: SortOrder
    ) => {
      const activeFilters = { ...(overrideFilters ?? filters), kind: "COLLECTION" as const };
      const res = await listTaxonomiesAction(activeFilters, {
        limit: 25,
        cursor: overrideCursor,
        sortBy: overrideSortField ?? sortField,
        sortOrder: overrideSortOrder ?? sortOrder,
      });
      if (res.success) {
        setNodes(res.data.nodes);
        setCount(res.data.totalCount);
        setPageInfo(res.data.pageInfo);
      }
    },
    [filters, sortField, sortOrder]
  );

  const handleFiltersChange = useCallback(
    (newFilters: TaxonomyFilters) => {
      const merged = { ...newFilters, kind: "COLLECTION" as const };
      setFilters(merged);
      setCursor(undefined);
      setCursorHistory([]);
      startTransition(() => fetchPage(merged));
    },
    [fetchPage]
  );

  const handleSortChange = useCallback(
    (field: TaxonomySortField, order: SortOrder) => {
      setSortField(field);
      setSortOrder(order);
      setCursor(undefined);
      setCursorHistory([]);
      startTransition(() => fetchPage(undefined, undefined, field, order));
    },
    [fetchPage]
  );

  const handleNextPage = useCallback(() => {
    if (!currentPageInfo.endCursor) return;
    setCursorHistory((prev) => [...prev, cursor ?? ""]);
    const nextCursor = currentPageInfo.endCursor!;
    setCursor(nextCursor);
    startTransition(() => fetchPage(undefined, nextCursor));
  }, [currentPageInfo, cursor, fetchPage]);

  const handlePrevPage = useCallback(() => {
    const history = [...cursorHistory];
    const prevCursor = history.pop() || undefined;
    setCursorHistory(history);
    setCursor(prevCursor);
    startTransition(() => fetchPage(undefined, prevCursor));
  }, [cursorHistory, fetchPage]);

  const handleRefresh = useCallback(() => {
    startTransition(() => fetchPage());
  }, [fetchPage]);

  return (
    <TaxonomyTable
      nodes={nodes}
      tree={tree}
      totalCount={count}
      hasNextPage={currentPageInfo.hasNextPage}
      endCursor={currentPageInfo.endCursor}
      filters={filters}
      sortField={sortField}
      sortOrder={sortOrder}
      lockKind="COLLECTION"
      onFiltersChange={handleFiltersChange}
      onSortChange={handleSortChange}
      onNextPage={handleNextPage}
      onPrevPage={handlePrevPage}
      onRefresh={handleRefresh}
      canManage={canManage}
      canPublish={canPublish}
    />
  );
}
