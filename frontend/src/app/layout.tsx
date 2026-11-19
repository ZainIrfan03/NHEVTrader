import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getCatalogProducts } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/content";
import { CatalogProvider } from "@/providers/CatalogProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/providers/CartProvider";
import { WishlistProvider } from "@/providers/WishlistProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "NH EV Trader | Electric mobility, made practical", template: "%s | NH EV Trader" },
  description: "Shop electric vehicles, home chargers and EV accessories from NH EV Trader.",
  openGraph: {
    type: "website",
    title: "NH EV Trader | Electric mobility, made practical",
    description: "Shop electric vehicles, home chargers and EV accessories from NH EV Trader.",
    siteName: "NH EV Trader",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [products, siteSettings] = await Promise.all([getCatalogProducts(), getSiteSettings()]);

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <CatalogProvider products={products}>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Header />
                <main>{children}</main>
                <Footer settings={siteSettings} />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
