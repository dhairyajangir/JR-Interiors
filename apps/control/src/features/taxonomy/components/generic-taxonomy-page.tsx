/**
 * Generic taxonomy kind page factory.
 * Used for Rooms, Materials, Styles, and Finishes — any kind that
 * doesn't need a bespoke page beyond the standard taxonomy table.
 */

import React, { Suspense } from "react";
import { getCurrentUser } from "../../auth/utils";
import { PageContainer } from "../../layout/components/page-container";
import { GenericTaxonomyPageClient } from "./generic-taxonomy-page-client";
import {
  getTaxonomyTreeAction,
  listTaxonomiesAction,
} from "../actions/taxonomy-actions";
import { TableSkeleton } from "../../../components/ui/skeletons";
import { can } from "@jr/auth";
import { redirect } from "next/navigation";
import {
  TAX_KIND_LABELS,
  TAX_KIND_DESCRIPTIONS,
} from "../constants";
import type { TaxKind } from "../types";

interface GenericTaxonomyPageProps {
  kind: TaxKind;
}

export async function GenericTaxonomyPage({ kind }: GenericTaxonomyPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (!can(user, "INVENTORY_READ")) redirect("/403");

  const canManage = can(user, "TAXONOMY_MANAGE");
  const canPublish = can(user, "CATALOG_APPROVE");

  const [listRes, treeRes] = await Promise.all([
    listTaxonomiesAction(
      { kind },
      { limit: 25, sortBy: "sortOrder", sortOrder: "asc" }
    ),
    getTaxonomyTreeAction(kind),
  ]);

  const initialNodes = listRes.success ? listRes.data.nodes : [];
  const initialTree = treeRes.success ? treeRes.data : [];
  const totalCount = listRes.success ? listRes.data.totalCount : 0;
  const pageInfo = listRes.success
    ? listRes.data.pageInfo
    : { hasNextPage: false, endCursor: null };

  return (
    <PageContainer
      title={TAX_KIND_LABELS[kind]}
      description={TAX_KIND_DESCRIPTIONS[kind]}
    >
      <Suspense fallback={<TableSkeleton rows={6} cols={5} />}>
        <GenericTaxonomyPageClient
          kind={kind}
          initialNodes={initialNodes}
          initialTree={initialTree}
          totalCount={totalCount}
          pageInfo={pageInfo}
          canManage={canManage}
          canPublish={canPublish}
        />
      </Suspense>
    </PageContainer>
  );
}
