import { prisma } from "@jr/database";
import { paginateWithCursor } from "../../../lib/pagination";
import type { ProductFilters, ProductSortOptions } from "../types";
import type { ProductStatus } from "../types";

export interface CreateProductInput {
  name: string;
  slug: string;
  tagline?: string;
  series?: string;
  description: string;
  priceCents: number;
  material: string;
  room: string;
  type: string;
  imageUrl: string;
  images?: string[];
  finishes?: any; // JSON structure for [{ name, hex }]
  upholstery?: string[];
  colorHexes?: string[];
  stock?: number;
  categoryId?: string;
  sellerId?: string;
  referenceId?: string;
  mediaId?: string;
  mediaIds?: string[];
  seo?: any;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  status?: ProductStatus;
  reviewNote?: string | null;
  featured?: boolean;
  signature?: boolean;
}

export async function findById(id: string, tx?: any) {
  const client = tx || prisma;
  return client.product.findUnique({
    where: { id },
    include: {
      taxonomyLinks: {
        where: { primary: true },
        include: {
          taxonomy: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      seller: {
        select: {
          id: true,
          brandName: true,
          slug: true,
        },
      },
    },
  });
}

export async function findBySlug(slug: string, tx?: any) {
  const client = tx || prisma;
  return client.product.findUnique({
    where: { slug },
    include: {
      taxonomyLinks: {
        where: { primary: true },
        include: {
          taxonomy: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      seller: {
        select: {
          id: true,
          brandName: true,
          slug: true,
        },
      },
    },
  });
}

export async function createProduct(data: CreateProductInput, tx?: any) {
  const client = tx || prisma;
  
  // 1. Create the product record
  const product = await client.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      tagline: data.tagline,
      series: data.series,
      description: data.description,
      priceCents: data.priceCents,
      material: data.material,
      room: data.room,
      type: data.type,
      imageUrl: data.imageUrl,
      images: data.images || [],
      finishes: data.finishes || [],
      upholstery: data.upholstery || [],
      colorHexes: data.colorHexes || [],
      stock: data.stock ?? 0,
      inStock: (data.stock ?? 0) > 0,
      status: "DRAFT", // Default to DRAFT state on creation
      categoryId: data.categoryId,
      sellerId: data.sellerId,
      referenceId: data.referenceId,
      mediaId: data.mediaId,
      mediaIds: data.mediaIds || [],
      seo: data.seo || {},
    },
  });

  // 2. If categoryId was passed, also create the ProductTaxonomy link as primary
  if (data.categoryId) {
    await client.productTaxonomy.create({
      data: {
        productId: product.id,
        taxonomyId: data.categoryId,
        primary: true,
      },
    });
  }

  return product;
}

export async function updateProduct(id: string, data: UpdateProductInput, tx?: any) {
  const client = tx || prisma;
  const updateData: Record<string, any> = { ...data };
  if (data.stock !== undefined) {
    updateData.inStock = data.stock > 0;
  }

  // Update primary taxonomy assignment if categoryId is updated
  if (data.categoryId) {
    // Delete existing primary taxonomy link first
    await client.productTaxonomy.deleteMany({
      where: {
        productId: id,
        primary: true,
      },
    });
    // Create new primary link
    await client.productTaxonomy.create({
      data: {
        productId: id,
        taxonomyId: data.categoryId,
        primary: true,
      },
    });
  }

  return client.product.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteProduct(id: string, tx?: any) {
  const client = tx || prisma;
  return client.product.delete({
    where: { id },
  });
}

export async function findManyProducts(
  filters: ProductFilters,
  pagination: {
    cursor?: string;
    limit?: number;
  } & ProductSortOptions,
  tx?: any
) {
  const client = tx || prisma;
  const where: Record<string, any> = {};

  if (filters.status) {
    where.status = filters.status;
  } else {
    // By default, exclude ARCHIVED products unless explicitly requested
    where.status = { not: "ARCHIVED" };
  }

  if (filters.categoryId) {
    // Search products assigned to this taxonomyId
    where.taxonomyLinks = {
      some: {
        taxonomyId: filters.categoryId,
      },
    };
  }

  if (filters.room) {
    where.room = filters.room;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.sellerId) {
    where.sellerId = filters.sellerId;
  }

  if (filters.inStock !== undefined) {
    where.inStock = filters.inStock;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.priceCents = {};
    if (filters.minPrice !== undefined) {
      where.priceCents.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.priceCents.lte = filters.maxPrice;
    }
  }

  if (filters.search) {
    const cleanSearch = filters.search.trim();
    where.OR = [
      { name: { contains: cleanSearch, mode: "insensitive" } },
      { material: { contains: cleanSearch, mode: "insensitive" } },
      { series: { contains: cleanSearch, mode: "insensitive" } },
      { slug: { contains: cleanSearch, mode: "insensitive" } },
      { tagline: { contains: cleanSearch, mode: "insensitive" } },
      { room: { contains: cleanSearch, mode: "insensitive" } },
      { type: { contains: cleanSearch, mode: "insensitive" } },
      { description: { contains: cleanSearch, mode: "insensitive" } },
      { status: { contains: cleanSearch, mode: "insensitive" } },
      { taxonomyLinks: { some: { taxonomy: { name: { contains: cleanSearch, mode: "insensitive" } } } } },
      { seller: { brandName: { contains: cleanSearch, mode: "insensitive" } } },
    ];
  }

  return paginateWithCursor<any>(client.product, {
    where,
    cursor: pagination.cursor,
    limit: pagination.limit,
    sortBy: pagination.field,
    sortOrder: pagination.order,
    include: {
      taxonomyLinks: {
        where: { primary: true },
        include: {
          taxonomy: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      seller: {
        select: {
          id: true,
          brandName: true,
          slug: true,
        },
      },
    },
  });
}
