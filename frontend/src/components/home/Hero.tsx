"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Pause,
  Play,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { HeroSlideContent } from "@/types/content";

const AUTOPLAY_DELAY = 6500;

const defaultSlides: HeroSlideContent[] = [
  {
    id: "drive-ahead",
    image: "/images/hero-ev.png",
    alt: "White electric crossover at a modern charging plaza",
    eyebrow: "The drive ahead",
    title: "Move electric.",
    accent: "Live lighter.",
    description: "Carefully selected EVs, home charging and everyday essentials—backed by practical guidance from first click to first drive.",
    primary: { label: "Explore the range", href: "/shop" },
    secondary: { label: "Find a charger", href: "/shop?category=Chargers" },
    metaLabel: "Featured",
    metaValue: "Nova E5 · Up to 430 km",
    objectPosition: "64% center",
  },
  {
    id: "city-mile",
    image: "/images/hero-city-drive.png",
    alt: "Midnight-blue electric sedan driving through Lahore at dusk",
    eyebrow: "Made for every mile",
    title: "Own the city.",
    accent: "Quietly.",
    description: "Responsive performance, useful range and refined comfort—discover electric vehicles chosen for the rhythm of modern Pakistan.",
    primary: { label: "Shop electric vehicles", href: "/shop?category=Vehicles" },
    secondary: { label: "Explore all products", href: "/shop" },
    metaLabel: "Drive electric",
    metaValue: "Smooth power · Zero tailpipe emissions",
    objectPosition: "62% center",
  },
  {
    id: "home-charge",
    image: "/images/hero-home-charge.png",
    alt: "White electric SUV charging outside a contemporary home",
    eyebrow: "Power, where you park",
    title: "Charge at home.",
    accent: "Wake ready.",
    description: "Reliable home charging turns every night into a full start. We’ll help you choose a setup that fits your car and routine.",
    primary: { label: "Browse home chargers", href: "/shop?category=Chargers" },
    secondary: { label: "Talk to an advisor", href: "mailto:hello@nhevtrader.com" },
    metaLabel: "Everyday charging",
    metaValue: "Safe · Simple · Ready by morning",
    objectPosition: "64% center",
  },
];

const slideIcons = [Zap, Gauge, BatteryCharging];

export function Hero({ slides: contentSlides }: { slides?: HeroSlideContent[] }) {
  const slides = (contentSlides?.length ? contentSlides : defaultSlides).map((slide, index) => ({
    ...slide,
    icon: slideIcons[index % slideIcons.length],
  }));
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      AUTOPLAY_DELAY,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  const goTo = (index: number) => setActive((index + slides.length) % slides.length);
  const slide = slides[active];
  const SlideIcon = slide.icon;

  return (
    <section
      aria-label="Featured offers"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      className="relative isolate min-h-[690px] overflow-hidden bg-[#182019] text-white"
    >
      <div className="absolute inset-0">
        {slides.map((item, index) => (
          <Image
            key={item.image}
            src={item.image}
            alt={index === active ? item.alt : ""}
            fill
            loading={index === 0 ? "eager" : "lazy"}
            sizes="100vw"
            aria-hidden={index !== active}
            className={`object-cover transition-[opacity,transform] duration-1000 ease-out ${index === active ? "scale-100 opacity-100" : "scale-[1.025] opacity-0"}`}
            style={{ objectPosition: item.objectPosition }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,22,16,.96)_0%,rgba(13,22,16,.78)_34%,rgba(13,22,16,.20)_68%,rgba(13,22,16,.06)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/45 to-transparent" />

      <div className="page-shell relative flex min-h-[690px] items-end pb-32 pt-24 md:items-center md:pb-20">
        <div key={active} className="animate-rise max-w-2xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-3.5 py-2 text-[10px] font-black uppercase tracking-[.2em] backdrop-blur-md">
            <SlideIcon size={14} className="text-[#c9ef6d]" />
            {slide.eyebrow}
          </p>
          <h1 className="display text-[3.65rem] leading-[.9] sm:text-7xl lg:text-[96px]">
            {slide.title}<br /><em className="text-[#c9ef6d]">{slide.accent}</em>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/75 md:text-lg">{slide.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={slide.primary.href} className="focus-ring inline-flex items-center gap-3 rounded-full bg-[#c9ef6d] px-6 py-3.5 text-sm font-black text-[#182019] hover:bg-white">
              {slide.primary.label} <ArrowRight size={17} />
            </Link>
            <Link href={slide.secondary.href} className="focus-ring rounded-full border border-white/35 bg-black/10 px-6 py-3.5 text-sm font-bold backdrop-blur hover:bg-white hover:text-black">
              {slide.secondary.label}
            </Link>
          </div>
        </div>
      </div>

      <div className="page-shell pointer-events-none absolute inset-x-0 bottom-6 z-10 flex items-end justify-between gap-5">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-black/25 p-1.5 backdrop-blur-md">
          <button type="button" onClick={() => goTo(active - 1)} className="focus-ring grid h-10 w-10 place-items-center rounded-full text-white/80 hover:bg-white hover:text-black" aria-label="Previous slide">
            <ChevronLeft size={19} />
          </button>
          <div className="flex items-center gap-1.5 px-1" role="tablist" aria-label="Choose a slide">
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Show slide ${index + 1}: ${item.title}`}
                onClick={() => goTo(index)}
                className={`focus-ring h-2 rounded-full transition-all duration-300 ${index === active ? "w-8 bg-[#c9ef6d]" : "w-2 bg-white/45 hover:bg-white"}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => goTo(active + 1)} className="focus-ring grid h-10 w-10 place-items-center rounded-full text-white/80 hover:bg-white hover:text-black" aria-label="Next slide">
            <ChevronRight size={19} />
          </button>
          <button type="button" onClick={() => setPaused((value) => !value)} className="focus-ring mr-0.5 grid h-10 w-10 place-items-center rounded-full border-l border-white/10 text-white/70 hover:bg-white hover:text-black" aria-label={paused ? "Resume automatic slides" : "Pause automatic slides"}>
            {paused ? <Play size={15} fill="currentColor" /> : <Pause size={15} fill="currentColor" />}
          </button>
        </div>

        <div className="hidden rounded-2xl border border-white/15 bg-black/25 px-5 py-4 backdrop-blur-md md:block">
          <p className="text-[9px] font-black uppercase tracking-[.22em] text-[#c9ef6d]">{slide.metaLabel}</p>
          <p className="mt-1.5 text-sm font-bold">{slide.metaValue}</p>
        </div>
      </div>

      {!paused && (
        <div key={`progress-${active}`} className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
          <div className="hero-progress h-full bg-[#c9ef6d]" />
        </div>
      )}

      <span className="sr-only" aria-live="polite">Slide {active + 1} of {slides.length}: {slide.title} {slide.accent}</span>
    </section>
  );
}
