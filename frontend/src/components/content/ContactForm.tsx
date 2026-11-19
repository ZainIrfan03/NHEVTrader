"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  return <form onSubmit={submit} className="rounded-3xl bg-white p-6 sm:p-8"><h2 className="text-xl font-black">Send us a message</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold">Name<input required className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" /></label><label className="grid gap-2 text-xs font-bold">Phone<input required type="tel" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" /></label><label className="grid gap-2 text-xs font-bold sm:col-span-2">Email<input required type="email" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" /></label><label className="grid gap-2 text-xs font-bold sm:col-span-2">How can we help?<textarea required rows={5} className="resize-none rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" /></label></div>{sent && <p role="status" className="mt-5 flex items-center gap-2 rounded-xl bg-[#f4f8ed] p-4 text-sm text-[#365631]"><CheckCircle2 size={18} /> Message form is ready; delivery will activate with the backend email service.</p>}<button className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-[#182019] px-6 py-3.5 text-sm font-black text-white hover:bg-[#466c42]">Send message <Send size={16} /></button></form>;
}
