"use client";


import { authStore } from "../lib/authStore";
import { refreshAccessToken } from "../lib/authServices";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineArrowUpTray,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineGlobeAlt,
  HiOutlineLink,
  HiOutlinePencil,
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineXMark,
} from "react-icons/hi2";
import Link from "next/link";
import apiRequest from "../lib/apiReq";
import GalleryTrainer from "./GalleryTrainer";
import { useUser } from "../lib/UserContext";
/* -------------------------------------------------------------------------
 * Shared types (mirror the FastAPI schemas exactly, field-for-field)
 * ---------------------------------------------------------------------- */

type SourceType = "text" | "image" | "pdf" | "weblink";

interface DocumentItem {
  id: string;
  source_type: SourceType;
  source_label: string | null;
  extracted_text: string;
  confidence: "high" | "medium" | "low" | string;
  reason: string;
  is_active: boolean;
  total_tokens: number;
  created_at: string;
}

interface FactConflict {
  key: string;
  proposed_value: string;
  existing_value: string;
}

interface ConfirmDocumentResult {
  document: DocumentItem;
  facts_saved: string[];
  conflicts: FactConflict[];
  chunks_embedded: number;
  chunks_skipped_as_duplicate: number;
  tokens_used: number;
  tokens_remaining: number;
}

interface BusinessFact {
  key: string;
  value: string;
  // Ties the fact back to the document it was extracted from. The FK on the
  // backend is ON DELETE SET NULL, so this becomes null if that document is
  // later deleted (as opposed to facts that never had a source document).
  source_document_id: string | null;
  // Human label of the source document, when the API provides it. Not
  // guaranteed to be present even when source_document_id is set, so we
  // fall back gracefully when it's missing.
  source_label?: string | null;
}

interface BusinessLink {
  platform: string;
  url: string;
  label: string | null;
}

/* -------------------------------------------------------------------------
 * API helpers -- exported for GalleryTrainer.tsx (and any other sibling
 * section) to reuse instead of re-implementing auth/refresh handling.
 * ---------------------------------------------------------------------- */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function unwrap(res: Response) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.detail ?? message;
    } catch {
      // response wasn't JSON -- keep the generic message
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Plain JSON calls just go through the shared apiRequest helper --
// it already attaches the bearer token, retries once on a 401 after
// refreshing the token, and redirects to /login if the refresh fails.
async function apiJson(path: string, options: RequestInit = {}) {
  return apiRequest(path, options);
}

// File uploads can't go through apiRequest because it always forces
// "Content-Type": "application/json", which breaks a multipart/FormData
// body. So this keeps its own fetch, but mirrors apiRequest's refresh-on-401
// behavior so an upload during an expired-but-refreshable session doesn't
// get logged out.
//
// extraFields lets callers attach non-file form fields alongside the file
// itself -- e.g. gallery's POST /gallery/images takes file + description +
// parent_id + external_url all in the same multipart body.
let uploadRefreshPromise: ReturnType<typeof refreshAccessToken> | null = null;

async function apiUpload(path: string, file: File, extraFields: Record<string, string> = {}) {
  const form = new FormData();
  form.append("file", file);
  Object.entries(extraFields).forEach(([key, value]) => form.append(key, value));

  const makeRequest = async (token?: string) =>
    fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    });

  let response = await makeRequest(authStore.getToken() ?? undefined);

  if (response.status === 401) {
    try {
      if (!uploadRefreshPromise) {
        uploadRefreshPromise = refreshAccessToken().finally(() => {
          uploadRefreshPromise = null;
        });
      }
      await uploadRefreshPromise;
      response = await makeRequest(authStore.getToken() ?? undefined);
    } catch {
      authStore.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please login again.");
    }
  }

  return unwrap(response);
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export { apiJson, apiUpload, formatDate };

// Fired whenever a document is confirmed or deleted -- i.e. whenever the
// count of confirmed/embedded documents could have changed. The dashboard
// layout's header button listens for this to refresh its glow state without
// needing a shared store or a full page navigation.
export const DOCUMENTS_UPDATED_EVENT = "documents-updated";

function notifyDocumentsUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DOCUMENTS_UPDATED_EVENT));
  }
}

