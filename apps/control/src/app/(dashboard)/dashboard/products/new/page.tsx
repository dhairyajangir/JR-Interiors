import React from "react";
import { getCurrentUser } from "../../../../../features/auth/utils";
import { ProductEditor } from "../../../../../features/products/components/product-editor";
import { prisma } from "@jr/database";
import { can } from "@jr/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "New Product — JR Control",
  description: "Draft a new luxury furniture item in the catalog",
};

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!can(user, "CATALOG_WRITE")) redirect("/403");

  // Fetch categories and collections for assignment selection options
  const [categories, collections] = await Promise.all([
    prisma.taxonomy.findMany({
      where: { kind: "CATEGORY", status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.taxonomy.findMany({
      where: { kind: "COLLECTION", status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <ProductEditor
      categories={categories}
      collections={collections}
      auditLogs={[]}
    />
  );
}
