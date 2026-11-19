import type { Metadata } from "next";
import { FaqList } from "@/components/content/FaqList";
import { PageIntro } from "@/components/content/PageIntro";

export const metadata: Metadata = { title: "Frequently asked questions" };
const faqs = [
  { question: "Do you deliver across Pakistan?", answer: "Yes. Delivery availability and charges depend on the product, destination and handling requirements. Final delivery options will be shown during checkout once courier integration is connected." },
  { question: "Can I pay cash on delivery?", answer: "Cash on delivery is planned for eligible products and service areas. Vehicles and high-value equipment may require a confirmed booking or bank payment." },
  { question: "How do I choose the right home charger?", answer: "Check your vehicle’s AC charging limit, parking access, electrical supply and preferred cable length. Our advisor can help you shortlist a compatible setup." },
  { question: "Are the vehicles officially branded listings?", answer: "Current products are representative frontend catalog content. Final manufacturer, warranty and specification details will be managed and verified through the CMS before launch." },
  { question: "Can I return an accessory?", answer: "Unused eligible accessories may be returned within the stated return window. Product condition, packaging and exclusions will be described in the final returns policy." },
  { question: "Does my cart stay saved?", answer: "Yes. The current frontend keeps your cart on the same device, even after refreshing or closing the browser." },
];
export default function FaqPage() { return <div className="page-shell py-16 sm:py-24"><PageIntro eyebrow="Helpful answers" title="Questions, answered." description="Straightforward guidance for shopping, charging, delivery and EV ownership." /><section className="mt-14"><FaqList items={faqs} /></section></div>; }
