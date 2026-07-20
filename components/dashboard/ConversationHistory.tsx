"use client";

import { useCallback, useEffect, useState } from "react";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineClipboardDocumentList,
  HiOutlineExclamationTriangle,
  HiOutlineFlag,
  HiOutlineFolder,
  HiOutlineLink,
  HiOutlineQrCode,
  HiOutlineUser,
} from "react-icons/hi2";
import apiRequest from "../lib/apiReq";

interface SessionSummary {
  session_id: string;
  last_message: string;
  last_message_at: string;
  message_count: number;
}

interface GalleryItemRefOut {
  item_id: string;
  item_type: "folder" | "image";
  title: string | null;
  image_url: string | null;
  external_url: string | null;
}

interface LinkRefOut {
  platform: string;
  url: string;
  label: string | null;
}

interface LeadFormRefOut {
  id: string;
  name: string;
  requires_payment: boolean;
}

interface ChatHistoryItem {
  role: string; // "user" | "assistant"
  content: string;
  created_at: string;
  gallery_items_shown: GalleryItemRefOut[] | null;
  links_shown: LinkRefOut[] | null;
  lead_form: LeadFormRefOut | null;
  was_escalated: boolean;
}

interface LeadSummary {
  id: string;
  lead_form_id: string | null;
  data: Record<string, unknown>;
  status: string;
  payment_status: string | null;
  payment_proof_url: string | null;
  created_at: string;
}

const SESSIONS_PAGE_SIZE = 20;
const MESSAGES_PAGE_SIZE = 30;

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
      <HiOutlineExclamationTriangle size={18} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[#E5E5E0] py-10 text-center text-sm text-[#6B6F76]">
      <HiOutlineChatBubbleLeftRight size={22} />
      <span>{text}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Read-only "what happened" chips shown under a message bubble -- gallery
 * items, links, lead-form trigger, escalation flag. Static, no interactions.
 * ---------------------------------------------------------------------- */

function GalleryStrip({ items }: { items: GalleryItemRefOut[] | null }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item.item_id}
          className="flex items-center gap-1 rounded-full bg-black/[0.04] px-2 py-1 text-[10px] font-medium text-[#6B6F76]"
        >
          {item.item_type === "folder" ? <HiOutlineFolder size={11} /> : null}
          {item.title || (item.item_type === "folder" ? "Untitled folder" : "Image")}
        </span>
      ))}
    </div>
  );
}

function LinkStrip({ links }: { links: LinkRefOut[] | null }) {
  if (!links || links.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {links.map((link, idx) => (
        <span
          key={`${link.platform}-${idx}`}
          className="flex items-center gap-1 rounded-full bg-black/[0.04] px-2 py-1 text-[10px] font-medium text-[#6B6F76]"
        >
          <HiOutlineLink size={11} />
          {link.label || link.platform}
        </span>
      ))}
    </div>
  );
}

