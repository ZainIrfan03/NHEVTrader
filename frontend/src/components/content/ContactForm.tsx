"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Your message could not be submitted.");
      form.reset();
      setSent(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Your message could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  return <form onSubmit={submit} className="rounded-3xl bg-white p-6 sm:p-8"><h2 className="text-xl font-black">Send us a message</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold">Name<input name="name" required minLength={2} className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" /></label><label className="grid gap-2 text-xs font-bold">Phone<input name="phone" required minLength={7} type="tel" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" /></label><label className="grid gap-2 text-xs font-bold sm:col-span-2">Email<input name="email" required type="email" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" /></label><label className="grid gap-2 text-xs font-bold sm:col-span-2">How can we help?<textarea name="message" required minLength={10} maxLength={3000} rows={5} className="resize-none rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" /></label></div>{sent && <p role="status" className="mt-5 flex items-center gap-2 rounded-xl bg-[#f4f8ed] p-4 text-sm text-[#365631]"><CheckCircle2 size={18} /> Thank you. Your message has been received by our team.</p>}{error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}<button disabled={submitting} className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-[#182019] px-6 py-3.5 text-sm font-black text-white hover:bg-[#466c42] disabled:cursor-wait disabled:opacity-60">{submitting ? <LoaderCircle className="animate-spin" size={16} /> : <Send size={16} />}{submitting ? "Sending…" : "Send message"}</button></form>;
}
