import * as productRepository from "../repository/product-repository";
import { logAuditAction, computeObjectDiff } from "../../../lib/audit";
import { CreateProductSchema, UpdateProductSchema, PublishSchema, RejectSchema } from "../validators/product";
import type { User } from "@jr/types";
import { can, AuthorizationError } from "@jr/auth";
import type { ProductFilters, ProductSortOptions } from "../types";
import { prisma } from "@jr/database";
import {
  emitProductCreated,
  emitProductPublished,
  emitProductChangesRequested,
  emitProductArchived,
} from "../events/product-events";

/**
 * Core Business Service Layer for Products.
 * Enforces business logic constraints, authorization rules, transaction boundaries, and domain events.
 */

export async function getProductById(id: string, currentUser: User) {
  const product = await productRepository.findById(id);
  if (!product) return null;

  // Seller restriction: can only view their own products unless published
  if (currentUser.role === "SELLER" && product.status !== "PUBLISHED") {
    if (product.sellerId !== currentUser.sellerId) {
      throw new AuthorizationError("Access denied. You can only view your own draft/pending review products.");
    }
  }

  return product;
}

export async function listProducts(
  filters: ProductFilters,
  pagination: { cursor?: string; limit?: number } & ProductSortOptions,
  currentUser: User
) {
  // Sellers can only list their own products
  const activeFilters = { ...filters };
  if (currentUser.role === "SELLER") {
    if (!currentUser.sellerId) {
      throw new AuthorizationError("Seller profile not found.");
    }
    activeFilters.sellerId = currentUser.sellerId;
  }

  return productRepository.findManyProducts(activeFilters, pagination);
}

