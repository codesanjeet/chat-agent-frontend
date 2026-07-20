"use client";



import { useCallback, useEffect, useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineFlag,
} from "react-icons/hi2";
import apiRequest from "../lib/apiReq";

/* -------------------------------------------------------------------------
 * Types (mirror app/schemas/chat.py::EscalatedQuestionOut field-for-field)
 * ---------------------------------------------------------------------- */

interface EscalatedQuestion {
  id: string;
  session_id: string;
  question: string;
  admin_answer: string | null;
  status: string; // "open" | "resolved" (or whatever your backend uses)
  created_at: string;
  answered_at: string | null;
}

async function apiJson(path: string, options: RequestInit = {}) {
  return apiRequest(path, options);
}

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

/* -------------------------------------------------------------------------
 * Small local primitives (kept inline so this stays a single file)
 * ---------------------------------------------------------------------- */

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
      <HiOutlineFlag size={22} />
      <span>{text}</span>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-2 rounded-xl bg-[#2B4EFF] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/* =========================================================================
 * Top-level view
 * ====================================================================== */

type StatusFilter = "open" | "resolved" | "all";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "resolved", label: "Resolved" },
  { id: "all", label: "All" },
];

export default function Escalations() {
  const [filter, setFilter] = useState<StatusFilter>("open");
  const [items, setItems] = useState<EscalatedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (statusFilter: StatusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const backendStatus = statusFilter === "open" ? "pending" : statusFilter;
const query = statusFilter === "all" ? "" : `?status_filter=${backendStatus}`;
      const data = (await apiJson(`/chat/escalations${query}`)) as EscalatedQuestion[];
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load escalations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  const handleResolve = async (id: string, answer: string) => {
    setError(null);
    try {
      const updated = (await apiJson(`/chat/escalations/${id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ admin_answer: answer }),
      })) as EscalatedQuestion;

      // If we're viewing "open" and this just got resolved, drop it from the
      // list rather than refetching -- keeps the queue feeling responsive.
      setItems((prev) =>
        filter === "open" ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? updated : i))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that answer.");
      throw err;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {error && <ErrorBanner message={error} />}

      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-[#E5E5E0] bg-white p-1.5">
        {FILTERS.map(({ id, label }) => {
          const active = filter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                active ? "bg-[#2B4EFF]/10 text-[#0B0F19]" : "text-[#6B6F76] hover:bg-black/[0.03] hover:text-[#0B0F19]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-[#E5E5E0] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-[#0B0F19]">
            Escalated questions
          </h2>
          <span className="text-xs text-[#6B6F76]">
            {items.length} {items.length === 1 ? "question" : "questions"}
          </span>
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-[#6B6F76]">Loading…</p>
        ) : items.length === 0 ? (
          <EmptyState
            text={
              filter === "open"
                ? "Nothing waiting on you. The agent hasn't flagged any unanswered questions."
                : "No escalations here."
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <EscalationRow key={item.id} item={item} onResolve={(answer) => handleResolve(item.id, answer)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EscalationRow({
  item,
  onResolve,
}: {
  item: EscalatedQuestion;
  onResolve: (answer: string) => Promise<void>;
}) {
  const isResolved = item.status === "resolved";
  const [answer, setAnswer] = useState(item.admin_answer ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async () => {
    if (!answer.trim()) {
      setLocalError("Write an answer first.");
      return;
    }
    setLocalError(null);
    setSubmitting(true);
    try {
      await onResolve(answer.trim());
    } catch {
      // parent's banner already shows the error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#E5E5E0] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#0B0F19]">{item.question}</p>
          <p className="mt-1 text-xs text-[#6B6F76]">
            {formatTime(item.created_at)} · session {item.session_id.slice(0, 8)}…
          </p>
        </div>
        {isResolved ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            <HiOutlineCheckCircle size={13} /> Resolved
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            <HiOutlineFlag size={13} /> Open
          </span>
        )}
      </div>

      {isResolved ? (
        <div className="mt-3 rounded-xl bg-black/[0.02] px-3 py-2.5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B6F76]">Your answer</p>
          <p className="mt-0.5 text-sm text-[#0B0F19]">{item.admin_answer}</p>
          {item.answered_at && (
            <p className="mt-1 text-[10px] text-[#B9BAB6]">Answered {formatTime(item.answered_at)}</p>
          )}
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
            placeholder="Type the answer the agent should have given…"
            className="resize-y rounded-xl border border-[#E5E5E0] bg-white px-3 py-2 text-sm text-[#0B0F19] outline-none focus:border-[#2B4EFF]"
          />
          {localError && <p className="text-xs text-rose-600">{localError}</p>}
          <div>
            <PrimaryButton onClick={submit} disabled={submitting}>
              {submitting ? "Saving…" : "Save answer"}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}