"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, signIn, register } = useAuth();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const result = mode === "signin"
      ? await signIn(email, password)
      : await register({
          name: String(form.get("name") || ""),
          phone: String(form.get("phone") || ""),
          email,
          password,
        });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error || "Authentication failed.");
      return;
    }
    router.push("/account/dashboard");
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
          <button type="button" onClick={() => { setMode("signin"); setError(null); }} className={`flex-1 rounded-full px-4 py-2.5 text-xs font-black ${mode === "signin" ? "bg-[#182019] text-white" : "text-black/45"}`}>Sign in</button>
          <button type="button" onClick={() => { setMode("register"); setError(null); }} className={`flex-1 rounded-full px-4 py-2.5 text-xs font-black ${mode === "register" ? "bg-[#182019] text-white" : "text-black/45"}`}>Create account</button>
        </div>
        <p className="mt-8 text-xs font-black uppercase tracking-[.22em] text-[#466c42]">{mode === "signin" ? "Welcome back" : "Join NH EV Trader"}</p>
        <h1 className="display mt-3 text-5xl">{mode === "signin" ? "Your account." : "Create your account."}</h1>
        <p className="mt-4 text-sm leading-6 text-black/50">{mode === "signin" ? "View orders, manage addresses and keep your EV essentials in one place." : "Save your details for faster checkout and track every order."}</p>
        <form onSubmit={submit} className="mt-8 grid gap-5">
          {mode === "register" && <label className="grid gap-2 text-xs font-bold">Full name<input name="name" required minLength={2} autoComplete="name" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="Your full name" /></label>}
          {mode === "register" && <label className="grid gap-2 text-xs font-bold">Phone number<input name="phone" required minLength={7} type="tel" autoComplete="tel" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="03XX XXXXXXX" /></label>}
          <label className="grid gap-2 text-xs font-bold">Email address<input name="email" required type="email" autoComplete="email" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="you@example.com" /></label>
          <label className="grid gap-2 text-xs font-bold">Password<input name="password" required minLength={8} type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="Minimum 8 characters" /></label>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
          <button disabled={submitting} className="focus-ring flex items-center justify-center gap-2 rounded-full bg-[#182019] px-5 py-3.5 text-sm font-black text-white hover:bg-[#466c42] disabled:cursor-wait disabled:opacity-60">{submitting && <LoaderCircle className="animate-spin" size={16} />}{submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
        </form>
        {mode === "register" && <p className="mt-6 text-center text-xs text-black/45">By continuing, you agree to our terms and privacy policy.</p>}
      </div>
    </div>
  );
}

