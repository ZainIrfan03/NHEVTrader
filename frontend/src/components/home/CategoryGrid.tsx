import Link from "next/link";
import { ArrowRight, BatteryCharging, Cable, CarFront } from "lucide-react";

const categories = [
  { title: "Electric vehicles", copy: "City-ready EVs selected for range, comfort and ownership confidence.", href: "/shop?category=Vehicles", icon: CarFront, tone: "bg-[#dce7df]" },
  { title: "Home charging", copy: "Reliable charging hardware for a simpler start to every journey.", href: "/shop?category=Chargers", icon: BatteryCharging, tone: "bg-[#ece8dc]" },
  { title: "EV essentials", copy: "Cables, safety equipment and thoughtful accessories for the road.", href: "/shop?category=Accessories", icon: Cable, tone: "bg-[#e6e2ef]" },
];

export function CategoryGrid() {
  return <div className="grid gap-4 md:grid-cols-3">{categories.map(({ title, copy, href, icon: Icon, tone }) => <Link key={title} href={href} className={`focus-ring group rounded-2xl p-6 ${tone} hover:-translate-y-1`}><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-full bg-white/70"><Icon size={23} /></span><ArrowRight className="transition group-hover:translate-x-1" size={20} /></div><h3 className="display mt-16 text-3xl">{title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-black/60">{copy}</p></Link>)}</div>;
}
