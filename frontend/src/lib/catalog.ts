import { cache } from "react";
import { products as developmentProducts } from "@/data/products";
import type { Product, ProductCategory, ProductImage } from "@/types/commerce";

type PayloadCategory = {
  name?: string | null;
};

type PayloadMedia = {
  alt?: string | null;
  cloudinaryURL?: string | null;
  url?: string | null;
};

type PayloadProduct = {
  id: string;
  title: string;
  slug: string;
  status: "active" | "archived";
  category: string | PayloadCategory;
  shortDescription: string;
  basePrice: number;
  compareAtPrice?: number | null;
  featured?: boolean | null;
  images?: Array<{
    image: string | PayloadMedia;
    alt?: string | null;
  }> | null;
  variants?: Array<{
    code: string;
    label: string;
    value: string;
    priceAdjustment?: number | null;
    stock: number;
    active?: boolean | null;
  }> | null;
  totalStock?: number | null;
  specifications?: Array<{
    label: string;
    value: string;
  }> | null;
};

type PayloadList<T> = {
  docs: T[];
};

const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const backendOrigin = new URL(apiURL).origin;

const categoryDefaults: Record<ProductCategory, { image: string; accent: string }> = {
  Vehicles: { image: "/images/hero-ev.png", accent: "#dce7df" },
  Chargers: { image: "/images/product-home-charger.png", accent: "#ece8dc" },
  Accessories: { image: "/images/product-type2-cable.png", accent: "#e6e2ef" },
};

function toCategory(category: PayloadProduct["category"]): ProductCategory {
  const name = typeof category === "string" ? category : category.name || "";
  const normalized = name.toLowerCase();
  if (normalized.includes("vehicle") || normalized.includes("car")) return "Vehicles";
  if (normalized.includes("charger") || normalized.includes("charging")) return "Chargers";
  return "Accessories";
}

function toMediaURL(media: string | PayloadMedia): string | null {
  if (typeof media === "string") return null;
  const source = media.cloudinaryURL || media.url;
  if (!source) return null;
  if (source.startsWith("http://") || source.startsWith("https://")) return source;
  return new URL(source, backendOrigin).toString();
}

function toProduct(document: PayloadProduct): Product {
  const category = toCategory(document.category);
  const defaults = categoryDefaults[category];
  const gallery = (document.images || []).flatMap<ProductImage>((entry) => {
    const src = toMediaURL(entry.image);
    if (!src) return [];
    const mediaAlt = typeof entry.image === "string" ? null : entry.image.alt;
    return [{ src, alt: entry.alt || mediaAlt || document.title }];
  });
  const images = gallery.length ? gallery : [{ src: defaults.image, alt: document.title }];
  const variants = (document.variants || [])
    .filter((variant) => variant.active !== false)
    .map((variant) => ({
      id: variant.code,
      label: variant.label,
      value: variant.value,
      priceDelta: variant.priceAdjustment || undefined,
      inStock: variant.stock > 0,
    }));

  return {
    id: document.id,
    slug: document.slug,
    name: document.title,
    category,
    price: document.basePrice,
    compareAtPrice: document.compareAtPrice || undefined,
    badge: document.featured ? "Featured" : undefined,
    description: document.shortDescription,
    specs: document.specifications || [],
    image: images[0].src,
    gallery: images,
    variants,
    accent: defaults.accent,
    inStock: (document.totalStock || 0) > 0 || variants.some((variant) => variant.inStock),
  };
}

async function requestProducts(): Promise<Product[]> {
  const query = new URLSearchParams({
    depth: "2",
    limit: "100",
    sort: "-featured,title",
    "where[status][equals]": "active",
  });
  const response = await fetch(`${apiURL}/products?${query}`, {
    next: { revalidate: 60 },
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Catalog API returned ${response.status}.`);
  const payload = (await response.json()) as PayloadList<PayloadProduct>;
  return payload.docs.map(toProduct);
}

export const getCatalogProducts = cache(async (): Promise<Product[]> => {
  try {
    const products = await requestProducts();
    if (products.length || process.env.NODE_ENV === "production") return products;
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
  }
  return developmentProducts;
});

export async function getCatalogProduct(slug: string): Promise<Product | undefined> {
  return (await getCatalogProducts()).find((product) => product.slug === slug);
}

export function getRelatedCatalogProducts(product: Product, catalog: Product[], limit = 3) {
  const categoryPriority = [
    product.category,
    ...(product.category === "Vehicles"
      ? (["Chargers", "Accessories"] as const)
      : product.category === "Chargers"
        ? (["Accessories", "Vehicles"] as const)
        : (["Chargers", "Vehicles"] as const)),
  ];

  return catalog
    .filter((candidate) => candidate.id !== product.id)
    .sort(
      (first, second) =>
        categoryPriority.indexOf(first.category) - categoryPriority.indexOf(second.category),
    )
    .slice(0, limit);
}

