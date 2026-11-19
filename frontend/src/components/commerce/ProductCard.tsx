import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/commerce";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative">
      <div className="absolute right-3 top-3 z-10"><WishlistButton productId={product.id} /></div>
      <Link href={`/product/${product.slug}`} className="focus-ring block rounded-2xl">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl" style={{ background: product.accent }}>
          <Image src={product.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" style={{ objectPosition: product.imagePosition }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          {product.badge && <span className="absolute left-3 top-3 rounded-full bg-[#f5f3ed] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.14em]">{product.badge}</span>}
          <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-[#c9ef6d] transition group-hover:-translate-y-1"><ArrowUpRight size={18} /></span>
        </div>
        <div className="flex items-start justify-between gap-4 pt-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-black/45">{product.category}</p><h3 className="mt-1 text-lg font-bold">{product.name}</h3></div>
          <div className="shrink-0 text-right"><p className="font-bold">{formatPrice(product.price)}</p>{product.compareAtPrice && <p className="text-xs text-black/40 line-through">{formatPrice(product.compareAtPrice)}</p>}</div>
        </div>
      </Link>
    </article>
  );
}
