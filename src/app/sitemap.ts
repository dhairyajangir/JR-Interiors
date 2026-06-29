import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL &&
    process.env.NEXT_PUBLIC_SITE_URL !== "http://localhost:3000"
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "https://jrinteriors.in";

  // Static pages
  const staticPages = [
    { url: siteUrl, changeFrequency: "weekly" as const, priority: 1.0 },
    {
      url: `${siteUrl}/furniture`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/collections`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/services`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: "never" as const,
      priority: 0.6,
    },
  ];

  // Fetch products dynamically using database directly
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, createdAt: true },
    });
    productPages = products.map((product) => ({
      url: `${siteUrl}/product/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      lastModified: product.createdAt,
    }));
  } catch (error) {
    console.error("Failed to fetch products for sitemap:", error);
  }

  return [...staticPages, ...productPages];
}
