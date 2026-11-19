import type { MetadataRoute } from "next";
import { getCatalogProducts } from "@/lib/catalog";

const siteURL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getCatalogProducts();
  const staticRoutes = ["", "/shop", "/about", "/contact", "/faq", "/policies/privacy", "/policies/terms", "/policies/returns"];
  return [
    ...staticRoutes.map((path) => ({ url: `${siteURL}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 })),
    ...products.map((product) => ({ url: `${siteURL}/product/${product.slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 })),
  ];
}

