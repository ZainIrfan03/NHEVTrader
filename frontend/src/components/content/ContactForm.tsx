"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";

type FieldName = "name" | "phone" | "email" | "message";
type FieldErrors = Partial<Record<FieldName, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pakistanMobilePattern = /^(?:\+92|92|0)?3\d{9}$/;

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearFieldError = (field: FieldName) => {
    setFieldErrors((current) => current[field] ? { ...current, [field]: undefined } : current);
    setError(null);
    setSent(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSent(false);

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const normalizedPhone = phone.replace(/[\s()-]/g, "");
    const email = String(data.get("email") || "").trim().toLowerCase();
    const message = String(data.get("message") || "").trim();
    const validationErrors: FieldErrors = {};

    if (name.length < 2) validationErrors.name = "Enter your full name.";
    if (!pakistanMobilePattern.test(normalizedPhone)) {
      validationErrors.phone = "Enter a valid Pakistani mobile number, e.g. 03001234567.";
    }
    if (!emailPattern.test(email)) validationErrors.email = "Enter a valid email address.";
    if (message.length < 10) validationErrors.message = "Please write at least 10 characters.";
    else if (message.length > 3000) validationErrors.message = "Message cannot exceed 3000 characters.";

    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: normalizedPhone, email, message }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Your message could not be submitted.");
      form.reset();
      setFieldErrors({});
      setSent(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Your message could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (field: FieldName) => `rounded-xl border px-4 py-3 text-sm font-normal outline-none ${
    fieldErrors[field] ? "border-red-500 focus:border-red-600" : "border-black/15 focus:border-[#466c42]"
  }`;

  return (
    <form onSubmit={submit} noValidate className="rounded-3xl bg-white p-6 sm:p-8">
      <h2 className="text-xl font-black">Send us a message</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-bold">
          Name
          <input name="name" autoComplete="name" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "contact-name-error" : undefined} onChange={() => clearFieldError("name")} className={fieldClass("name")} />
          {fieldErrors.name && <span id="contact-name-error" className="text-xs font-semibold text-red-700">{fieldErrors.name}</span>}
        </label>
        <label className="grid gap-2 text-xs font-bold">
          Phone
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "contact-phone-error" : undefined} onChange={() => clearFieldError("phone")} className={fieldClass("phone")} />
          {fieldErrors.phone && <span id="contact-phone-error" className="text-xs font-semibold text-red-700">{fieldErrors.phone}</span>}
        </label>
        <label className="grid gap-2 text-xs font-bold sm:col-span-2">
          Email
          <input name="email" type="email" inputMode="email" autoComplete="email" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "contact-email-error" : undefined} onChange={() => clearFieldError("email")} className={fieldClass("email")} />
          {fieldErrors.email && <span id="contact-email-error" className="text-xs font-semibold text-red-700">{fieldErrors.email}</span>}
        </label>
        <label className="grid gap-2 text-xs font-bold sm:col-span-2">
          How can we help?
          <textarea name="message" rows={5} aria-invalid={Boolean(fieldErrors.message)} aria-describedby={fieldErrors.message ? "contact-message-error" : undefined} onChange={() => clearFieldError("message")} className={`${fieldClass("message")} resize-none`} />
          {fieldErrors.message && <span id="contact-message-error" className="text-xs font-semibold text-red-700">{fieldErrors.message}</span>}
        </label>
      </div>
      {sent && <p role="status" className="mt-5 flex items-center gap-2 rounded-xl bg-[#f4f8ed] p-4 text-sm text-[#365631]"><CheckCircle2 size={18} /> Thank you. Your message has been received by our team.</p>}
      {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      <button disabled={submitting} className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-[#182019] px-6 py-3.5 text-sm font-black text-white hover:bg-[#466c42] disabled:cursor-wait disabled:opacity-60">
        {submitting ? <LoaderCircle className="animate-spin" size={16} /> : <Send size={16} />}
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
