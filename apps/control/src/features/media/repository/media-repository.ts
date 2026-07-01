import { prisma } from "@jr/database";

export interface CreateMediaAssetInput {
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  hash?: string;
}

export async function findById(id: string) {
  return prisma.mediaAsset.findUnique({
    where: { id },
  });
}

export async function findByHash(hash: string) {
  return prisma.mediaAsset.findUnique({
    where: { hash },
  });
}

export async function createMediaAsset(data: CreateMediaAssetInput) {
  return prisma.mediaAsset.create({
    data: {
      url: data.url,
      filename: data.filename,
      mimeType: data.mimeType,
      sizeBytes: data.sizeBytes,
      width: data.width,
      height: data.height,
      hash: data.hash,
    },
  });
}

export async function deleteMediaAsset(id: string) {
  return prisma.mediaAsset.delete({
    where: { id },
  });
}

export async function findManyMediaAssets(filters: { search?: string; limit?: number }) {
  const where: any = {};
  
  if (filters.search) {
    where.OR = [
      { filename: { contains: filters.search, mode: "insensitive" } },
      { url: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.mediaAsset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: filters.limit ?? 50,
  });
}
