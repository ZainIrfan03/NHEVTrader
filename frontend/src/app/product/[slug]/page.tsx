import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { ProductPurchase } from "@/components/commerce/ProductPurchase";
import { RelatedProducts } from "@/components/commerce/RelatedProducts";
import { getProduct, getRelatedProducts, products } from "@/data/products";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const product = getProduct((await params).slug);
  if (!product) return notFound();

  const relatedProducts = getRelatedProducts(product);

  return (
    <div className="page-shell py-8 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs text-black/45">
        <Link href="/shop">Shop</Link>
        <ChevronRight size={13} />
        <span>{product.category}</span>
        <ChevronRight size={13} />
        <span className="text-black">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr]">
        <ProductGallery images={product.gallery} accent={product.accent} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#466c42]">{product.category}</p>
          <h1 className="display mt-3 text-5xl leading-none sm:text-6xl">{product.name}</h1>
          <p className="mt-6 text-base leading-7 text-black/60">{product.description}</p>

          <div className="my-8 grid grid-cols-3 divide-x divide-black/10 rounded-2xl bg-white p-4">
            {product.specs.map((spec) => (
              <div className="px-3 first:pl-0" key={spec.label}>
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-black/40">{spec.label}</p>
                <p className="mt-1 text-sm font-black">{spec.value}</p>
              </div>
            ))}
          </div>

          <ProductPurchase productId={product.id} price={product.price} compareAtPrice={product.compareAtPrice} inStock={product.inStock} variants={product.variants} />

          <div className="mt-8 grid gap-4 border-t border-black/10 pt-6 text-sm">
            <p className="flex items-center gap-3"><Truck size={19} className="text-[#466c42]" /> Nationwide tracked delivery</p>
            <p className="flex items-center gap-3"><ShieldCheck size={19} className="text-[#466c42]" /> Secure checkout and verified payments</p>
            <p className="flex items-center gap-3"><RotateCcw size={19} className="text-[#466c42]" /> Support for returns and exchanges</p>
          </div>
        </div>
      </div>

      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
