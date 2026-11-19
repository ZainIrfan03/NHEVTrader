import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-sm" aria-label="NH EV Trader home">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c9ef6d] text-[11px] font-black tracking-tight text-[#182019]">NH</span>
      <span className="text-sm font-black uppercase leading-none tracking-[0.12em]">EV Trader</span>
    </Link>
  );
}
