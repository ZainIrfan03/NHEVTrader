"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/types/commerce";

export function ProductGallery({ images, accent }: { images: ProductImage[]; accent: string }) {
  const [active, setActive] = useState(0);
  const image = images[active];

  return (
    <div>
      <div className="relative min-h-[440px] overflow-hidden rounded-3xl sm:min-h-[620px]" style={{ background: accent }}>
        <Image src={image.src} alt={image.alt} fill loading={active === 0 ? "eager" : "lazy"} sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover transition-opacity duration-300" style={{ objectPosition: image.position ?? "center" }} />
        {images.length > 1 && <span className="absolute right-4 top-4 rounded-full bg-black/45 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur">{active + 1} / {images.length}</span>}
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {images.map((item, index) => (
            <button type="button" key={item.src} onClick={() => setActive(index)} aria-label={`View image ${index + 1}`} aria-pressed={index === active} className={`focus-ring relative aspect-[4/3] overflow-hidden rounded-xl border-2 ${index === active ? "border-[#466c42]" : "border-transparent opacity-70 hover:opacity-100"}`}>
              <Image src={item.src} alt="" fill sizes="180px" className="object-cover" style={{ objectPosition: item.position ?? "center" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
