import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/checkout/confirmation"],
      crawlDelay: 1,
    },
    sitemap: "https://jrinteriors.in/sitemap.xml",
  };
}