function LeadFormBadge({ leadForm }: { leadForm: LeadFormRefOut | null }) {
  if (!leadForm) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5">
      <span className="flex items-center gap-1 rounded-full bg-[#2B4EFF]/10 px-2 py-1 text-[10px] font-medium text-[#2B4EFF]">
        <HiOutlineClipboardDocumentList size={11} />
        Triggered: {leadForm.name}
      </span>
      {leadForm.requires_payment && (
        <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700">
          <HiOutlineQrCode size={11} /> Payment
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Leads summary -- separate from the message thread, since a submitted
 * lead is its own record (session_id-scoped), not attached to one message.
 * ---------------------------------------------------------------------- */

function paymentBadgeStyles(status: string | null) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    verified: "bg-emerald-50 text-emerald-700",
    rejected: "bg-rose-50 text-rose-700",
  };
  return status ? styles[status] ?? "bg-black/[0.04] text-[#6B6F76]" : "";
}

function LeadsSummary({ leads }: { leads: LeadSummary[] }) {
  if (leads.length === 0) return null;
  return (
    <div className="mb-4 flex flex-col gap-2 rounded-xl border border-[#E5E5E0] bg-[#FAFAF9] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6F76]">
        Leads submitted in this conversation
      </p>
      {leads.map((lead) => (
        <div key={lead.id} className="rounded-lg border border-[#E5E5E0] bg-white p-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-[#0B0F19]">{formatTime(lead.created_at)}</span>
            <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[10px] font-medium text-[#6B6F76]">
              {lead.status}
            </span>
            {lead.payment_status && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${paymentBadgeStyles(lead.payment_status)}`}>
                {lead.payment_status}
              </span>
            )}
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {Object.entries(lead.data).map(([k, v]) => (
              <div key={k} className="rounded bg-[#F4F4F1] px-2 py-1">
                <p className="text-[9px] text-[#6B6F76]">{k}</p>
                <p className="font-medium text-[#0B0F19]">{String(v)}</p>
              </div>
            ))}
          </div>
          {lead.payment_proof_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lead.payment_proof_url}
              alt="Payment proof"
              className="mt-2 h-20 w-20 rounded-lg border border-[#E5E5E0] object-cover"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ConversationHistory() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMoreSessions, setLoadingMoreSessions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatHistoryItem[]>([]);
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [messagesTotal, setMessagesTotal] = useState(0);
  const [messagesOffset, setMessagesOffset] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingEarlier, setLoadingEarlier] = useState(false);

  const loadSessions = useCallback(async (offset: number) => {
    setError(null);
    offset === 0 ? setLoadingSessions(true) : setLoadingMoreSessions(true);
    try {
      const data = (await apiRequest(
        `/chat/sessions?limit=${SESSIONS_PAGE_SIZE}&offset=${offset}`
      )) as { sessions: SessionSummary[]; total: number };
      setSessions((prev) => (offset === 0 ? data.sessions : [...prev, ...data.sessions]));
      setSessionsTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load conversations.");
    } finally {
      setLoadingSessions(false);
      setLoadingMoreSessions(false);
    }
  }, []);

  useEffect(() => {
    loadSessions(0);
  }, [loadSessions]);

  // Fetches the OLDEST page (offset from the start of the conversation) and
  // replaces the thread -- used both for the initial open and "load earlier".
  // `leads` comes back on every page but only needs to be applied once
  // (it's session-scoped, not page-scoped) -- harmless to just overwrite it
  // each time since it's identical every page.
  const fetchMessagesPage = useCallback(
    async (sessionId: string, offset: number, mode: "replace" | "prepend") => {
      mode === "replace" ? setLoadingMessages(true) : setLoadingEarlier(true);
      setError(null);
      try {
        const data = (await apiRequest(
          `/chat/sessions/${sessionId}/messages?limit=${MESSAGES_PAGE_SIZE}&offset=${offset}`
        )) as { messages: ChatHistoryItem[]; total: number; leads: LeadSummary[] };
        setMessages((prev) => (mode === "replace" ? data.messages : [...data.messages, ...prev]));
        setMessagesTotal(data.total);
        setMessagesOffset(offset);
        setLeads(data.leads ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't load that conversation.");
      } finally {
        setLoadingMessages(false);
        setLoadingEarlier(false);
      }
    },
    []
  );

  const openSession = useCallback(
    (sessionId: string) => {
      setSelectedSession(sessionId);
      setMessages([]);
      setMessagesTotal(0);
      setLeads([]);
      // Jump straight to the most recent page: total isn't known yet, so
      // fetch offset 0 first just to get `total`, then re-fetch the tail.
      (async () => {
        setLoadingMessages(true);
        setError(null);
        try {
          const first = (await apiRequest(
            `/chat/sessions/${sessionId}/messages?limit=1&offset=0`
          )) as { messages: ChatHistoryItem[]; total: number };
          const total = first.total;
          const lastPageOffset = Math.max(0, total - MESSAGES_PAGE_SIZE);
          await fetchMessagesPage(sessionId, lastPageOffset, "replace");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Couldn't load that conversation.");
          setLoadingMessages(false);
        }
      })();
    },
    [fetchMessagesPage]
  );

  const loadEarlierMessages = useCallback(() => {
    if (!selectedSession || messagesOffset <= 0) return;
    const newOffset = Math.max(0, messagesOffset - MESSAGES_PAGE_SIZE);
    fetchMessagesPage(selectedSession, newOffset, "prepend");
  }, [selectedSession, messagesOffset, fetchMessagesPage]);

  const hasMoreSessions = sessions.length < sessionsTotal;
  const hasEarlierMessages = messagesOffset > 0;

  return (
    <div className="flex flex-col gap-6">
      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        {/* Session list */}
        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-3">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#0B0F19]">
              Conversations
            </h2>
            <span className="text-xs text-[#6B6F76]">{sessionsTotal}</span>
          </div>

          {loadingSessions ? (
            <p className="py-6 text-center text-sm text-[#6B6F76]">Loading…</p>
          ) : sessions.length === 0 ? (
            <EmptyState text="No conversations yet." />
          ) : (
            <div className="flex max-h-[560px] flex-col gap-1 overflow-y-auto">
              {sessions.map((s) => {
                const active = s.session_id === selectedSession;
                return (
                  <button
                    key={s.session_id}
                    type="button"
                    onClick={() => openSession(s.session_id)}
                    className={`flex flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      active ? "bg-[#2B4EFF]/10" : "hover:bg-black/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <HiOutlineUser size={13} className="shrink-0 text-[#6B6F76]" />
                      <span className="truncate text-xs font-medium text-[#0B0F19]">
                        {s.session_id.slice(0, 8)}…
                      </span>
                    </div>
                    <p className="truncate text-xs text-[#6B6F76]">{s.last_message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#B9BAB6]">{formatTime(s.last_message_at)}</span>
                      <span className="text-[10px] text-[#B9BAB6]">{s.message_count} msgs</span>
                    </div>
                  </button>
                );
              })}

              {hasMoreSessions && (
                <button
                  type="button"
                  onClick={() => loadSessions(sessions.length)}
                  disabled={loadingMoreSessions}
                  className="mt-1 rounded-xl px-3 py-2 text-center text-xs font-medium text-[#2B4EFF] hover:bg-black/[0.03] disabled:opacity-50"
                >
                  {loadingMoreSessions ? "Loading…" : "Load more"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Message thread */}
        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-5">
          {!selectedSession ? (
            <EmptyState text="Select a conversation to view its messages." />
          ) : loadingMessages ? (
            <p className="py-10 text-center text-sm text-[#6B6F76]">Loading…</p>
          ) : messages.length === 0 ? (
            <EmptyState text="No messages in this conversation." />
          ) : (
            <div className="flex flex-col gap-3">
              <LeadsSummary leads={leads} />

              {hasEarlierMessages && (
                <button
                  type="button"
                  onClick={loadEarlierMessages}
                  disabled={loadingEarlier}
                  className="mx-auto rounded-full border border-[#E5E5E0] px-3 py-1.5 text-xs font-medium text-[#2B4EFF] hover:bg-black/[0.03] disabled:opacity-50"
                >
                  {loadingEarlier ? "Loading…" : "Load earlier messages"}
                </button>
              )}

              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      m.role === "user"
                        ? "rounded-br-sm bg-[#2B4EFF] text-white"
                        : "rounded-bl-sm bg-[#F4F4F1] text-[#0B0F19]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>

                    {m.role !== "user" && (
                      <>
                        <GalleryStrip items={m.gallery_items_shown} />
                        <LinkStrip links={m.links_shown} />
                        <LeadFormBadge leadForm={m.lead_form} />
                        {m.was_escalated && (
                          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-[#6B6F76]">
                            <HiOutlineFlag size={11} /> Escalated
                          </p>
                        )}
                      </>
                    )}

                    <p
                      className={`mt-1 text-[10px] ${
                        m.role === "user" ? "text-white/70" : "text-[#6B6F76]"
                      }`}
                    >
                      {formatTime(m.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}