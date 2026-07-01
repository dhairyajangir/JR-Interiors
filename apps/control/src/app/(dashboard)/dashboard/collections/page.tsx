import React, { Suspense } from "react";
import { getCurrentUser } from "../../../../features/auth/utils";
import { PageContainer } from "../../../../features/layout/components/page-container";
import { CollectionsPageClient } from "../../../../features/taxonomy/components/collections-page-client";
import { getTaxonomyTreeAction, listTaxonomiesAction } from "../../../../features/taxonomy/actions/taxonomy-actions";
import { TableSkeleton } from "../../../../components/ui/skeletons";
import { can } from "@jr/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Collections — JR Control",
  description: "Manage editorial product collections for the storefront",
};

export default async function CollectionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (!can(user, "INVENTORY_READ")) redirect("/403");

  const canManage = can(user, "TAXONOMY_MANAGE");
  const canPublish = can(user, "CATALOG_APPROVE");

  const [listRes, treeRes] = await Promise.all([
    listTaxonomiesAction(
      { kind: "COLLECTION" },
      { limit: 25, sortBy: "sortOrder", sortOrder: "asc" }
    ),
    getTaxonomyTreeAction("COLLECTION"),
  ]);

  const initialNodes = listRes.success ? listRes.data.nodes : [];
  const initialTree = treeRes.success ? treeRes.data : [];
  const totalCount = listRes.success ? listRes.data.totalCount : 0;
  const pageInfo = listRes.success
    ? listRes.data.pageInfo
    : { hasNextPage: false, endCursor: null };

  return (
    <PageContainer
      title="Collections"
      description="Curate editorial product collections — Atelier, Luxury Office, Minimal Living, and more."
    >
      <Suspense fallback={<TableSkeleton rows={6} cols={5} />}>
        <CollectionsPageClient
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
