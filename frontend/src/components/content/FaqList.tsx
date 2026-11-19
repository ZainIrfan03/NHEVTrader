"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type FaqItem = { question: string; answer: string };

export function FaqList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState(0);
  return <div className="border-t border-black/10">{items.map((item, index) => { const expanded = open === index; return <div key={item.question} className="border-b border-black/10"><button type="button" onClick={() => setOpen(expanded ? -1 : index)} aria-expanded={expanded} className="focus-ring flex w-full items-center justify-between gap-6 py-6 text-left font-bold"><span>{item.question}</span><ChevronDown size={18} className={`shrink-0 transition ${expanded ? "rotate-180" : ""}`} /></button>{expanded && <p className="max-w-3xl pb-6 text-sm leading-7 text-black/55">{item.answer}</p>}</div>; })}</div>;
}
