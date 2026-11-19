export type HeroSlideContent = {
  id: string;
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  metaLabel: string;
  metaValue: string;
  objectPosition: string;
};

export type HomepageContent = {
  slides: HeroSlideContent[];
  featuredProductIds: string[];
  featuredHeading: string;
  featuredDescription?: string;
};

export type SiteSettingsContent = {
  storeName: string;
  supportPhone?: string;
  supportEmail?: string;
  whatsappNumber?: string;
  address?: string;
};