export async function createProductService(input: unknown, currentUser: User) {
  // Require CATALOG_WRITE permission
  if (!can(currentUser, "CATALOG_WRITE")) {
    throw new AuthorizationError("You do not have permission to create catalog items.");
  }

  const validated = CreateProductSchema.parse(input);

  // If user is a seller, enforce sellerId relation
  let sellerId: string | undefined = undefined;
  if (currentUser.role === "SELLER") {
    if (!currentUser.sellerId) {
      throw new AuthorizationError("Seller profile not initialized.");
    }
    sellerId = currentUser.sellerId;
  }

  // Execute database operations inside a single Prisma Transaction
  const product = await prisma.$transaction(async (tx) => {
    // 1. Generate deterministic sequential reference ID (e.g., JR-PROD-000001)
    const lastProduct = await tx.product.findFirst({
      where: { referenceId: { startsWith: "JR-PROD-" } },
      orderBy: { referenceId: "desc" },
    });
    let nextNum = 1;
    if (lastProduct && lastProduct.referenceId) {
      const match = lastProduct.referenceId.match(/JR-PROD-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    const referenceId = `JR-PROD-${String(nextNum).padStart(6, "0")}`;

    // 2. Write product record
    const newProduct = await productRepository.createProduct(
      {
        name: validated.name,
        slug: validated.slug,
        tagline: validated.tagline,
        series: validated.series,
        description: validated.description,
        priceCents: validated.priceCents,
        material: validated.material,
        room: validated.room,
        type: validated.type,
        imageUrl: validated.imageUrl,
        images: validated.images,
        finishes: validated.finishes,
        upholstery: validated.upholstery,
        colorHexes: validated.colorHexes,
        stock: validated.stock,
        categoryId: validated.categoryId,
        sellerId,
        referenceId,
        mediaId: validated.mediaId,
        mediaIds: validated.mediaIds,
        seo: validated.seo,
      },
      tx
    );

    // 3. Log Audit Trail
    await logAuditAction(
      {
        userId: currentUser.id,
        action: "PRODUCT_CREATED",
        entity: "Product",
        entityId: newProduct.id,
        details: {
          before: null,
          after: {
            name: newProduct.name,
            slug: newProduct.slug,
            status: newProduct.status,
            priceCents: newProduct.priceCents,
            referenceId: newProduct.referenceId,
          },
          changedFields: ["name", "slug", "status", "priceCents", "referenceId"],
        },
      },
      tx
    );

    return newProduct;
  });

  // Emit Domain Event outside database transaction
  emitProductCreated({
    productId: product.id,
    slug: product.slug,
    name: product.name,
    sellerId: product.sellerId,
    priceCents: product.priceCents,
    actorId: currentUser.id,
    timestamp: new Date().toISOString(),
  });

  return product;
}

export async function updateProductService(id: string, input: unknown, currentUser: User) {
  let oldStatus = "DRAFT";
  let oldSlug = "";

  // 1. Wrap the entire update mutation in a transaction
  const updatedProduct = await prisma.$transaction(async (tx) => {
    const product = await productRepository.findById(id, tx);
    if (!product) {
      throw new Error("Product not found");
    }

    oldStatus = product.status;
    oldSlug = product.slug;

    // Enforce ownership / authorization
    if (!can(currentUser, "CATALOG_WRITE")) {
      throw new AuthorizationError("You do not have permission to update products.");
    }

    if (currentUser.role === "SELLER" && product.sellerId !== currentUser.sellerId) {
      throw new AuthorizationError("You can only edit products owned by your seller profile.");
    }

    const validated = UpdateProductSchema.parse(input);

    // Enforce SEO slug lock rule: cannot edit slug once published
    if (product.status === "PUBLISHED" && validated.slug && validated.slug !== product.slug) {
      throw new Error("Cannot edit product slug once published. URLs are locked for SEO stability.");
    }

    // Validation: If setting status directly
    if (validated.status && validated.status !== product.status) {
      // Sellers cannot transition status directly to review outcomes
      if (
        currentUser.role === "SELLER" &&
        (validated.status === "APPROVED" ||
          validated.status === "PUBLISHED" ||
          validated.status === "CHANGES_REQUESTED")
      ) {
        throw new AuthorizationError("Sellers cannot approve, publish, or request changes on products directly.");
      }

      // Admins only for publishing/approving/requesting changes
      if (
        (validated.status === "APPROVED" ||
          validated.status === "PUBLISHED" ||
          validated.status === "CHANGES_REQUESTED") &&
        !can(currentUser, "CATALOG_APPROVE")
      ) {
        throw new AuthorizationError(
          "You must have catalog approval permissions to publish, approve, or request changes on products."
        );
      }

      // Validate publish requirements
      if (validated.status === "PUBLISHED") {
        validatePublishCriteria({
          name: validated.name ?? product.name,
          priceCents: validated.priceCents ?? product.priceCents,
          status: validated.status ?? product.status,
          imageUrl: validated.imageUrl ?? product.imageUrl,
          categoryId: validated.categoryId ?? product.categoryId,
        });
      }
    }

    // Perform database update
    const updated = await productRepository.updateProduct(
      id,
      {
        name: validated.name,
        slug: validated.slug,
        tagline: validated.tagline,
        series: validated.series,
        description: validated.description,
        priceCents: validated.priceCents,
        material: validated.material,
        room: validated.room,
        type: validated.type,
        imageUrl: validated.imageUrl,
        images: validated.images,
        finishes: validated.finishes,
        upholstery: validated.upholstery,
        colorHexes: validated.colorHexes,
        stock: validated.stock,
        categoryId: validated.categoryId,
        status: validated.status,
        reviewNote: validated.reviewNote,
        featured: validated.featured,
        signature: validated.signature,
        mediaId: validated.mediaId,
        mediaIds: validated.mediaIds,
        seo: validated.seo,
      },
      tx
    );

    // Calculate diff and log rich audit
    const diff = computeObjectDiff(product, updated);
    if (diff) {
      await logAuditAction(
        {
          userId: currentUser.id,
          action: "PRODUCT_UPDATED",
          entity: "Product",
          entityId: id,
          details: {
            before: diff.before,
            after: diff.after,
            changedFields: diff.changedFields,
            reason: validated.reviewNote || null,
          },
        },
        tx
      );
    }

    return updated;
  });

  // 2. Emit Domain Events on State Transitions
  const eventPayload = {
    productId: updatedProduct.id,
    slug: updatedProduct.slug,
    name: updatedProduct.name,
    sellerId: updatedProduct.sellerId,
    priceCents: updatedProduct.priceCents,
    actorId: currentUser.id,
    timestamp: new Date().toISOString(),
  };

  if (updatedProduct.status !== oldStatus) {
    if (updatedProduct.status === "PUBLISHED") {
      emitProductPublished(eventPayload);
    } else if (updatedProduct.status === "CHANGES_REQUESTED") {
      emitProductChangesRequested({
        ...eventPayload,
        reason: updatedProduct.reviewNote || "No changes justification reason provided.",
      });
    } else if (updatedProduct.status === "ARCHIVED") {
      emitProductArchived(eventPayload);
    }
  }

  return updatedProduct;
}

export async function deleteProductService(id: string, currentUser: User) {
  return prisma.$transaction(async (tx) => {
    const product = await productRepository.findById(id, tx);
    if (!product) {
      throw new Error("Product not found");
    }

    // Enforce catalog write permission and ownership
    if (!can(currentUser, "CATALOG_WRITE")) {
      throw new AuthorizationError("You do not have permission to delete products.");
    }

    if (currentUser.role === "SELLER" && product.sellerId !== currentUser.sellerId) {
      throw new AuthorizationError("You can only delete products owned by your brand.");
    }

    if (currentUser.role === "SELLER" && product.status === "PUBLISHED") {
      throw new AuthorizationError("Sellers cannot delete published products.");
    }

    await productRepository.deleteProduct(id, tx);

    await logAuditAction(
      {
        userId: currentUser.id,
        action: "PRODUCT_DELETED",
        entity: "Product",
        entityId: id,
        details: {
          before: { name: product.name, slug: product.slug },
          after: null,
          changedFields: ["name", "slug"],
        },
      },
      tx
    );

    return { id };
  });
}

export async function publishProductService(id: string, currentUser: User) {
  // Only admins with CATALOG_APPROVE can publish
  if (!can(currentUser, "CATALOG_APPROVE")) {
    throw new AuthorizationError("Access denied. Admin approval required to publish products.");
  }

  let oldStatus = "";

  const updatedProduct = await prisma.$transaction(async (tx) => {
    const product = await productRepository.findById(id, tx);
    if (!product) {
      throw new Error("Product not found");
    }

    oldStatus = product.status;

    if (product.status === "ARCHIVED") {
      throw new Error("Cannot publish archived products. Restore or duplicate the product first.");
    }

    // Enforce complete business specifications before going live
    validatePublishCriteria(product);

    const updated = await productRepository.updateProduct(
      id,
      {
        status: "PUBLISHED",
        reviewNote: null, // clear rejection note
      },
      tx
    );

    await logAuditAction(
      {
        userId: currentUser.id,
        action: "PRODUCT_APPROVED",
        entity: "Product",
        entityId: id,
        details: {
          before: { status: product.status },
          after: { status: "PUBLISHED" },
          changedFields: ["status"],
        },
      },
      tx
    );

    return updated;
  });

  if (oldStatus !== "PUBLISHED") {
    emitProductPublished({
      productId: updatedProduct.id,
      slug: updatedProduct.slug,
      name: updatedProduct.name,
      sellerId: updatedProduct.sellerId,
      priceCents: updatedProduct.priceCents,
      actorId: currentUser.id,
      timestamp: new Date().toISOString(),
    });
  }

  return updatedProduct;
}

export async function rejectProductService(id: string, reviewNote: string, currentUser: User) {
  // Only admins with CATALOG_APPROVE can reject (request changes)
  if (!can(currentUser, "CATALOG_APPROVE")) {
    throw new AuthorizationError("Access denied. Admin permissions required to request changes.");
  }

  let oldStatus = "";

  const updatedProduct = await prisma.$transaction(async (tx) => {
    const product = await productRepository.findById(id, tx);
    if (!product) {
      throw new Error("Product not found");
    }

    oldStatus = product.status;

    const updated = await productRepository.updateProduct(
      id,
      {
        status: "CHANGES_REQUESTED",
        reviewNote,
      },
      tx
    );

    await logAuditAction(
      {
        userId: currentUser.id,
        action: "PRODUCT_REJECTED",
        entity: "Product",
        entityId: id,
        details: {
          before: { status: product.status, reviewNote: product.reviewNote },
          after: { status: "CHANGES_REQUESTED", reviewNote },
          changedFields: ["status", "reviewNote"],
          reason: reviewNote,
        },
      },
      tx
    );

    return updated;
  });

  if (oldStatus !== "CHANGES_REQUESTED") {
    emitProductChangesRequested({
      productId: updatedProduct.id,
      slug: updatedProduct.slug,
      name: updatedProduct.name,
      sellerId: updatedProduct.sellerId,
      priceCents: updatedProduct.priceCents,
      actorId: currentUser.id,
      timestamp: new Date().toISOString(),
      reason: reviewNote,
    });
  }

  return updatedProduct;
}

export async function archiveProductService(id: string, currentUser: User) {
  let oldStatus = "";

  const updatedProduct = await prisma.$transaction(async (tx) => {
    const product = await productRepository.findById(id, tx);
    if (!product) {
      throw new Error("Product not found");
    }

    oldStatus = product.status;

    if (!can(currentUser, "CATALOG_WRITE")) {
      throw new AuthorizationError("You do not have permission to archive products.");
    }

    if (currentUser.role === "SELLER") {
      throw new AuthorizationError("Sellers do not have permission to archive products.");
    }

    const updated = await productRepository.updateProduct(
      id,
      {
        status: "ARCHIVED",
      },
      tx
    );

    await logAuditAction(
      {
        userId: currentUser.id,
        action: "PRODUCT_ARCHIVED",
        entity: "Product",
        entityId: id,
        details: {
          before: { status: product.status },
          after: { status: "ARCHIVED" },
          changedFields: ["status"],
        },
      },
      tx
    );

    return updated;
  });

  if (oldStatus !== "ARCHIVED") {
    emitProductArchived({
      productId: updatedProduct.id,
      slug: updatedProduct.slug,
      name: updatedProduct.name,
      sellerId: updatedProduct.sellerId,
      priceCents: updatedProduct.priceCents,
      actorId: currentUser.id,
      timestamp: new Date().toISOString(),
    });
  }

  return updatedProduct;
}

export async function duplicateProductService(id: string, currentUser: User) {
  return prisma.$transaction(async (tx) => {
    const product = await productRepository.findById(id, tx);
    if (!product) {
      throw new Error("Product not found");
    }

    if (!can(currentUser, "CATALOG_WRITE")) {
      throw new AuthorizationError("You do not have permission to duplicate products.");
    }

    if (currentUser.role === "SELLER" && product.sellerId !== currentUser.sellerId) {
      throw new AuthorizationError("You can only duplicate products owned by your brand.");
    }

    // Create duplicate with randomized slug & reset status to DRAFT
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newSlug = `${product.slug}-copy-${randomSuffix}`;
    const newName = `${product.name} (Copy)`;

    // Generate reference ID inside transaction
    const lastProduct = await tx.product.findFirst({
      where: { referenceId: { startsWith: "JR-PROD-" } },
      orderBy: { referenceId: "desc" },
    });
    let nextNum = 1;
    if (lastProduct && lastProduct.referenceId) {
      const match = lastProduct.referenceId.match(/JR-PROD-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    const referenceId = `JR-PROD-${String(nextNum).padStart(6, "0")}`;

    const duplicateInput = {
      name: newName,
      slug: newSlug,
      tagline: product.tagline || undefined,
      series: product.series || undefined,
      description: product.description,
      priceCents: product.priceCents,
      material: product.material,
      room: product.room,
      type: product.type,
      imageUrl: product.imageUrl,
      images: product.images,
      finishes: product.finishes,
      upholstery: product.upholstery,
      colorHexes: product.colorHexes,
      stock: product.stock,
      categoryId: product.categoryId || undefined,
      sellerId: product.sellerId || undefined,
      referenceId,
      mediaId: product.mediaId || undefined,
      mediaIds: product.mediaIds || undefined,
      seo: product.seo || undefined,
    };

    const duplicate = await productRepository.createProduct(duplicateInput, tx);

    await logAuditAction(
      {
        userId: currentUser.id,
        action: "PRODUCT_DUPLICATED",
        entity: "Product",
        entityId: duplicate.id,
        details: {
          before: null,
          after: {
            sourceId: id,
            name: newName,
            slug: newSlug,
            referenceId,
          },
          changedFields: ["name", "slug", "referenceId"],
        },
      },
      tx
    );

    return duplicate;
  });
}

export async function bulkDeleteService(ids: string[], currentUser: User) {
  if (!can(currentUser, "CATALOG_WRITE")) {
    throw new AuthorizationError("You do not have permission to delete products.");
  }

  const results: string[] = [];

  for (const id of ids) {
    try {
      await deleteProductService(id, currentUser);
      results.push(id);
    } catch (err) {
      console.error(`[bulkDeleteService] Failed to delete ${id}:`, err);
    }
  }

  return { deletedCount: results.length, ids: results };
}

export async function bulkPublishService(ids: string[], currentUser: User) {
  if (!can(currentUser, "CATALOG_APPROVE")) {
    throw new AuthorizationError("Only administrators can bulk publish products.");
  }

  const results: string[] = [];

  for (const id of ids) {
    try {
      await publishProductService(id, currentUser);
      results.push(id);
    } catch (err) {
      console.error(`[bulkPublishService] Failed to publish ${id}:`, err);
    }
  }

  return { publishedCount: results.length, ids: results };
}

export async function bulkArchiveService(ids: string[], currentUser: User) {
  if (!can(currentUser, "CATALOG_WRITE")) {
    throw new AuthorizationError("You do not have permission to archive products.");
  }

  const results: string[] = [];

  for (const id of ids) {
    try {
      await archiveProductService(id, currentUser);
      results.push(id);
    } catch (err) {
      console.error(`[bulkArchiveService] Failed to archive ${id}:`, err);
    }
  }

  return { archivedCount: results.length, ids: results };
}

// ── Private Helper: Business Rules for Publishing ───────────────────────────

function validatePublishCriteria(product: {
  name: string;
  imageUrl?: string | null;
  categoryId?: string | null;
  priceCents: number;
  status: string;
}) {
  if (!product.imageUrl) {
    throw new Error(`Cannot publish product "${product.name}" without a valid thumbnail image URL.`);
  }

  if (!product.categoryId) {
    throw new Error(`Cannot publish product "${product.name}" without associating it with a category.`);
  }

  if (product.priceCents <= 0) {
    throw new Error(`Cannot publish product "${product.name}" with a zero or negative price.`);
  }
}
