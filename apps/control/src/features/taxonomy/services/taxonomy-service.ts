import * as repo from "../repository/taxonomy-repository";
import { logAuditAction, computeObjectDiff } from "../../../lib/audit";
import {
  CreateTaxonomySchema,
  UpdateTaxonomySchema,
  MoveTaxonomySchema,
  MergeTaxonomySchema,
  ReorderTaxonomySchema,
  BulkTaxonomySchema,
  BulkMoveSchema,
  BulkVisibilitySchema,
  AssignProductSchema,
  RemoveProductSchema,
} from "../validators/taxonomy";
import { TAXONOMY_AUDIT_ACTIONS, TAXONOMY_LIMITS } from "../constants";
import { can, AuthorizationError } from "@jr/auth";
import type { User } from "@jr/types";
import type { TaxonomyFilters, TaxonomySortOptions } from "../types";

/**
 * Taxonomy Business Service Layer
 *
 * Every public function:
 * 1. Verifies RBAC permissions
 * 2. Validates input (Zod)
 * 3. Enforces domain invariants (circular refs, slug locks, depth limits)
 * 4. Delegates to repository
 * 5. Writes audit log
 *
 * No Prisma queries live here — all DB access goes through the repository.
 */

// ── Permission helpers ────────────────────────────────────────────────────────

function requireTaxonomyManage(user: User) {
  if (!can(user, "TAXONOMY_MANAGE")) {
    throw new AuthorizationError(
      "You do not have permission to manage the taxonomy system."
    );
  }
}

function requireInventoryRead(user: User) {
  if (!can(user, "INVENTORY_READ")) {
    throw new AuthorizationError("You do not have permission to view taxonomy.");
  }
}

// ── Read operations ───────────────────────────────────────────────────────────

export async function getTaxonomyById(id: string, currentUser: User) {
  requireInventoryRead(currentUser);
  const node = await repo.findById(id);
  if (!node) throw new Error("Taxonomy node not found");
  return node;
}

export async function getTaxonomyBySlug(slug: string, currentUser: User) {
  requireInventoryRead(currentUser);
  const node = await repo.findBySlug(slug);
  if (!node) throw new Error("Taxonomy node not found");
  return node;
}

export async function listTaxonomies(
  filters: TaxonomyFilters,
  pagination: { cursor?: string; limit?: number } & TaxonomySortOptions,
  currentUser: User
) {
  requireInventoryRead(currentUser);
  return repo.findManyTaxonomies(filters, pagination);
}

export async function getTaxonomyTree(
  kind: string | undefined,
  currentUser: User
) {
  requireInventoryRead(currentUser);
  const flatNodes = await repo.findFlatForTree(kind);
  return repo.buildTree(flatNodes);
}

