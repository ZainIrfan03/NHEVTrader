export type ProductCategory = "Vehicles" | "Chargers" | "Accessories";

export type ProductVariant = {
  id: string;
  label: string;
  value: string;
  priceDelta?: number;
  inStock: boolean;
};

export type ProductImage = {
  src: string;
  alt: string;
  position?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  badge?: string;
  description: string;
  specs: { label: string; value: string }[];
  image: string;
  imagePosition?: string;
  gallery: ProductImage[];
  variants: ProductVariant[];
  accent: string;
  inStock: boolean;
};

export type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
};
