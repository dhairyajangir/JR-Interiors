import React from "react";
import { Suspense } from "react";
import { getCurrentUser } from "../../../../features/auth/utils";
import { PageContainer } from "../../../../features/layout/components/page-container";
import { CategoriesPageClient } from "../../../../features/taxonomy/components/categories-page-client";
import { getTaxonomyTreeAction, listTaxonomiesAction } from "../../../../features/taxonomy/actions/taxonomy-actions";
import { TableSkeleton } from "../../../../components/ui/skeletons";
import { can } from "@jr/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Categories — JR Control",
  description: "Manage the hierarchical product category taxonomy",
};

export default async function CategoriesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  if (!can(user, "INVENTORY_READ")) redirect("/403");

  const canManage = can(user, "TAXONOMY_MANAGE");
  const canPublish = can(user, "CATALOG_APPROVE");

  // Fetch initial data
  const [listRes, treeRes] = await Promise.all([
    listTaxonomiesAction(
      { kind: "CATEGORY" },
      { limit: 25, sortBy: "sortOrder", sortOrder: "asc" }
    ),
    getTaxonomyTreeAction("CATEGORY"),
  ]);

  const initialNodes = listRes.success ? listRes.data.nodes : [];
  const initialTree = treeRes.success ? treeRes.data : [];
  const totalCount = listRes.success ? listRes.data.totalCount : 0;
  const pageInfo = listRes.success ? listRes.data.pageInfo : { hasNextPage: false, endCursor: null };

  return (
    <PageContainer
      title="Categories"
      description="Build and manage your product category hierarchy. Drag & drop to reorder, merge to consolidate."
    >
      <Suspense fallback={<TableSkeleton rows={8} cols={6} />}>
        <CategoriesPageClient
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
