"use client";

import Link from "next/link";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ProductSuggestion[];
};

type ProductSuggestion = {
  title: string;
  slug: string;
  price: number;
  inStock: boolean;
};

const quickQuestions = ["Show me EV chargers", "Do you offer COD?", "How does delivery work?"];

const initialMessage: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I’m the NH EV assistant. Ask me about products, prices, stock, delivery or payments.",
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 })
    .format(value)
    .replace("PKR", "Rs");

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setShowGreeting(true), 1000);
    const hideTimer = window.setTimeout(() => setShowGreeting(false), 7000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages, loading]);

  async function sendMessage(rawMessage: string) {
    const content = rawMessage.trim();
    if (!content || loading || content.length > 500) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-8).map(({ role, content: previousContent }) => ({
            role,
            content: previousContent,
          })),
        }),
      });
      const payload = (await response.json()) as {
        reply?: string;
        error?: string;
        products?: ProductSuggestion[];
      };
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: payload.reply || payload.error || "I couldn’t answer that just now. Please try again.",
          products: payload.products,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "The assistant is temporarily unavailable. Please use the Contact page for help.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function openChat() {
    setShowGreeting(false);
    setOpen(true);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] sm:bottom-6 sm:right-6">
      {open && (
        <section
          id="store-chat"
          aria-label="NH EV shopping assistant"
          className="mb-3 flex h-[min(620px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_24px_80px_rgba(24,32,25,.24)]"
        >
          <header className="flex items-center justify-between bg-[#182019] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#c9ef6d] text-[#182019]"><Bot size={21} /></span>
              <div><p className="text-sm font-black">NH EV Assistant</p><p className="mt-0.5 text-[11px] text-white/60">Catalog & store help</p></div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="focus-ring rounded-full p-2 hover:bg-white/10"><X size={20} /></button>
          </header>

          <div className="flex-1 overflow-y-auto bg-[#f5f3ed] px-4 py-5" aria-live="polite">
            <div className="grid gap-3">
              {messages.map((message) => (
                <div key={message.id} className={message.role === "user" ? "ml-9" : "mr-6"}>
                  <div className={`whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-[#182019] text-white" : "rounded-bl-md border border-black/5 bg-white text-black/70"}`}>
                    {message.content}
                  </div>
                  {message.products && message.products.length > 0 && (
                    <div className="mt-2 grid gap-2">
                      {message.products.map((product) => (
                        <Link key={product.slug} href={`/product/${product.slug}`} onClick={() => setOpen(false)} className="focus-ring flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-3 py-2.5 hover:border-[#466c42]">
                          <span className="min-w-0"><span className="block truncate text-xs font-black">{product.title}</span><span className={`mt-0.5 block text-[10px] font-bold ${product.inStock ? "text-[#466c42]" : "text-red-700"}`}>{product.inStock ? "In stock" : "Out of stock"}</span></span>
                          <span className="whitespace-nowrap text-xs font-black">{formatPrice(product.price)}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && <div className="mr-20 flex w-fit gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3" aria-label="Assistant is typing"><span className="h-2 w-2 animate-pulse rounded-full bg-black/30" /><span className="h-2 w-2 animate-pulse rounded-full bg-black/30 [animation-delay:120ms]" /><span className="h-2 w-2 animate-pulse rounded-full bg-black/30 [animation-delay:240ms]" /></div>}
              <div ref={endRef} />
            </div>
          </div>

          {messages.length === 1 && (
            <div className="flex gap-2 overflow-x-auto border-t border-black/5 bg-[#f5f3ed] px-4 pb-3">
              {quickQuestions.map((question) => <button key={question} type="button" onClick={() => void sendMessage(question)} className="focus-ring whitespace-nowrap rounded-full border border-black/10 bg-white px-3 py-2 text-[11px] font-bold hover:border-[#466c42]">{question}</button>)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-black/10 bg-white p-3">
            <label htmlFor="chat-message" className="sr-only">Ask the NH EV assistant</label>
            <input ref={inputRef} id="chat-message" value={input} onChange={(event) => setInput(event.target.value.slice(0, 500))} disabled={loading} autoComplete="off" placeholder="Ask a question…" className="min-w-0 flex-1 rounded-full border border-black/10 bg-[#f5f3ed] px-4 py-3 text-sm outline-none focus:border-[#466c42]" />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send message" className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#c9ef6d] text-[#182019] disabled:cursor-not-allowed disabled:opacity-40"><Send size={18} /></button>
          </form>
          <p className="border-t border-black/5 px-4 py-2 text-center text-[9px] text-black/40">Never share passwords, OTPs or card details.</p>
        </section>
      )}

      <div className="flex items-center justify-end gap-3">
        {!open && showGreeting && (
          <button
            type="button"
            onClick={openChat}
            className="chat-greeting focus-ring relative rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#182019] shadow-[0_12px_35px_rgba(24,32,25,.18)] hover:bg-[#c9ef6d]"
          >
            Hi! Can we chat?
            <span aria-hidden="true" className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-inherit" />
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setShowGreeting(false);
            setOpen((current) => !current);
          }}
          aria-expanded={open}
          aria-controls="store-chat"
          aria-label={open ? "Close shopping assistant" : "Open shopping assistant"}
          className="chat-launcher focus-ring relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#182019] text-white shadow-xl hover:bg-[#466c42] sm:h-16 sm:w-16"
        >
          {open ? <X size={24} /> : <MessageCircle size={25} />}
        </button>
      </div>
    </div>
  );
}
