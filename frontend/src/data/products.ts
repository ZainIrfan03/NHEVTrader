import type { Product } from "@/types/commerce";

export const products: Product[] = [
  {
    id: "ev-01",
    slug: "nova-e5-crossover",
    name: "Nova E5 Crossover",
    category: "Vehicles",
    price: 8950000,
    badge: "New arrival",
    description: "A refined all-electric crossover configured for everyday city driving and comfortable motorway travel.",
    specs: [
      { label: "Range", value: "430 km" },
      { label: "Battery", value: "64 kWh" },
      { label: "0–100", value: "7.2 sec" },
    ],
    image: "/images/hero-ev.png",
    imagePosition: "72% center",
    gallery: [
      { src: "/images/hero-ev.png", alt: "Nova E5 crossover at an EV charging plaza", position: "72% center" },
      { src: "/images/hero-city-drive.png", alt: "Electric vehicle driving through Lahore at blue hour", position: "62% center" },
      { src: "/images/hero-home-charge.png", alt: "Electric SUV charging at a contemporary home", position: "64% center" },
    ],
    variants: [
      { id: "pearl-white", label: "Finish", value: "Pearl White", inStock: true },
      { id: "midnight-blue", label: "Finish", value: "Midnight Blue", priceDelta: 125000, inStock: true },
      { id: "graphite", label: "Finish", value: "Graphite", inStock: false },
    ],
    accent: "#dce7df",
    inStock: true,
  },
  {
    id: "ch-01",
    slug: "volt-home-7kw-charger",
    name: "Volt Home 7kW Charger",
    category: "Chargers",
    price: 245000,
    compareAtPrice: 275000,
    badge: "Popular",
    description: "A compact wall-mounted AC charger with scheduled charging and essential safety protection.",
    specs: [
      { label: "Output", value: "7 kW" },
      { label: "Cable", value: "5 m" },
      { label: "Protection", value: "IP65" },
    ],
    image: "/images/product-home-charger.png",
    imagePosition: "center",
    gallery: [
      { src: "/images/product-home-charger.png", alt: "Volt Home 7kW wall charger with Type 2 cable" },
      { src: "/images/hero-home-charge.png", alt: "Home EV charger connected to an electric SUV", position: "64% center" },
    ],
    variants: [
      { id: "5m-cable", label: "Cable", value: "5 metre", inStock: true },
      { id: "7m-cable", label: "Cable", value: "7 metre", priceDelta: 18000, inStock: true },
    ],
    accent: "#ece8dc",
    inStock: true,
  },
  {
    id: "ac-01",
    slug: "type-2-travel-cable",
    name: "Type 2 Travel Cable",
    category: "Accessories",
    price: 68500,
    badge: "Essential",
    description: "A durable Type 2 charging cable supplied with a protective carry case for daily use.",
    specs: [
      { label: "Length", value: "5 m" },
      { label: "Current", value: "32 A" },
      { label: "Phase", value: "Single" },
    ],
    image: "/images/product-type2-cable.png",
    imagePosition: "center",
    gallery: [
      { src: "/images/product-type2-cable.png", alt: "Type 2 charging cable with protective carry case" },
      { src: "/images/hero-home-charge.png", alt: "Type 2 cable in a home charging setup", position: "64% center" },
    ],
    variants: [
      { id: "5m-32a", label: "Length", value: "5 metre", inStock: true },
      { id: "7m-32a", label: "Length", value: "7 metre", priceDelta: 12000, inStock: true },
    ],
    accent: "#e6e2ef",
    inStock: true,
  },
  {
    id: "ac-02",
    slug: "ev-emergency-kit",
    name: "EV Emergency Kit",
    category: "Accessories",
    price: 24900,
    description: "A compact roadside essentials pack designed to live neatly in your vehicle boot.",
    specs: [
      { label: "Pieces", value: "12" },
      { label: "Case", value: "Hard shell" },
      { label: "Weight", value: "2.1 kg" },
    ],
    image: "/images/product-emergency-kit.png",
    imagePosition: "center",
    gallery: [
      { src: "/images/product-emergency-kit.png", alt: "Open EV emergency kit with organized roadside essentials" },
    ],
    variants: [
      { id: "standard-kit", label: "Kit", value: "Standard 12-piece", inStock: false },
    ],
    accent: "#e9ded9",
    inStock: false,
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 3) {
  const categoryPriority = [
    product.category,
    ...(product.category === "Vehicles"
      ? (["Chargers", "Accessories"] as const)
      : product.category === "Chargers"
        ? (["Accessories", "Vehicles"] as const)
        : (["Chargers", "Vehicles"] as const)),
  ];

  return products
    .filter((candidate) => candidate.id !== product.id)
    .sort(
      (first, second) =>
        categoryPriority.indexOf(first.category) -
        categoryPriority.indexOf(second.category),
    )
    .slice(0, limit);
}
