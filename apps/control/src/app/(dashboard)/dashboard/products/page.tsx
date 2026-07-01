import React from "react";
import { getCurrentUser } from "../../../../features/auth/utils";
import { PageContainer } from "../../../../features/layout/components/page-container";
import { listProducts } from "../../../../features/products/services/product-service";
import { Plus, ArrowUpRight, Search, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { can } from "@jr/auth";

export const metadata = {
  title: "Products Catalog — JR Control",
  description: "Browse, filter, and manage the luxury furniture product catalog",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    room?: string;
    type?: string;
    cursor?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!can(user, "INVENTORY_READ")) redirect("/403");

  const params = await searchParams;

  const search = params.search || undefined;
  const status = (params.status as any) || undefined;
  const room = params.room || undefined;
  const type = params.type || undefined;
  const cursor = params.cursor || undefined;
  const sortBy = (params.sortBy as any) || "createdAt";
  const sortOrder = (params.sortOrder as any) || "desc";

  // Fetch products
  const result = await listProducts(
    { search, status, room, type },
    { cursor, limit: 25, field: sortBy, order: sortOrder },
    user
  );

  const products = result.nodes;
  const hasNextPage = result.pageInfo.hasNextPage;
  const endCursor = result.pageInfo.endCursor;

  const canWrite = can(user, "CATALOG_WRITE");
  const canPublish = can(user, "CATALOG_APPROVE");

  const primaryAction = canWrite ? (
    <Link
      href="/dashboard/products/new"
      className="inline-flex items-center space-x-2 bg-gold hover:bg-gold/90 text-primary hover:text-primary/95 text-xs font-semibold py-2 px-3.5 rounded-md shadow-sm transition-all duration-150"
    >
      <Plus className="h-3.5 w-3.5" />
      <span>Create Product</span>
    </Link>
  ) : null;

  return (
    <PageContainer
      title="Furniture Products"
      description="Create, manage, and audit showroom furniture products, finishes, and media."
      primaryAction={primaryAction}
    >
      <div className="space-y-6">
        {/* Filter bar */}
        <form method="GET" className="bg-panel border border-muted rounded-md p-4 flex flex-col md:flex-row items-center gap-4 luxury-shadow-sm select-none">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-secondary/60" />
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Search by name, SKU, material..."
              className="w-full bg-base border border-muted rounded-md py-2 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-bronze"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 w-full md:w-auto shrink-0">
            <select
              name="room"
              defaultValue={room || ""}
              className="bg-base border border-muted rounded-md py-2 px-2.5 text-xs outline-none focus:ring-1 focus:ring-bronze"
            >
              <option value="">All Rooms</option>
              <option value="Living">Living</option>
              <option value="Office">Office</option>
              <option value="Dining">Dining</option>
              <option value="Bedroom">Bedroom</option>
              <option value="Studio">Studio</option>
            </select>

            <select
              name="type"
              defaultValue={type || ""}
              className="bg-base border border-muted rounded-md py-2 px-2.5 text-xs outline-none focus:ring-1 focus:ring-bronze"
            >
              <option value="">All Types</option>
              <option value="Seating">Seating</option>
              <option value="Tables">Tables</option>
              <option value="Storage">Storage</option>
              <option value="Bedroom">Bedroom</option>
              <option value="Lighting">Lighting</option>
              <option value="Decor">Decor</option>
            </select>

            <select
              name="status"
              defaultValue={status || ""}
              className="bg-base border border-muted rounded-md py-2 px-2.5 text-xs outline-none focus:ring-1 focus:ring-bronze font-medium"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="PUBLISHED">Published</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-bronze hover:bg-bronze/90 text-panel text-xs font-semibold py-2 px-4 rounded-md transition-all shrink-0"
          >
            Apply Filters
          </button>
        </form>

        {/* Product Table Grid */}
        <div className="bg-panel border border-muted rounded-md overflow-hidden luxury-shadow-sm">
          {products.length === 0 ? (
            <div className="py-16 text-center text-secondary text-xs font-light">
              No products found in catalog matching the filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="border-b border-muted bg-sidebar/35 text-secondary uppercase font-semibold tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Ref ID</th>
                    <th className="py-3.5 px-4">Product Details</th>
                    <th className="py-3.5 px-4">Room & Type</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Base Price</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {products.map((p) => {
                    const formatted = (p.priceCents / 100).toLocaleString(undefined, {
                      style: "currency",
                      currency: "INR",
                    });
                    const isPublished = p.status === "PUBLISHED";
                    const isPending = p.status === "PENDING_REVIEW";
                    const isArchived = p.status === "ARCHIVED";
                    
                    return (
                      <tr key={p.id} className="hover:bg-base/30 transition-colors duration-100">
                        <td className="py-4 px-4 font-mono font-medium text-secondary">
                          {p.referenceId || "N/A"}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 shrink-0 bg-base rounded-md overflow-hidden border border-muted">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-secondary/35 text-[10px]">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-primary block truncate max-w-[200px]">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-secondary font-light block truncate max-w-[200px]">
                                {p.material}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-secondary font-light">
                          {p.room} &bull; {p.type}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                p.stock > 10
                                  ? "bg-success"
                                  : p.stock > 0
                                  ? "bg-warning"
                                  : "bg-error"
                              }`}
                            />
                            <span className="font-medium">{p.stock} units</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-primary">
                          {formatted}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide uppercase border ${
                              isPublished
                                ? "bg-success/10 text-success border-success/20"
                                : isPending
                                ? "bg-warning/10 text-warning border-warning/20"
                                : isArchived
                                ? "bg-secondary/15 text-secondary border-secondary/20"
                                : "bg-bronze/10 text-bronze border-bronze/20"
                            }`}
                          >
                            {p.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/dashboard/products/${p.id}`}
                              className="p-1.5 bg-panel hover:bg-base text-secondary hover:text-primary border border-muted rounded transition-all"
                              title="Edit product"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
