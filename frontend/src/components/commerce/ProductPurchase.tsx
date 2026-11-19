"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { ProductVariant } from "@/types/commerce";
import { AddToCartButton } from "./AddToCartButton";

type ProductPurchaseProps = {
  productId: string;
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  variants: ProductVariant[];
};

export function ProductPurchase({ productId, price, compareAtPrice, inStock, variants }: ProductPurchaseProps) {
  const initial = variants.find((variant) => variant.inStock) ?? variants[0];
  const [selectedId, setSelectedId] = useState(initial?.id);
  const selected = variants.find((variant) => variant.id === selectedId);
  const finalPrice = price + (selected?.priceDelta ?? 0);
  const available = inStock && (selected?.inStock ?? true);

  return (
    <div>
      <div className="mt-6 flex items-baseline gap-3">
        <p className="text-2xl font-black">{formatPrice(finalPrice)}</p>
        {compareAtPrice && finalPrice < compareAtPrice && <p className="text-sm text-black/35 line-through">{formatPrice(compareAtPrice)}</p>}
      </div>

      {variants.length > 0 && (
        <fieldset className="my-7">
          <legend className="text-xs font-black uppercase tracking-[.16em] text-black/45">Choose {variants[0].label}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button key={variant.id} type="button" onClick={() => setSelectedId(variant.id)} disabled={!variant.inStock} aria-pressed={variant.id === selectedId} className={`focus-ring rounded-full border px-4 py-2.5 text-xs font-bold ${variant.id === selectedId ? "border-[#182019] bg-[#182019] text-white" : "border-black/15 bg-white hover:border-black/40"} disabled:cursor-not-allowed disabled:opacity-35`}>
                {variant.value}{variant.priceDelta ? ` (+${formatPrice(variant.priceDelta)})` : ""}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <AddToCartButton productId={productId} variantId={selected?.id} disabled={!available} />
      <p className="mt-3 text-center text-xs text-black/45">{available ? "In stock · Taxes included · Delivery calculated at checkout" : "This option is currently unavailable"}</p>
    </div>
  );
}
