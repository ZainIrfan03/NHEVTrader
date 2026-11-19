import { cache } from "react";
import type { HomepageContent, HeroSlideContent, SiteSettingsContent } from "@/types/content";

type PayloadMedia = {
  alt?: string | null;
  cloudinaryURL?: string | null;
  url?: string | null;
};

type PayloadBanner = {
  id: string;
  title: string;
  accentTitle?: string | null;
  eyebrow?: string | null;
  description?: string | null;
  image: string | PayloadMedia;
  buttonLabel?: string | null;
  buttonURL?: string | null;
  secondaryButtonLabel?: string | null;
  secondaryButtonURL?: string | null;
  metaLabel?: string | null;
  metaValue?: string | null;
  imagePosition?: string | null;
};

type PayloadHomepage = {
  heroBanners?: Array<string | PayloadBanner> | null;
  featuredProducts?: Array<string | { id: string }> | null;
  featuredHeading?: string | null;
  featuredDescription?: string | null;
};

const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const backendOrigin = new URL(apiURL).origin;

function mediaURL(image: string | PayloadMedia) {
  if (typeof image === "string") return null;
  const source = image.cloudinaryURL || image.url;
  if (!source) return null;
  if (source.startsWith("http://") || source.startsWith("https://")) return source;
  return new URL(source, backendOrigin).toString();
}

function toSlide(banner: PayloadBanner): HeroSlideContent | null {
  const image = mediaURL(banner.image);
  if (!image) return null;
  const alt = typeof banner.image === "string" ? banner.title : banner.image.alt || banner.title;
  return {
    id: banner.id,
    image,
    alt,
    eyebrow: banner.eyebrow || "NH EV Trader",
    title: banner.title,
    accent: banner.accentTitle || "",
    description: banner.description || "",
    primary: { label: banner.buttonLabel || "Explore the range", href: banner.buttonURL || "/shop" },
    secondary: { label: banner.secondaryButtonLabel || "Learn more", href: banner.secondaryButtonURL || "/about" },
    metaLabel: banner.metaLabel || "Featured",
    metaValue: banner.metaValue || "Electric mobility, made practical",
    objectPosition: banner.imagePosition || "center",
  };
}

export const getHomepageContent = cache(async (): Promise<HomepageContent | null> => {
  try {
    const response = await fetch(`${apiURL}/globals/homepage?depth=3`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const document = (await response.json()) as PayloadHomepage;
    const slides = (document.heroBanners || []).flatMap((banner) => {
      if (typeof banner === "string") return [];
      const slide = toSlide(banner);
      return slide ? [slide] : [];
    });
    const featuredProductIds = (document.featuredProducts || []).map((product) =>
      typeof product === "string" ? product : product.id,
    );
    return {
      slides,
      featuredProductIds,
      featuredHeading: document.featuredHeading || "Featured picks.",
      featuredDescription: document.featuredDescription || undefined,
    };
  } catch {
    return null;
  }
});

export const getSiteSettings = cache(async (): Promise<SiteSettingsContent | null> => {
  try {
    const response = await fetch(`${apiURL}/globals/site-settings`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const settings = (await response.json()) as SiteSettingsContent;
    return settings;
  } catch {
    return null;
  }
});


