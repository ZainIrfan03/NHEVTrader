import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getCatalogProducts } from "@/lib/catalog";
import { CatalogProvider } from "@/providers/CatalogProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/providers/CartProvider";
import { WishlistProvider } from "@/providers/WishlistProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "NH EV Trader | Electric mobility, made practical", template: "%s | NH EV Trader" },
  description: "Shop electric vehicles, home chargers and EV accessories from NH EV Trader.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const products = await getCatalogProducts();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <CatalogProvider products={products}>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Header />
                <main>{children}</main>
                <Footer />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
