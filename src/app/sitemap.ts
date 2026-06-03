import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/furniture", "/collections", "/about", "/services", "/contact", "/search"].map(
    (path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })
  );

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, createdAt: true } });
    productRoutes = products.map((p) => ({
      url: `${siteUrl}/product/${p.slug}`,
      lastModified: p.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB unavailable at build/runtime — return static routes only.
  }

  return [...staticRoutes, ...productRoutes];
}
