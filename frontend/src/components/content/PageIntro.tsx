export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[.22em] text-[#466c42]">{eyebrow}</p>
      <h1 className="display mt-3 text-5xl leading-[.95] sm:text-7xl">{title}</h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-black/55 sm:text-lg">{description}</p>
    </header>
  );
}