export async function getTaxonomyAncestors(id: string, currentUser: User) {
  requireInventoryRead(currentUser);
  return repo.findAncestors(id);
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createTaxonomyService(input: unknown, currentUser: User) {
  requireTaxonomyManage(currentUser);

  const validated = CreateTaxonomySchema.parse(input);

  // Slug uniqueness check
  if (await repo.isSlugTaken(validated.slug)) {
    throw new Error(`Slug "${validated.slug}" is already in use.`);
  }

  // Validate parent exists and has the same kind (for CATEGORY hierarchy)
  if (validated.parentId) {
    const parent = await repo.findById(validated.parentId);
    if (!parent) throw new Error("Parent taxonomy node not found.");

    // Collections, rooms, materials, styles, finishes cannot be children of different kinds
    if (
      validated.kind !== "CATEGORY" &&
      parent.kind !== validated.kind
    ) {
      throw new Error(
        `A "${validated.kind}" node cannot be nested under a "${parent.kind}" node.`
      );
    }

    // Enforce depth limit
    const ancestors = await repo.findAncestors(validated.parentId);
    if (ancestors.length >= TAXONOMY_LIMITS.MAX_DEPTH_HARD) {
      throw new Error(
        `Maximum nesting depth of ${TAXONOMY_LIMITS.MAX_DEPTH_HARD} reached.`
      );
    }
  }

  const node = await repo.createTaxonomy({
    ...validated,
    createdById: currentUser.id,
  } as any);

  // Refresh parent's childCount
  if (validated.parentId) {
    await repo.recalculateCounts(validated.parentId);
  }

  await logAuditAction({
    userId: currentUser.id,
    action: TAXONOMY_AUDIT_ACTIONS.TAXONOMY_CREATED,
    entity: "Taxonomy",
    entityId: node.id,
    details: { name: node.name, slug: node.slug, kind: node.kind },
  });

  return node;
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateTaxonomyService(
  id: string,
  input: unknown,
  currentUser: User
) {
  requireTaxonomyManage(currentUser);

  const existing = await repo.findById(id);
  if (!existing) throw new Error("Taxonomy node not found.");

  const validated = UpdateTaxonomySchema.parse(input);

  // Slug change guard
  if (validated.slug && validated.slug !== existing.slug) {
    if (existing.slugLocked) {
      throw new Error(
        `The slug "${existing.slug}" is locked because this node has been published. ` +
          "Create a redirect instead."
      );
    }
    if (await repo.isSlugTaken(validated.slug, id)) {
      throw new Error(`Slug "${validated.slug}" is already in use.`);
    }
  }

  // Status transition guard
  if (validated.status && validated.status !== existing.status) {
    validateStatusTransition(existing.status as string, validated.status);
  }

  // Prevent direct publish without CATALOG_APPROVE
  if (validated.status === "PUBLISHED" && !can(currentUser, "CATALOG_APPROVE")) {
    throw new AuthorizationError(
      "Only administrators with catalog approval rights can publish taxonomy nodes."
    );
  }

  const updated = await repo.updateTaxonomy(id, {
    ...validated,
    updatedById: currentUser.id,
    // Lock slug on first publish
    slugLocked: validated.status === "PUBLISHED" ? true : existing.slugLocked,
    publishedAt:
      validated.status === "PUBLISHED" && !existing.publishedAt
        ? new Date()
        : existing.publishedAt,
  });

  const diff = computeObjectDiff(existing as any, updated as any);
  if (diff) {
    await logAuditAction({
      userId: currentUser.id,
      action: TAXONOMY_AUDIT_ACTIONS.TAXONOMY_UPDATED,
      entity: "Taxonomy",
      entityId: id,
      details: diff,
    });
  }

  return updated;
}

// ── Publish ───────────────────────────────────────────────────────────────────

export async function publishTaxonomyService(id: string, currentUser: User) {
  if (!can(currentUser, "CATALOG_APPROVE")) {
    throw new AuthorizationError(
      "Only administrators can publish taxonomy nodes."
    );
  }

  const existing = await repo.findById(id);
  if (!existing) throw new Error("Taxonomy node not found.");

  if (existing.status === "ARCHIVED") {
    throw new Error("Cannot publish an archived node. Restore it first.");
  }

  const updated = await repo.updateTaxonomy(id, {
    status: "PUBLISHED",
    slugLocked: true,
    publishedAt: existing.publishedAt ?? new Date(),
    updatedById: currentUser.id,
  });

  await logAuditAction({
    userId: currentUser.id,
    action: TAXONOMY_AUDIT_ACTIONS.TAXONOMY_PUBLISHED,
    entity: "Taxonomy",
    entityId: id,
    details: { name: existing.name, slug: existing.slug, kind: existing.kind },
  });

  return updated;
}

// ── Archive ───────────────────────────────────────────────────────────────────

export async function archiveTaxonomyService(id: string, currentUser: User) {
  requireTaxonomyManage(currentUser);

  const existing = await repo.findById(id);
  if (!existing) throw new Error("Taxonomy node not found.");

  // Warn: archiving a node with active products
  if (existing.productCount > 0) {
    // Allow but the caller should surface a warning
    console.warn(
      `[archiveTaxonomy] Archiving node ${id} with ${existing.productCount} assigned products.`
    );
  }

  const updated = await repo.updateTaxonomy(id, {
    status: "ARCHIVED",
    updatedById: currentUser.id,
  });

  await logAuditAction({
    userId: currentUser.id,
    action: TAXONOMY_AUDIT_ACTIONS.TAXONOMY_ARCHIVED,
    entity: "Taxonomy",
    entityId: id,
    details: { name: existing.name, slug: existing.slug, kind: existing.kind },
  });

  return updated;
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteTaxonomyService(id: string, currentUser: User) {
  requireTaxonomyManage(currentUser);

  const existing = await repo.findById(id);
  if (!existing) throw new Error("Taxonomy node not found.");

  // Guard: do not delete nodes with children
  if (existing.childCount > 0 || (existing.children && existing.children.length > 0)) {
    throw new Error(
      `Cannot delete "${existing.name}" — it has ${existing.childCount} child node(s). ` +
        "Move or delete children first."
    );
  }

  // Guard: do not delete nodes with active products
  if (existing.productCount > 0) {
    throw new Error(
      `Cannot delete "${existing.name}" — it has ${existing.productCount} product(s) assigned. ` +
        "Reassign or merge products first."
    );
  }

  await repo.deleteTaxonomy(id);

  // Refresh parent's childCount
  if (existing.parentId) {
    await repo.recalculateCounts(existing.parentId);
  }

  await logAuditAction({
    userId: currentUser.id,
    action: TAXONOMY_AUDIT_ACTIONS.TAXONOMY_DELETED,
    entity: "Taxonomy",
    entityId: id,
    details: { name: existing.name, slug: existing.slug, kind: existing.kind },
  });

  return { id };
}

// ── Move ──────────────────────────────────────────────────────────────────────

export async function moveTaxonomyService(
  id: string,
  newParentId: string | null,
  currentUser: User
) {
  requireTaxonomyManage(currentUser);

  const validated = MoveTaxonomySchema.parse({ id, newParentId });

  const existing = await repo.findById(validated.id);
  if (!existing) throw new Error("Taxonomy node not found.");

  // Circular reference check: newParentId must not be a descendant of id
  if (validated.newParentId) {
    const descendants = await repo.findDescendantIds(validated.id);
    if (descendants.includes(validated.newParentId)) {
      throw new Error(
        "Cannot move a node into one of its own descendants. This would create a circular reference."
      );
    }

    // Depth check
    const newAncestors = await repo.findAncestors(validated.newParentId);
    if (newAncestors.length + 1 >= TAXONOMY_LIMITS.MAX_DEPTH_HARD) {
      throw new Error(
        `Moving this node would exceed the maximum nesting depth of ${TAXONOMY_LIMITS.MAX_DEPTH_HARD}.`
      );
    }
  }

  const previousParentId = existing.parentId;
  await repo.moveTaxonomy(validated.id, validated.newParentId);

  // Refresh counts for both old and new parents
  if (previousParentId) await repo.recalculateCounts(previousParentId);
  if (validated.newParentId) await repo.recalculateCounts(validated.newParentId);

  await logAuditAction({
    userId: currentUser.id,
    action: TAXONOMY_AUDIT_ACTIONS.TAXONOMY_MOVED,
    entity: "Taxonomy",
    entityId: id,
    details: {
      name: existing.name,
      previousParentId,
      newParentId: validated.newParentId,
    },
  });

  return repo.findById(id);
}

// ── Merge ─────────────────────────────────────────────────────────────────────

export async function mergeTaxonomyService(
  sourceId: string,
  targetId: string,
  currentUser: User
) {
  requireTaxonomyManage(currentUser);

  const validated = MergeTaxonomySchema.parse({ sourceId, targetId });

  const [source, target] = await Promise.all([
    repo.findById(validated.sourceId),
    repo.findById(validated.targetId),
  ]);

  if (!source) throw new Error("Source taxonomy node not found.");
  if (!target) throw new Error("Target taxonomy node not found.");

  // Cannot merge across kinds unless user is SUPER_ADMIN
  if (source.kind !== target.kind && currentUser.role !== "SUPER_ADMIN") {
    throw new Error(
      `Cannot merge a "${source.kind}" into a "${target.kind}". Kinds must match.`
    );
  }

  // Circular reference: target must not be a descendant of source
  const descendants = await repo.findDescendantIds(validated.sourceId);
  if (descendants.includes(validated.targetId)) {
    throw new Error(
      "Target is a descendant of source. This merge would create a circular reference."
    );
  }

  const result = await repo.mergeTaxonomy(validated.sourceId, validated.targetId);

  // Refresh target counts
  await repo.recalculateCounts(validated.targetId);
  if (target.parentId) await repo.recalculateCounts(target.parentId);

  await logAuditAction({
    userId: currentUser.id,
    action: TAXONOMY_AUDIT_ACTIONS.TAXONOMY_MERGED,
    entity: "Taxonomy",
    entityId: validated.targetId,
    details: {
      sourceName: source.name,
      sourceSlug: source.slug,
      targetName: target.name,
      targetSlug: target.slug,
      productsTransferred: source.productCount,
      childrenTransferred: source.childCount,
    },
  });

  return result;
}

// ── Reorder ───────────────────────────────────────────────────────────────────

export async function reorderTaxonomyService(
  orderedIds: string[],
  parentId: string | null,
  currentUser: User
) {
  requireTaxonomyManage(currentUser);

  const validated = ReorderTaxonomySchema.parse({ orderedIds, parentId });

  await repo.reorderTaxonomies(validated.orderedIds, validated.parentId);

  await logAuditAction({
    userId: currentUser.id,
    action: TAXONOMY_AUDIT_ACTIONS.TAXONOMY_REORDERED,
    entity: "Taxonomy",
    entityId: parentId ?? "root",
    details: { orderedIds: validated.orderedIds, parentId: validated.parentId },
  });

  return { success: true };
}

// ── Count rebuild ─────────────────────────────────────────────────────────────

export async function recalculateCountsService(
  id: string | undefined,
  currentUser: User
) {
  requireTaxonomyManage(currentUser);

  let result: { rebuiltCount?: number; id?: string };

  if (id) {
    const node = await repo.recalculateCounts(id);
    result = { id: node.id };
  } else {
    result = await repo.recalculateAllCounts();
  }

  await logAuditAction({
    userId: currentUser.id,
    action: TAXONOMY_AUDIT_ACTIONS.TAXONOMY_COUNTS_REBUILT,
    entity: "Taxonomy",
    entityId: id ?? "all",
    details: { scope: id ? "single" : "all", ...result },
  });

  return result;
}

// ── Product assignment ────────────────────────────────────────────────────────

export async function assignProductService(
  productId: string,
  taxonomyId: string,
  primary: boolean,
  currentUser: User
) {
  if (!can(currentUser, "CATALOG_WRITE")) {
    throw new AuthorizationError(
      "You do not have permission to assign products to taxonomy."
    );
  }

  const validated = AssignProductSchema.parse({ productId, taxonomyId, primary });

  const taxNode = await repo.findById(validated.taxonomyId);
  if (!taxNode) throw new Error("Taxonomy node not found.");

  const link = await repo.assignProduct(
    validated.productId,
    validated.taxonomyId,
    validated.primary
  );

  // Refresh count
  await repo.recalculateCounts(validated.taxonomyId);

  await logAuditAction({
    userId: currentUser.id,
    action: TAXONOMY_AUDIT_ACTIONS.TAXONOMY_PRODUCT_ASSIGNED,
    entity: "ProductTaxonomy",
    entityId: link.id,
    details: {
      productId: validated.productId,
      taxonomyId: validated.taxonomyId,
      taxonomyName: taxNode.name,
      primary: validated.primary,
    },
  });

  return link;
}

export async function removeProductService(
  productId: string,
  taxonomyId: string,
  currentUser: User
) {
  if (!can(currentUser, "CATALOG_WRITE")) {
    throw new AuthorizationError(
      "You do not have permission to remove product taxonomy assignments."
    );
  }

  const validated = RemoveProductSchema.parse({ productId, taxonomyId });

  await repo.removeProduct(validated.productId, validated.taxonomyId);
  await repo.recalculateCounts(validated.taxonomyId);

  await logAuditAction({
    userId: currentUser.id,
    action: TAXONOMY_AUDIT_ACTIONS.TAXONOMY_PRODUCT_REMOVED,
    entity: "ProductTaxonomy",
    entityId: `${productId}:${taxonomyId}`,
    details: { productId, taxonomyId },
  });

  return { success: true };
}

export async function getProductTaxonomies(
  productId: string,
  currentUser: User
) {
  requireInventoryRead(currentUser);
  return repo.findProductTaxonomies(productId);
}

export async function getTaxonomyProducts(
  taxonomyId: string,
  pagination: { cursor?: string; limit?: number },
  currentUser: User
) {
  requireInventoryRead(currentUser);
  return repo.findTaxonomyProducts(taxonomyId, pagination);
}

// ── Bulk operations ───────────────────────────────────────────────────────────

export async function bulkPublishService(ids: string[], currentUser: User) {
  if (!can(currentUser, "CATALOG_APPROVE")) {
    throw new AuthorizationError("Only admins can bulk publish taxonomy nodes.");
  }

  const validated = BulkTaxonomySchema.parse({ ids });
  const results: string[] = [];

  for (const id of validated.ids) {
    try {
      const node = await repo.findById(id);
      if (!node || node.status === "ARCHIVED") continue;
      await repo.updateTaxonomy(id, {
        status: "PUBLISHED",
        slugLocked: true,
        publishedAt: node.publishedAt ?? new Date(),
        updatedById: currentUser.id,
      });
      results.push(id);
    } catch (err) {
      console.error(`[bulkPublishTaxonomy] Failed for ${id}:`, err);
    }
  }

  return { publishedCount: results.length, ids: results };
}

export async function bulkArchiveService(ids: string[], currentUser: User) {
  requireTaxonomyManage(currentUser);

  const validated = BulkTaxonomySchema.parse({ ids });
  const results: string[] = [];

  for (const id of validated.ids) {
    try {
      await repo.updateTaxonomy(id, {
        status: "ARCHIVED",
        updatedById: currentUser.id,
      });
      results.push(id);
    } catch (err) {
      console.error(`[bulkArchiveTaxonomy] Failed for ${id}:`, err);
    }
  }

  return { archivedCount: results.length, ids: results };
}

export async function bulkDeleteService(ids: string[], currentUser: User) {
  requireTaxonomyManage(currentUser);

  const validated = BulkTaxonomySchema.parse({ ids });
  const results: string[] = [];
  const errors: Array<{ id: string; reason: string }> = [];

  for (const id of validated.ids) {
    try {
      const node = await repo.findById(id);
      if (!node) continue;
      if (node.childCount > 0) {
        errors.push({ id, reason: "Has children" });
        continue;
      }
      if (node.productCount > 0) {
        errors.push({ id, reason: "Has assigned products" });
        continue;
      }
      await repo.deleteTaxonomy(id);
      if (node.parentId) await repo.recalculateCounts(node.parentId);
      results.push(id);
    } catch (err) {
      errors.push({ id, reason: String(err) });
    }
  }

  return { deletedCount: results.length, ids: results, errors };
}

export async function bulkMoveService(
  ids: string[],
  newParentId: string | null,
  currentUser: User
) {
  requireTaxonomyManage(currentUser);

  const validated = BulkMoveSchema.parse({ ids, newParentId });
  const results: string[] = [];

  for (const id of validated.ids) {
    try {
      // Basic circular ref check
      if (validated.newParentId) {
        const descendants = await repo.findDescendantIds(id);
        if (descendants.includes(validated.newParentId)) continue;
      }
      const node = await repo.findById(id);
      if (!node) continue;
      const prevParentId = node.parentId;
      await repo.moveTaxonomy(id, validated.newParentId);
      if (prevParentId) await repo.recalculateCounts(prevParentId);
      if (validated.newParentId) await repo.recalculateCounts(validated.newParentId);
      results.push(id);
    } catch (err) {
      console.error(`[bulkMoveTaxonomy] Failed for ${id}:`, err);
    }
  }

  return { movedCount: results.length, ids: results };
}

export async function bulkChangeVisibilityService(
  ids: string[],
  visibility: string,
  currentUser: User
) {
  requireTaxonomyManage(currentUser);

  const validated = BulkVisibilitySchema.parse({ ids, visibility });
  const results: string[] = [];

  for (const id of validated.ids) {
    try {
      await repo.updateTaxonomy(id, {
        visibility: validated.visibility,
        updatedById: currentUser.id,
      });
      results.push(id);
    } catch (err) {
      console.error(`[bulkChangeVisibility] Failed for ${id}:`, err);
    }
  }

  return { updatedCount: results.length, ids: results };
}

// ── Private helpers ───────────────────────────────────────────────────────────

function validateStatusTransition(current: string, next: string) {
  const validTransitions: Record<string, string[]> = {
    DRAFT:     ["PUBLISHED"],
    PUBLISHED: ["ARCHIVED"],
    ARCHIVED:  ["PUBLISHED"],
  };

  const allowed = validTransitions[current] ?? [];
  if (!allowed.includes(next)) {
    throw new Error(
      `Invalid status transition: ${current} → ${next}. ` +
        `Allowed transitions: ${allowed.join(", ") || "none"}.`
    );
  }
}
