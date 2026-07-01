import { prisma } from "@jr/database";
import { paginateWithCursor } from "../../../lib/pagination";
import { buildSearchQuery } from "../../../lib/search";
import type {
  TaxonomyFilters,
  TaxonomySortOptions,
  TaxonomyNode,
  TaxonomyTreeNode,
  TaxonomyWithParent,
} from "../types";

// ── Shared select shapes ──────────────────────────────────────────────────────

const TAXONOMY_BASE_SELECT = {
  id: true,
  kind: true,
  name: true,
  slug: true,
  description: true,
  coverImage: true,
  bannerImage: true,
  icon: true,
  parentId: true,
  sortOrder: true,
  status: true,
  visibility: true,
  publishedAt: true,
  slugLocked: true,
  seoTitle: true,
  seoDesc: true,
  seoKeywords: true,
  productCount: true,
  childCount: true,
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
};

const TAXONOMY_WITH_PARENT_INCLUDE = {
  parent: {
    select: { id: true, name: true, slug: true },
  },
};

// ── Single node queries ───────────────────────────────────────────────────────

export async function findById(id: string) {
  return prisma.taxonomy.findUnique({
    where: { id },
    include: {
      ...TAXONOMY_WITH_PARENT_INCLUDE,
      children: {
        select: TAXONOMY_BASE_SELECT,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });
}

export async function findBySlug(slug: string) {
  return prisma.taxonomy.findUnique({
    where: { slug },
    include: TAXONOMY_WITH_PARENT_INCLUDE,
  });
}

// ── Flat paginated list ───────────────────────────────────────────────────────

export async function findManyTaxonomies(
  filters: TaxonomyFilters,
  pagination: { cursor?: string; limit?: number } & TaxonomySortOptions
) {
  const where: Record<string, any> = {};

  if (filters.kind) {
    where.kind = filters.kind;
  }

  if (filters.status) {
    where.status = filters.status;
  } else {
    where.status = { not: "ARCHIVED" };
  }

  if (filters.visibility) {
    where.visibility = filters.visibility;
  }

  // parentId: null = top-level only, undefined = any, string = specific parent
  if (filters.parentId !== undefined) {
    where.parentId = filters.parentId;
  }

  if (filters.hasParent !== undefined) {
    where.parentId = filters.hasParent ? { not: null } : null;
  }

  if (filters.createdAfter || filters.createdBefore) {
    where.createdAt = {};
    if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
    if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
  }

  if (filters.search) {
    const searchCondition = buildSearchQuery(filters.search, [
      "name",
      "slug",
      "description",
    ]);
    if (searchCondition) Object.assign(where, searchCondition);
  }

  return paginateWithCursor<any>(prisma.taxonomy, {
    where,
    cursor: pagination.cursor,
    limit: pagination.limit,
    sortBy: pagination.field ?? "sortOrder",
    sortOrder: pagination.order ?? "asc",
    include: TAXONOMY_WITH_PARENT_INCLUDE,
  });
}

// ── Tree queries ──────────────────────────────────────────────────────────────

/**
 * Fetch all nodes for a kind and assemble a client-side tree.
 * Uses a flat DB fetch + in-memory build — efficient up to ~10k nodes.
 */
export async function findFlatForTree(
  kind?: string,
  status?: string
): Promise<TaxonomyNode[]> {
  const where: Record<string, any> = {};
  if (kind) where.kind = kind;
  if (status) where.status = status;

  return prisma.taxonomy.findMany({
    where,
    select: TAXONOMY_BASE_SELECT,
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  }) as Promise<TaxonomyNode[]>;
}

/**
 * Build a tree structure from a flat list.
 * Returns root nodes with nested children.
 */
export function buildTree(
  nodes: TaxonomyNode[],
  parentId: string | null = null,
  depth = 0,
  ancestorNames: string[] = []
): TaxonomyTreeNode[] {
  return nodes
    .filter((n) => n.parentId === parentId)
    .map((node) => {
      const breadcrumb = [...ancestorNames, node.name];
      return {
        ...node,
        depth,
        breadcrumb,
        children: buildTree(nodes, node.id, depth + 1, breadcrumb),
      };
    });
}

/**
 * Find all ancestor IDs for a given node (breadcrumb chain).
 * Uses iterative DB lookups (shallow chains expected).
 */
export async function findAncestors(
  id: string
): Promise<Array<Pick<TaxonomyNode, "id" | "name" | "slug">>> {
  const ancestors: Array<Pick<TaxonomyNode, "id" | "name" | "slug">> = [];
  let current = await prisma.taxonomy.findUnique({
    where: { id },
    select: { parentId: true, id: true, name: true, slug: true },
  });

  while (current?.parentId) {
    const parent = await prisma.taxonomy.findUnique({
      where: { id: current.parentId },
      select: { parentId: true, id: true, name: true, slug: true },
    });
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }

  return ancestors;
}

/**
 * Collect ALL descendant IDs of a node (for safe-delete checks and merges).
 * Iterative BFS to avoid recursion stack issues.
 */
export async function findDescendantIds(id: string): Promise<string[]> {
  const result: string[] = [];
  const queue: string[] = [id];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = await prisma.taxonomy.findMany({
      where: { parentId: currentId },
      select: { id: true },
    });
    for (const child of children) {
      result.push(child.id);
      queue.push(child.id);
    }
  }

  return result;
}

// ── Write operations ──────────────────────────────────────────────────────────

export interface CreateTaxonomyInput {
  name: string;
  slug: string;
  kind: string;
  description?: string;
  coverImage?: string;
  bannerImage?: string;
  icon?: string;
  parentId?: string | null;
  sortOrder?: number;
  visibility?: string;
  seoTitle?: string;
  seoDesc?: string;
  seoKeywords?: string[];
  createdById?: string;
}

export interface UpdateTaxonomyInput extends Partial<CreateTaxonomyInput> {
  status?: string;
  slugLocked?: boolean;
  publishedAt?: Date | null;
  updatedById?: string;
}

export async function createTaxonomy(data: CreateTaxonomyInput) {
  return prisma.taxonomy.create({
    data: {
      name: data.name,
      slug: data.slug,
      kind: data.kind as any,
      description: data.description,
      coverImage: data.coverImage,
      bannerImage: data.bannerImage,
      icon: data.icon,
      parentId: data.parentId,
      sortOrder: data.sortOrder ?? 0,
      visibility: (data.visibility ?? "PUBLIC") as any,
      seoTitle: data.seoTitle,
      seoDesc: data.seoDesc,
      seoKeywords: data.seoKeywords ?? [],
      createdById: data.createdById,
      updatedById: data.createdById,
    },
  });
}

export async function updateTaxonomy(id: string, data: UpdateTaxonomyInput) {
  return prisma.taxonomy.update({
    where: { id },
    data: data as any,
  });
}

export async function deleteTaxonomy(id: string) {
  return prisma.taxonomy.delete({ where: { id } });
}

// ── Move ──────────────────────────────────────────────────────────────────────

export async function moveTaxonomy(
  id: string,
  newParentId: string | null
) {
  return prisma.taxonomy.update({
    where: { id },
    data: { parentId: newParentId },
  });
}

// ── Merge ─────────────────────────────────────────────────────────────────────

/**
 * Merge source → target.
 * 1. Re-parent all direct children of source to target.
 * 2. Move all ProductTaxonomy rows from source to target (skip duplicates).
 * 3. Delete the source node.
 *
 * Runs in a transaction for atomicity.
 */
export async function mergeTaxonomy(sourceId: string, targetId: string) {
  return prisma.$transaction(async (tx) => {
    // 1. Re-parent children
    await tx.taxonomy.updateMany({
      where: { parentId: sourceId },
      data: { parentId: targetId },
    });

    // 2. Move product links — upsert to avoid unique constraint violations
    const sourceLinks = await tx.productTaxonomy.findMany({
      where: { taxonomyId: sourceId },
    });

    for (const link of sourceLinks) {
      await tx.productTaxonomy.upsert({
        where: {
          productId_taxonomyId: {
            productId: link.productId,
            taxonomyId: targetId,
          },
        },
        update: {
          primary: link.primary, // keep primary if it was primary in source
        },
        create: {
          productId: link.productId,
          taxonomyId: targetId,
          primary: link.primary,
        },
      });
    }

    // 3. Delete source links + source node
    await tx.productTaxonomy.deleteMany({ where: { taxonomyId: sourceId } });
    await tx.taxonomy.delete({ where: { id: sourceId } });

    return { sourceId, targetId };
  });
}

// ── Reorder ───────────────────────────────────────────────────────────────────

/**
 * Batch-update sortOrder for a list of sibling nodes.
 * orderedIds must contain all siblings under the given parentId.
 */
export async function reorderTaxonomies(
  orderedIds: string[],
  parentId: string | null
) {
  const updates = orderedIds.map((id, index) =>
    prisma.taxonomy.update({
      where: { id },
      data: { sortOrder: index },
    })
  );
  return prisma.$transaction(updates);
}

// ── Count cache ───────────────────────────────────────────────────────────────

/**
 * Recalculate and persist productCount + childCount for a node.
 * Call after mutations that might affect counts.
 */
export async function recalculateCounts(id: string) {
  const [productCount, childCount] = await Promise.all([
    prisma.productTaxonomy.count({ where: { taxonomyId: id } }),
    prisma.taxonomy.count({ where: { parentId: id } }),
  ]);

  return prisma.taxonomy.update({
    where: { id },
    data: { productCount, childCount },
  });
}

/**
 * Recalculate counts for all taxonomy nodes (full rebuild).
 */
export async function recalculateAllCounts() {
  const all = await prisma.taxonomy.findMany({ select: { id: true } });
  for (const { id } of all) {
    await recalculateCounts(id);
  }
  return { rebuiltCount: all.length };
}

// ── Product assignment ────────────────────────────────────────────────────────

export async function assignProduct(
  productId: string,
  taxonomyId: string,
  primary = false
) {
  // If this is primary, demote any existing primary assignment for this product
  if (primary) {
    await prisma.productTaxonomy.updateMany({
      where: { productId, primary: true },
      data: { primary: false },
    });
  }

  return prisma.productTaxonomy.upsert({
    where: { productId_taxonomyId: { productId, taxonomyId } },
    update: { primary },
    create: { productId, taxonomyId, primary },
  });
}

export async function removeProduct(productId: string, taxonomyId: string) {
  return prisma.productTaxonomy.deleteMany({
    where: { productId, taxonomyId },
  });
}

export async function findProductTaxonomies(productId: string) {
  return prisma.productTaxonomy.findMany({
    where: { productId },
    include: {
      taxonomy: {
        select: { id: true, kind: true, name: true, slug: true, status: true },
      },
    },
    orderBy: [{ primary: "desc" }, { createdAt: "asc" }],
  });
}

export async function findTaxonomyProducts(
  taxonomyId: string,
  pagination: { cursor?: string; limit?: number }
) {
  return paginateWithCursor<any>(prisma.productTaxonomy, {
    where: { taxonomyId },
    cursor: pagination.cursor,
    limit: pagination.limit,
    sortBy: "createdAt",
    sortOrder: "desc",
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          status: true,
          priceCents: true,
        },
      },
    },
  });
}

// ── Slug uniqueness check ─────────────────────────────────────────────────────

export async function isSlugTaken(slug: string, excludeId?: string) {
  const existing = await prisma.taxonomy.findUnique({ where: { slug } });
  if (!existing) return false;
  if (excludeId && existing.id === excludeId) return false;
  return true;
}
