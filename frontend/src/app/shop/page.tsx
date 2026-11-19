import type { Metadata } from "next";
import { ProductCard } from "@/components/commerce/ProductCard";
import { getCatalogProducts } from "@/lib/catalog";
import type { ProductCategory } from "@/types/commerce";

export const metadata: Metadata = { title: "Shop electric" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const products = await getCatalogProducts();
  const params = await searchParams;
  const category = params.category as ProductCategory | undefined;
  const query = params.q?.toLowerCase();
  const filtered = products.filter((product) => (!category || product.category === category) && (!query || product.name.toLowerCase().includes(query)));
  return (
    <div className="page-shell py-14 sm:py-20">
      <p className="text-xs font-black uppercase tracking-[.22em] text-[#466c42]">NH EV collection</p>
      <div className="mt-3 flex flex-col justify-between gap-6 border-b border-black/10 pb-8 md:flex-row md:items-end"><div><h1 className="display text-5xl sm:text-7xl">{category ?? "Shop electric"}</h1><p className="mt-4 max-w-xl text-sm leading-6 text-black/55">Explore vehicles, home charging and practical accessories selected for modern EV ownership.</p></div><form className="flex rounded-full border border-black/15 bg-white p-1"><label htmlFor="shop-search" className="sr-only">Search products</label><input id="shop-search" name="q" defaultValue={params.q} placeholder="Search the range" className="min-w-0 bg-transparent px-4 py-2 text-sm outline-none" /><button className="rounded-full bg-[#182019] px-5 py-2 text-sm font-bold text-white">Search</button></form></div>
      <div className="mt-8 flex flex-wrap gap-2">{["All", "Vehicles", "Chargers", "Accessories"].map((item) => <a key={item} href={item === "All" ? "/shop" : `/shop?category=${item}`} className={`rounded-full px-4 py-2 text-xs font-bold ${(!category && item === "All") || category === item ? "bg-[#182019] text-white" : "border border-black/15 hover:bg-white"}`}>{item}</a>)}</div>
      {filtered.length ? <div className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="py-24 text-center"><h2 className="display text-3xl">No products found.</h2><p className="mt-3 text-sm text-black/50">Try another search or browse the full collection.</p></div>}
    </div>
  );
}