/* -------------------------------------------------------------------------
 * Small shared UI primitives -- exported for GalleryTrainer.tsx to reuse so
 * the two sections stay visually identical without copy-pasting styles.
 * ---------------------------------------------------------------------- */

export function ConfidenceBadge({ confidence }: { confidence: string }) {
  const styles: Record<string, string> = {
    high: "bg-emerald-50 text-emerald-700",
    medium: "bg-amber-50 text-amber-700",
    low: "bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        styles[confidence] ?? "bg-black/5 text-[#6B6F76]"
      }`}
    >
      {confidence} confidence
    </span>
  );
}

export function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#E5E5E0] bg-white p-5">
      {children}
    </div>
  );
}

export function PrimaryButton({
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

export function GhostButton({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "border-rose-200 text-rose-600 hover:bg-rose-50"
          : "border-[#E5E5E0] text-[#6B6F76] hover:bg-black/[0.03] hover:text-[#0B0F19]"
      }`}
    >
      {children}
    </button>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-[#0B0F19]">
        {label}
        {optional && <span className="ml-1 font-normal text-[#6B6F76]">(optional)</span>}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl border border-[#E5E5E0] bg-white px-3 py-2 text-sm text-[#0B0F19] outline-none focus:border-[#2B4EFF]"
      />
    </label>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
      <HiOutlineExclamationTriangle size={18} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, text }: { icon: typeof HiOutlineDocumentText; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[#E5E5E0] py-10 text-center text-sm text-[#6B6F76]">
      <Icon size={22} />
      <span>{text}</span>
    </div>
  );
}

// Glows only when the very first chunk has just been added (chunkCount === 1)
// to nudge a first-time test. Once there's more than one chunk we assume the
// user has already tried it at least once, so it drops back to a plain
// button instead of competing for attention while they keep adding sources.
export function TestChatbotButton({ slug, chunkCount }: { slug?: string | null; chunkCount: number }) {
  if (!slug || chunkCount === 0) return null;

  const shouldGlow = chunkCount === 1;

  return (
    <Link
      href={`/chat/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
        shouldGlow
          ? "animate-pulse bg-[#2B4EFF] text-white shadow-lg shadow-[#2B4EFF]/40 ring-4 ring-[#2B4EFF]/30 hover:opacity-90"
          : "border border-[#E5E5E0] bg-white text-[#0B0F19] hover:bg-black/[0.03]"
      }`}
    >
      <HiOutlineSparkles size={16} className={shouldGlow ? "text-white" : "text-[#2B4EFF]"} />
      Test your live chatbot
    </Link>
  );
}

/* =========================================================================
 * Top-level view
 * ====================================================================== */

type TrainerTab = "knowledge" | "gallery" | "links";

const Trainer_TABS: { id: TrainerTab; label: string; icon: typeof HiOutlineDocumentText }[] = [
  { id: "knowledge", label: "Knowledge base", icon: HiOutlineSparkles },
  { id: "gallery", label: "Gallery", icon: HiOutlinePhoto },
  { id: "links", label: "Business links", icon: HiOutlineLink },
];

export default function TrainerView() {
  const [tab, setTab] = useState<TrainerTab>("knowledge");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-[#E5E5E0] bg-white p-1.5 ">
        {Trainer_TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#2B4EFF]/10 text-[#0B0F19]"
                  : "text-[#6B6F76] hover:bg-black/[0.03] hover:text-[#0B0F19]"
              }`}
            >
              <Icon size={17} className={active ? "text-[#2B4EFF]" : ""} />
              {label}
            </button>
          );
        })}
      </div>

      {tab === "knowledge" && <KnowledgeBaseSection />}
      {tab === "gallery" && <GalleryTrainer />}
      {tab === "links" && <LinksSection />}
    </div>
  );
}

/* =========================================================================
 * Knowledge base -- documents + facts
 * ====================================================================== */

const ADD_TABS: { id: SourceType; label: string; icon: typeof HiOutlineDocumentText }[] = [
  { id: "text", label: "Text", icon: HiOutlineDocumentText },
  { id: "image", label: "Image", icon: HiOutlinePhoto },
  { id: "pdf", label: "PDF", icon: HiOutlineArrowUpTray },
  { id: "weblink", label: "Web link", icon: HiOutlineGlobeAlt },
];

// Sentinel key used to bucket facts whose source_document_id is null --
// either because they were saved without ever being tied to a document, or
// because their document was later deleted (FK is ON DELETE SET NULL).
const UNLINKED_GROUP_KEY = "__unlinked__";

function KnowledgeBaseSection() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [facts, setFacts] = useState<BusinessFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {refresh} = useUser();

  // conflict resolution modal, opened after a confirm() call returns conflicts
  const [conflictState, setConflictState] = useState<{
    documentId: string;
    conflicts: FactConflict[];
    choices: Record<string, "replace" | "keep">;
  } | null>(null);

  const loadAll = useCallback(async () => {
    setError(null);
    try {
      const [docs, factList] = await Promise.all([
        apiJson("/documents") as Promise<DocumentItem[]>,
        apiJson("/documents/facts") as Promise<BusinessFact[]>,
      ]);
      setDocuments(docs);
      setFacts(factList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load the knowledge base.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await apiJson(`/documents/${id}`, { method: "DELETE" });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      notifyDocumentsUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that source.");
    }
  };

  const handleEditSave = async (id: string, extracted_text: string) => {
    setError(null);
    try {
      const updated = (await apiJson(`/documents/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ extracted_text }),
      })) as DocumentItem;
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your edit.");
      throw err;
    }
  };

  const handleConfirm = async (id: string) => {
    setError(null);
    try {
      const result = (await apiJson(`/documents/${id}/confirm`, {
        method: "POST",
      })) as ConfirmDocumentResult;

      setDocuments((prev) => prev.map((d) => (d.id === id ? result.document : d)));
      notifyDocumentsUpdated();
      if (result.facts_saved.length) {
        const factList = (await apiJson("/documents/facts")) as BusinessFact[];
        setFacts(factList);
      }
      if (result.conflicts.length) {
        setConflictState({
          documentId: id,
          conflicts: result.conflicts,
          choices: Object.fromEntries(result.conflicts.map((c) => [c.key, "keep"])),
        });
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't confirm that source.");
    }
  };
  

  const handleFactUpdate = async (key: string, value: string) => {
    setError(null);
    try {
      const updated = (await apiJson(`/documents/facts/${encodeURIComponent(key)}`, {
        method: "PATCH",
        body: JSON.stringify({ value }),
      })) as BusinessFact;
      setFacts((prev) => prev.map((f) => (f.key === key ? updated : f)));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update that fact.");
      throw err;
    }
  };

  const handleFactDelete = async (key: string) => {
    setError(null);
    try {
      await apiJson(`/documents/facts/${encodeURIComponent(key)}`, { method: "DELETE" });
      setFacts((prev) => prev.filter((f) => f.key !== key));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that fact.");
    }
  };

  const submitConflictResolution = async () => {
    if (!conflictState) return;
    setError(null);
    try {
      await apiJson("/documents/resolve-facts", {
        method: "POST",
        body: JSON.stringify({
          document_id: conflictState.documentId,
          resolutions: conflictState.conflicts.map((c) => ({
            key: c.key,
            proposed_value: c.proposed_value,
            action: conflictState.choices[c.key],
          })),
        }),
      });
      const factList = (await apiJson("/documents/facts")) as BusinessFact[];
      setFacts(factList);
      setConflictState(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save those decisions.");
    }
  };

  // Group facts by their source document. Facts with a null
  // source_document_id (never linked, or linked doc was deleted) are
  // bucketed together under UNLINKED_GROUP_KEY instead of being dropped.
  const factGroups = useMemo(() => {
    const groups = new Map<
      string,
      { label: string; facts: BusinessFact[] }
    >();

    for (const fact of facts) {
      const groupKey = fact.source_document_id ?? UNLINKED_GROUP_KEY;

      if (!groups.has(groupKey)) {
        let label: string;
        if (groupKey === UNLINKED_GROUP_KEY) {
          label = "No longer linked to a source";
        } else {
          const doc = documents.find((d) => d.id === groupKey);
          label = fact.source_label || doc?.source_label || "Unknown source";
        }
        groups.set(groupKey, { label, facts: [] });
      }

      groups.get(groupKey)!.facts.push(fact);
    }

    // Keep the "unlinked" bucket last so linked, named sources read first.
    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === UNLINKED_GROUP_KEY) return 1;
      if (b === UNLINKED_GROUP_KEY) return -1;
      return 0;
    });
  }, [facts, documents]);

  return (
    <div className="flex flex-col gap-6">
      {error && <ErrorBanner message={error} />}

      <AddSourceCard
        onCreated={(doc) => setDocuments((prev) => [doc, ...prev])}
        onError={(msg) => setError(msg)}
      />

      <SectionCard>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-[#0B0F19]">
            Sources
          </h2>
          <span className="text-xs text-[#6B6F76]">
            {documents.length} {documents.length === 1 ? "source" : "sources"}
          </span>
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-[#6B6F76]">Loading…</p>
        ) : documents.length === 0 ? (
          <EmptyState icon={HiOutlineSparkles} text="Nothing here yet. Add a source above to start teaching the agent about your business." />
        ) : (
          <div className="flex flex-col gap-3">
            {documents.map((doc) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                onDelete={() => handleDelete(doc.id)}
                onSaveEdit={(text) => handleEditSave(doc.id, text)}
                onConfirm={() => handleConfirm(doc.id)}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-[#0B0F19]">
            Saved facts
          </h2>
          <span className="text-xs text-[#6B6F76]">
            {facts.length} {facts.length === 1 ? "fact" : "facts"}
          </span>
        </div>
        {facts.length === 0 ? (
          <EmptyState icon={HiOutlineCheckCircle} text="Confirmed sources will surface structured facts here." />
        ) : (
          <div className="flex flex-col gap-5">
            {factGroups.map(([groupKey, group]) => (
              <div key={groupKey}>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      groupKey === UNLINKED_GROUP_KEY ? "text-amber-700" : "text-[#6B6F76]"
                    }`}
                  >
                    {group.label}
                  </span>
                  <span className="text-xs text-[#6B6F76]">
                    ({group.facts.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {group.facts.map((fact) => (
                    <FactCard
                      key={`${groupKey}-${fact.key}`}
                      fact={fact}
                      onSave={(value) => handleFactUpdate(fact.key, value)}
                      onDelete={() => handleFactDelete(fact.key)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {conflictState && (
        <ConflictModal
          conflicts={conflictState.conflicts}
          choices={conflictState.choices}
          onChoose={(key, action) =>
            setConflictState((prev) =>
              prev ? { ...prev, choices: { ...prev.choices, [key]: action } } : prev
            )
          }
          onCancel={() => setConflictState(null)}
          onSubmit={submitConflictResolution}
        />
      )}
    </div>
  );
}

function FactCard({
  fact,
  onSave,
  onDelete,
}: {
  fact: BusinessFact;
  onSave: (value: string) => Promise<void>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(fact.value);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const save = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } catch {
      // error already surfaced by parent's banner
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="group rounded-xl border border-[#E5E5E0] px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[#6B6F76]">
          {fact.key}
        </p>
        {!editing && !confirmingDelete && (
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={() => {
                setDraft(fact.value);
                setEditing(true);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[#6B6F76] hover:bg-black/[0.05] hover:text-[#0B0F19]"
              aria-label="Edit fact"
            >
              <HiOutlinePencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[#6B6F76] hover:bg-rose-50 hover:text-rose-600"
              aria-label="Delete fact"
            >
              <HiOutlineTrash size={13} />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-1.5 flex flex-col gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            className="w-full rounded-lg border border-[#E5E5E0] px-2 py-1 text-sm text-[#0B0F19] outline-none focus:border-[#2B4EFF]"
          />
          <div className="flex items-center gap-2">
            <GhostButton
              onClick={() => {
                setDraft(fact.value);
                setEditing(false);
              }}
            >
              Cancel
            </GhostButton>
            <PrimaryButton onClick={save} disabled={saving || !draft.trim()}>
              {saving ? "Saving…" : "Save"}
            </PrimaryButton>
          </div>
        </div>
      ) : confirmingDelete ? (
        <div className="mt-1.5 flex flex-col gap-2">
          <p className="text-sm text-[#0B0F19]">Delete this fact?</p>
          <div className="flex items-center gap-2">
            <GhostButton onClick={() => setConfirmingDelete(false)} disabled={deleting}>
              Cancel
            </GhostButton>
            <GhostButton onClick={confirmDelete} disabled={deleting} danger>
              {deleting ? "Deleting…" : "Delete"}
            </GhostButton>
          </div>
        </div>
      ) : (
        <p className="truncate text-sm text-[#0B0F19]">{fact.value}</p>
      )}
    </div>
  );
}

function AddSourceCard({
  onCreated,
  onError,
}: {
  onCreated: (doc: DocumentItem) => void;
  onError: (msg: string) => void;
}) {
  const [addTab, setAddTab] = useState<SourceType>("text");
  const [text, setText] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setText("");
    setSourceLabel("");
    setUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      let doc: DocumentItem;
      if (addTab === "text") {
        if (!text.trim()) throw new Error("Add some text first.");
        doc = await apiJson("/documents/text", {
          method: "POST",
          body: JSON.stringify({ text, source_label: sourceLabel || null }),
        });
      } else if (addTab === "weblink") {
        if (!url.trim()) throw new Error("Add a URL first.");
        doc = await apiJson("/documents/weblink", {
          method: "POST",
          body: JSON.stringify({ url, source_label: sourceLabel || null }),
        });
      } else {
        const file = fileInputRef.current?.files?.[0];
        if (!file) throw new Error("Choose a file first.");
        doc = await apiUpload(`/documents/${addTab}`, file);
      }
      onCreated(doc);
      reset();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't add that source.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionCard>
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-[#0B0F19]">
        Add a source
      </h2>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {ADD_TABS.map(({ id, label, icon: Icon }) => {
          const active = addTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setAddTab(id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#2B4EFF]/10 text-[#0B0F19]"
                  : "text-[#6B6F76] hover:bg-black/[0.03] hover:text-[#0B0F19]"
              }`}
            >
              <Icon size={16} className={active ? "text-[#2B4EFF]" : ""} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {addTab === "text" && (
          <>
            <TextField
              label="Label"
              value={sourceLabel}
              onChange={setSourceLabel}
              placeholder="e.g. Opening hours"
              optional
            />
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-[#0B0F19]">Text</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="Paste or type the information you want the agent to know…"
                className="resize-y rounded-xl border border-[#E5E5E0] bg-white px-3 py-2 text-sm text-[#0B0F19] outline-none focus:border-[#2B4EFF]"
              />
            </label>
          </>
        )}

        {addTab === "weblink" && (
          <>
            <TextField label="URL" value={url} onChange={setUrl} placeholder="https://example.com/menu" />
            <TextField
              label="Label"
              value={sourceLabel}
              onChange={setSourceLabel}
              placeholder="e.g. Menu page"
              optional
            />
          </>
        )}

        {(addTab === "image" || addTab === "pdf") && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-[#0B0F19]">
              {addTab === "image" ? "Image file (PNG, JPEG, or WebP)" : "PDF file"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept={addTab === "image" ? "image/png,image/jpeg,image/webp" : "application/pdf"}
              className="rounded-xl border border-[#E5E5E0] bg-white px-3 py-2 text-sm text-[#0B0F19] outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#2B4EFF]/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#2B4EFF]"
            />
          </label>
        )}

        <div>
          <PrimaryButton onClick={submit} disabled={submitting}>
            <HiOutlinePlus size={16} />
            {submitting ? "Adding…" : "Add source"}
          </PrimaryButton>
        </div>
      </div>
    </SectionCard>
  );
}

function DocumentRow({
  document,
  onDelete,
  onSaveEdit,
  onConfirm,
}: {
  document: DocumentItem;
  onDelete: () => void;
  onSaveEdit: (text: string) => Promise<void>;
  onConfirm: () => void;
}) {
const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(document.extracted_text);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const icons: Record<SourceType, typeof HiOutlineDocumentText> = {
    text: HiOutlineDocumentText,
    image: HiOutlinePhoto,
    pdf: HiOutlineArrowUpTray,
    weblink: HiOutlineGlobeAlt,
  };
  const Icon = icons[document.source_type] ?? HiOutlineDocumentText;

  const save = async () => {
    setSaving(true);
    try {
      await onSaveEdit(draft);
      setEditing(false);
    } catch {
      // error already surfaced by parent's banner
    } finally {
      setSaving(false);
    }
  };

  const confirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  };
  const handleDeleteConfirmed = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#E5E5E0] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/[0.03] text-[#6B6F76]">
            <Icon size={16} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#0B0F19]">
              {document.source_label || "Untitled source"}
            </p>
            <p className="text-xs text-[#6B6F76]">
              {formatDate(document.created_at)} · {document.total_tokens} tokens
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {document.is_active ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <HiOutlineCheckCircle size={13} /> Active
            </span>
          ) : (
            <ConfidenceBadge confidence={document.confidence} />
          )}
        </div>
      </div>

      {!document.is_active && (
        <p className="mt-2 text-xs text-[#6B6F76]">{document.reason}</p>
      )}

      <div className="mt-3">
        {editing ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={16}
            autoFocus
            className="min-h-[24rem] w-full resize-y rounded-xl border border-[#E5E5E0] bg-white px-3 py-2 text-sm leading-relaxed text-[#0B0F19] outline-none focus:border-[#2B4EFF]"
          />
        ) : (
          <p className="whitespace-pre-wrap rounded-xl bg-black/[0.02] px-3 py-2 text-sm text-[#0B0F19] line-clamp-4">
            {document.extracted_text}
          </p>
        )}
      </div>

<div className="mt-3 flex flex-wrap items-center gap-2">
        {!document.is_active && !editing && !confirmingDelete && (
          <>
            <GhostButton onClick={() => setEditing(true)}>
              <HiOutlinePencil size={15} /> Edit
            </GhostButton>
            <PrimaryButton onClick={confirm} disabled={confirming}>
              <HiOutlineCheck size={15} />
              {confirming ? "Confirming…" : "Confirm"}
            </PrimaryButton>
          </>
        )}
        {editing && (
          <>
            <GhostButton
              onClick={() => {
                setDraft(document.extracted_text);
                setEditing(false);
              }}
            >
              Cancel
            </GhostButton>
            <PrimaryButton onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </PrimaryButton>
          </>
        )}

        {!confirmingDelete && !editing && (
          <GhostButton onClick={() => setConfirmingDelete(true)} danger>
            <HiOutlineTrash size={15} /> Delete
          </GhostButton>
        )}

        {confirmingDelete && (
          <div className="flex w-full items-center justify-between gap-2 rounded-lg bg-rose-50 px-3 py-2">
<span className="text-sm text-rose-700">
              {document.is_active
                ? "Delete this source? The agent will forget anything learned from it."
                : "Delete this source? It hasn't been confirmed yet, so nothing will be forgotten."}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <GhostButton onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                Cancel
              </GhostButton>
              <GhostButton onClick={handleDeleteConfirmed} disabled={deleting} danger>
                {deleting ? "Deleting…" : "Yes, delete"}
              </GhostButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConflictModal({
  conflicts,
  choices,
  onChoose,
  onCancel,
  onSubmit,
}: {
  conflicts: FactConflict[];
  choices: Record<string, "replace" | "keep">;
  onChoose: (key: string, action: "replace" | "keep") => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#E5E5E0] bg-white p-5">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-[#0B0F19]">
            Some facts don&apos;t match
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-[#6B6F76] hover:text-[#0B0F19]"
            aria-label="Close"
          >
            <HiOutlineXMark size={18} />
          </button>
        </div>
        <p className="mb-4 text-sm text-[#6B6F76]">
          This source disagrees with something already saved. Pick which value to keep for each.
        </p>

        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
          {conflicts.map((c) => (
            <div key={c.key} className="rounded-xl border border-[#E5E5E0] p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#6B6F76]">
                {c.key}
              </p>
              <div className="flex flex-col gap-1.5">
                <label
                  className={`flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-sm ${
                    choices[c.key] === "keep"
                      ? "border-[#2B4EFF] bg-[#2B4EFF]/5"
                      : "border-[#E5E5E0]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`conflict-${c.key}`}
                    checked={choices[c.key] === "keep"}
                    onChange={() => onChoose(c.key, "keep")}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-xs text-[#6B6F76]">Keep existing</span>
                    {c.existing_value}
                  </span>
                </label>
                <label
                  className={`flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-sm ${
                    choices[c.key] === "replace"
                      ? "border-[#2B4EFF] bg-[#2B4EFF]/5"
                      : "border-[#E5E5E0]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`conflict-${c.key}`}
                    checked={choices[c.key] === "replace"}
                    onChange={() => onChoose(c.key, "replace")}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-xs text-[#6B6F76]">Replace with new</span>
                    {c.proposed_value}
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <PrimaryButton onClick={onSubmit}>Save decisions</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * Business links
 * ====================================================================== */

function LinksSection() {
  const [links, setLinks] = useState<BusinessLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const data = (await apiJson("/gallery/links")) as { links: BusinessLink[] };
        setLinks(data.links);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't load your links.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateRow = (index: number, patch: Partial<BusinessLink>) => {
    setSaved(false);
    setLinks((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const addRow = () => {
    setSaved(false);
    setLinks((prev) => [...prev, { platform: "", url: "", label: "" }]);
  };

  const removeRow = (index: number) => {
    setSaved(false);
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    const cleaned = links
      .filter((l) => l.platform.trim() && l.url.trim())
      .map((l) => ({ ...l, label: l.label?.trim() ? l.label : null }));

    setSaving(true);
    setError(null);
    try {
      const data = (await apiJson("/gallery/links", {
        method: "PUT",
        body: JSON.stringify({ links: cleaned }),
      })) as { links: BusinessLink[] };
      setLinks(data.links);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your links.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {error && <ErrorBanner message={error} />}

      <SectionCard>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-[#0B0F19]">
              Where to find you
            </h2>
            <p className="text-sm text-[#6B6F76]">
              The agent can share these when a customer asks for your socials, menu, or booking page.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-[#6B6F76]">Loading…</p>
        ) : (
          <div className="flex flex-col gap-3">
            {links.length === 0 && <EmptyState icon={HiOutlineLink} text="No links yet. Add one below." />}

            {links.map((link, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-2 rounded-xl border border-[#E5E5E0] p-3 sm:grid-cols-[1fr_2fr_1.5fr_auto] sm:items-end"
              >
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-[#0B0F19]">Platform</span>
                  <input
                    value={link.platform}
                    onChange={(e) => updateRow(index, { platform: e.target.value })}
                    placeholder="instagram"
                    className="rounded-lg border border-[#E5E5E0] px-2.5 py-1.5 text-sm text-[#0B0F19] outline-none focus:border-[#2B4EFF]"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-[#0B0F19]">URL</span>
                  <input
                    value={link.url}
                    onChange={(e) => updateRow(index, { url: e.target.value })}
                    placeholder="https://…"
                    className="rounded-lg border border-[#E5E5E0] px-2.5 py-1.5 text-sm text-[#0B0F19] outline-none focus:border-[#2B4EFF]"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-[#0B0F19]">Label (optional)</span>
                  <input
                    value={link.label ?? ""}
                    onChange={(e) => updateRow(index, { label: e.target.value })}
                    placeholder="Follow us on Instagram"
                    className="rounded-lg border border-[#E5E5E0] px-2.5 py-1.5 text-sm text-[#0B0F19] outline-none focus:border-[#2B4EFF]"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="flex h-9 w-9 items-center justify-center justify-self-start rounded-lg text-[#6B6F76] hover:bg-rose-50 hover:text-rose-600 sm:justify-self-center"
                  aria-label="Remove link"
                >
                  <HiOutlineTrash size={16} />
                </button>
              </div>
            ))}

            <div className="flex items-center justify-between pt-1">
              <GhostButton onClick={addRow}>
                <HiOutlinePlus size={15} /> Add link
              </GhostButton>
              <div className="flex items-center gap-3">
                {saved && <span className="text-xs text-emerald-700">Saved</span>}
                <PrimaryButton onClick={save} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}