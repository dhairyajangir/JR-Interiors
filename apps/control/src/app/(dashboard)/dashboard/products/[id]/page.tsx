import React from "react";
import { getCurrentUser } from "../../../../../features/auth/utils";
import { ProductEditor } from "../../../../../features/products/components/product-editor";
import { getProductById } from "../../../../../features/products/services/product-service";
import { prisma } from "@jr/database";
import { can } from "@jr/auth";
import { redirect, notFound } from "next/navigation";

export const metadata = {
  title: "Manage Product — JR Control",
  description: "Configure product catalog settings, prices, and finishes",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!can(user, "INVENTORY_READ")) redirect("/403");

  const { id } = await params;

  // Retrieve product using service (applies Seller security filter automatically)
  let product;
  try {
    product = await getProductById(id, user);
  } catch (err) {
    console.error(err);
    redirect("/403");
  }

  if (!product) {
    notFound();
  }

  // Fetch categories, collections, and audit logs
  const [categories, collections, logs] = await Promise.all([
    prisma.taxonomy.findMany({
      where: { kind: "CATEGORY", status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.taxonomy.findMany({
      where: { kind: "COLLECTION", status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.auditLog.findMany({
      where: { entity: "Product", entityId: id },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Map database logs to HistoryItems structure
  const auditLogs = logs.map((log) => {
    let details = {};
    if (log.details) {
      try {
        details = JSON.parse(log.details);
      } catch (err) {
        console.error("Failed to parse audit log details:", err);
      }
    }
    return {
      id: log.id,
      action: log.action,
      createdAt: log.createdAt.toISOString(),
      userEmail: log.user?.email ?? "system@jrinteriors.in",
      userName: log.user?.fullName ?? "System Event",
      userRole: log.user?.role ?? "SYSTEM",
      details,
    };
  });

  return (
    <ProductEditor
      initialProduct={product}
      categories={categories}
      collections={collections}
      auditLogs={auditLogs}
    />
  );
}
