"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FiArrowRight, FiLoader } from "react-icons/fi";
import { getOrCreateSessionId, loadHistory, saveHistory, sendChatMessage, submitLead, getPublicBusiness, type ThreadMessage, type PublicBusinessOut } from "../lib/chat";
import MessageBubble, { TypingIndicator } from "./MessageBubble";

export interface ChatThreadProps {
  /** Business's public slug, e.g. "joes-pizza" -- used to build the
   *  /chat/{slug}/message URL. Not the tenant's UUID. */
  slug: string;
  accentColor?: string;
  logoUrl?: string | null;
  businessName?: string;
  welcomeMessage?: string;
  /** Container styling hook -- widget shell passes a fixed height, full-page passes flex-1. */
  className?: string;
  /** Requests the parent shell switch to the Gallery panel, scoped to this
   *  folder id (or null for gallery root). Bubbled up from MessageBubble. */
  onOpenGallery: (folderId: string | null) => void;
}

function newId(): string {
  return crypto.randomUUID();
}

export default function ChatThread({
  slug,
  accentColor = "#2B4EFF",
  logoUrl,
  businessName,
  welcomeMessage = "Hi! Ask me anything about us.",
  className = "",
  onOpenGallery,
}: ChatThreadProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [publicBusiness, setPublicBusiness] = useState<PublicBusinessOut | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Session + history bootstrap -- client-side only.
  useEffect(() => {
    const sid = getOrCreateSessionId(slug);
    setSessionId(sid);
    setMessages(loadHistory(slug, sid));
  }, [slug]);

  // Branding fetch -- falls back silently to displayName/displayLogo
  // defaults below if this fails or 404s.
  useEffect(() => {
    let cancelled = false;
    getPublicBusiness(slug)
      .then((data) => {
        if (!cancelled) setPublicBusiness(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const displayName = businessName ?? publicBusiness?.business_name ?? "Chat";
  const displayLogo = logoUrl ?? publicBusiness?.logo ?? null;

  // Persist on every change, only once a real session exists (avoids
  // clobbering saved history with an empty array during bootstrap).
  useEffect(() => {
    if (!sessionId) return;
    saveHistory(slug, sessionId, messages);
  }, [slug, sessionId, messages]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending, scrollToBottom]);

  const doSend = useCallback(
    async (text: string) => {
      if (!sessionId || !text.trim() || sending) return;

      const userMsg: ThreadMessage = { id: newId(), role: "user", text: text.trim(), createdAt: new Date().toISOString() };
      setMessages((prev) => [...prev, userMsg]); // optimistic
      setInput("");
      setSending(true);

      try {
        const result = await sendChatMessage(slug, sessionId, text.trim());
        const assistantMsg: ThreadMessage = {
          id: newId(),
          role: "assistant",
          text: result.reply,
          galleryItems: result.gallery_items ?? [],
          links: result.links ?? [],
          leadForm: result.lead_form,
          leadFormState: result.lead_form ? "pending" : null,
          leadSubmission: null,
          escalated: result.escalated,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: "error", text: "Something went wrong, try again.", createdAt: new Date().toISOString() },
        ]);
      } finally {
        setSending(false);
        inputRef.current?.focus();
      }
    },
    [slug, sessionId, sending]
  );

  const handleLeadSubmit = useCallback(
    async (messageId: string, leadFormId: string | null, data: Record<string, unknown>) => {
      if (!sessionId) return;
      const result = await submitLead(slug, sessionId, leadFormId, data);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId && m.role === "assistant"
            ? {
                ...m,
                leadFormState: "submitted",
                leadSubmission: {
                  leadId: result.id,
                  paymentQrImage: result.payment_status === "pending" ? result.payment_qr_image : null,
                },
              }
            : m
        )
      );
    },
    [slug, sessionId]
  );

  return (
    <div
      className={`relative flex flex-col overflow-hidden bg-[#FAFAF9] ${className}`}
      style={{
        // Ambient wash derived entirely from the tenant's own accent color, so
        // every business gets a bespoke-feeling backdrop with zero image assets.
        backgroundImage: `
          radial-gradient(120% 90% at 8% -10%, ${accentColor}1f 0%, transparent 55%),
          radial-gradient(100% 80% at 100% 0%, ${accentColor}14 0%, transparent 50%)
        `,
      }}
    >
      {/* Header */}
  <div className="relative z-10 flex items-center gap-3 border-b border-black/[0.06] bg-white/80 px-4 py-3.5 backdrop-blur-xl">
        {displayLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayLogo}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover ring-1 ring-black/5 shadow-sm"
          />
        ) : (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)` }}
          >
            {displayName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col leading-tight">
          <p className="text-sm font-semibold text-[#0B0F19]">{displayName}</p>
          <span className="flex items-center gap-1 text-[11px] text-[#6B6F76]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>
      </div>

      {/* Message list */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-black/[0.06] bg-white px-3.5 py-2.5 text-sm text-[#0B0F19] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                {welcomeMessage}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                accentColor={accentColor}
                slug={slug}
                apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}
                businessName={displayName}
                onOpenGallery={onOpenGallery}
                onSubmitLead={(data) =>
                  m.role === "assistant" ? handleLeadSubmit(m.id, m.leadForm?.id ?? null, data) : Promise.resolve()
                }
              />
            ))}
          </AnimatePresence>

          {sending && <TypingIndicator accentColor={accentColor} />}
        </div>
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          doSend(input);
        }}
        className="relative z-10 flex items-center gap-2 border-t border-black/[0.06] bg-white/80 px-3 py-3 backdrop-blur-xl"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          disabled={sending || !sessionId}
          className="flex-1 rounded-full border border-black/[0.08] bg-[#F4F4F1] px-4 py-2.5 text-sm text-[#0B0F19] outline-none transition-colors focus:border-[var(--accent)] focus:bg-white disabled:opacity-60"
          style={{ ["--accent" as string]: accentColor }}
        />
        <button
          type="submit"
          disabled={sending || !input.trim() || !sessionId}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-all hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)` }}
          aria-label="Send message"
        >
          {sending ? <FiLoader className="animate-spin" size={16} /> : <FiArrowRight size={16} />}
        </button>
      </form>
    </div>
  );
}