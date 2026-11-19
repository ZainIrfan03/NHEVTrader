import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types/commerce";
import { ProductCard } from "./ProductCard";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section aria-labelledby="related-products-heading" className="mt-20 border-t border-black/10 pt-14 sm:mt-28 sm:pt-20">
      <div className="mb-9 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#466c42]">Complete your setup</p>
          <h2 id="related-products-heading" className="display mt-3 text-4xl sm:text-5xl">You may also like.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">Useful additions selected to complement your electric journey.</p>
        </div>
        <Link href="/shop" className="focus-ring hidden items-center gap-2 rounded-sm border-b border-black/25 pb-1 text-sm font-bold sm:flex">
          View all products <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
