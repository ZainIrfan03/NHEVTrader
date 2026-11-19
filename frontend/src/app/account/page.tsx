"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

type FieldName = "name" | "phone" | "email" | "password";
type FieldErrors = Partial<Record<FieldName, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pakistanMobilePattern = /^(?:\+92|92|0)?3\d{9}$/;

function getReturnPath() {
  if (typeof window === "undefined") return "/account/dashboard";
  const requested = new URLSearchParams(window.location.search).get("returnTo");
  return requested?.startsWith("/") && !requested.startsWith("//")
    ? requested
    : "/account/dashboard";
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, signIn, register } = useAuth();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const switchMode = (nextMode: "signin" | "register") => {
    setMode(nextMode);
    setError(null);
    setFieldErrors({});
  };

  const clearFieldError = (field: FieldName) => {
    setFieldErrors((current) => current[field] ? { ...current, [field]: undefined } : current);
    setError(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const normalizedPhone = phone.replace(/[\s()-]/g, "");
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const validationErrors: FieldErrors = {};

    if (mode === "register" && name.length < 2) validationErrors.name = "Enter your full name.";
    if (mode === "register" && !pakistanMobilePattern.test(normalizedPhone)) {
      validationErrors.phone = "Enter a valid Pakistani mobile number, e.g. 03001234567.";
    }
    if (!emailPattern.test(email)) validationErrors.email = "Enter a valid email address.";
    if (!password) validationErrors.password = "Enter your password.";
    else if (password.length < 8) validationErrors.password = "Password must contain at least 8 characters.";

    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    const result = mode === "signin"
      ? await signIn(email, password)
      : await register({ name, phone: normalizedPhone, email, password });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error || "Authentication failed.");
      return;
    }
    router.push(getReturnPath());
    router.refresh();
  };

  if (isLoading) {
    return <div className="page-shell grid min-h-[700px] place-items-center py-16"><LoaderCircle className="animate-spin text-[#466c42]" size={30} /></div>;
  }

  if (user) {
    return (
      <div className="page-shell grid min-h-[700px] place-items-center py-16 text-center">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#466c42]">Signed in</p>
          <h1 className="display mt-3 text-5xl">Welcome back, {user.name}.</h1>
          <p className="mt-4 text-sm text-black/50">Your account and order information are ready.</p>
          <Link href="/account/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#182019] px-6 py-3.5 text-sm font-black text-white">Open dashboard <ArrowRight size={16} /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell grid min-h-[700px] place-items-center py-16">
      <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-[0_20px_80px_rgba(24,32,25,.08)] sm:p-10">
        <div className="flex rounded-full bg-[#f5f3ed] p-1">
          <button type="button" onClick={() => switchMode("signin")} className={`flex-1 rounded-full px-4 py-2.5 text-xs font-black ${mode === "signin" ? "bg-[#182019] text-white" : "text-black/45"}`}>Sign in</button>
          <button type="button" onClick={() => switchMode("register")} className={`flex-1 rounded-full px-4 py-2.5 text-xs font-black ${mode === "register" ? "bg-[#182019] text-white" : "text-black/45"}`}>Create account</button>
        </div>
        <p className="mt-8 text-xs font-black uppercase tracking-[.22em] text-[#466c42]">{mode === "signin" ? "Welcome back" : "Join NH EV Trader"}</p>
        <h1 className="display mt-3 text-5xl">{mode === "signin" ? "Your account." : "Create your account."}</h1>
        <p className="mt-4 text-sm leading-6 text-black/50">{mode === "signin" ? "View orders, manage addresses and keep your EV essentials in one place." : "Save your details for faster checkout and track every order."}</p>
        <form onSubmit={submit} noValidate className="mt-8 grid gap-5">
          {mode === "register" && <label className="grid gap-2 text-xs font-bold">Full name<input name="name" autoComplete="name" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "name-error" : undefined} onChange={() => clearFieldError("name")} className={`rounded-xl border px-4 py-3 text-sm font-normal outline-none ${fieldErrors.name ? "border-red-500 focus:border-red-600" : "border-black/15 focus:border-[#466c42]"}`} placeholder="Your full name" />{fieldErrors.name && <span id="name-error" className="text-xs font-semibold text-red-700">{fieldErrors.name}</span>}</label>}
          {mode === "register" && <label className="grid gap-2 text-xs font-bold">Phone number<input name="phone" type="tel" autoComplete="tel" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "phone-error" : undefined} onChange={() => clearFieldError("phone")} className={`rounded-xl border px-4 py-3 text-sm font-normal outline-none ${fieldErrors.phone ? "border-red-500 focus:border-red-600" : "border-black/15 focus:border-[#466c42]"}`} placeholder="03XX XXXXXXX" />{fieldErrors.phone && <span id="phone-error" className="text-xs font-semibold text-red-700">{fieldErrors.phone}</span>}</label>}
          <label className="grid gap-2 text-xs font-bold">Email address<input name="email" type="email" inputMode="email" autoComplete="email" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "email-error" : undefined} onChange={() => clearFieldError("email")} className={`rounded-xl border px-4 py-3 text-sm font-normal outline-none ${fieldErrors.email ? "border-red-500 focus:border-red-600" : "border-black/15 focus:border-[#466c42]"}`} placeholder="you@example.com" />{fieldErrors.email && <span id="email-error" className="text-xs font-semibold text-red-700">{fieldErrors.email}</span>}</label>
          <label className="grid gap-2 text-xs font-bold">Password<input name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? "password-error" : undefined} onChange={() => clearFieldError("password")} className={`rounded-xl border px-4 py-3 text-sm font-normal outline-none ${fieldErrors.password ? "border-red-500 focus:border-red-600" : "border-black/15 focus:border-[#466c42]"}`} placeholder="Minimum 8 characters" />{fieldErrors.password && <span id="password-error" className="text-xs font-semibold text-red-700">{fieldErrors.password}</span>}</label>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
          <button disabled={submitting} className="focus-ring flex items-center justify-center gap-2 rounded-full bg-[#182019] px-5 py-3.5 text-sm font-black text-white hover:bg-[#466c42] disabled:cursor-wait disabled:opacity-60">{submitting && <LoaderCircle className="animate-spin" size={16} />}{submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
        </form>
        {mode === "register" && <p className="mt-6 text-center text-xs text-black/45">By continuing, you agree to our terms and privacy policy.</p>}
      </div>
    </div>
  );
}

