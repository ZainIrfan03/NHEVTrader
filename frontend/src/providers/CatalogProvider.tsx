"use client";

import { createContext, useContext } from "react";
import type { Product } from "@/types/commerce";

const CatalogContext = createContext<Product[] | null>(null);

export function CatalogProvider({ children, products }: { children: React.ReactNode; products: Product[] }) {
  return <CatalogContext.Provider value={products}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog must be used within CatalogProvider");
  return context;
}

