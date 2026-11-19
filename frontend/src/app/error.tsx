"use client";

import { RotateCcw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="page-shell grid min-h-[650px] place-items-center py-16 text-center"><div><p className="text-xs font-black uppercase tracking-[.22em] text-red-700">Something went wrong</p><h1 className="display mt-3 text-5xl">Let’s try that again.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/50">The page could not be loaded. Your cart and saved items are still stored on this device.</p><button type="button" onClick={reset} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#182019] px-6 py-3.5 text-sm font-black text-white"><RotateCcw size={16} /> Retry</button></div></div>; }
