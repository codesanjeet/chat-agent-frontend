"use client";

/**
 * Leads.tsx
 *
 * Two-tab dashboard: "Forms" lets the owner build/edit the lead-capture
 * forms the chatbot triggers, matching:
 *   POST/GET /leads/forms, GET/PATCH/DELETE /leads/forms/{id}
 * "Leads" lists submitted entries against:
 *   GET /leads, PATCH /leads/{id}/payment-status, DELETE /leads/{id}
 *
 * Payment verification is manual for MVP -- the business reviews the
 * uploaded screenshot (payment_proof_url) against their own payment QR
 * (from Settings) and flips the status here. Nothing on the public side
 * ever blocks on payment; this tab is purely follow-up bookkeeping.
 *
 * Visual language matches Settings.tsx: #E5E5E0 hairlines, #0B0F19 ink,
 * #6B6F76 secondary text, #2B4EFF accent, rounded-2xl/rounded-xl cards.
 */

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineClipboardDocumentList,
  HiOutlineExclamationTriangle,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineQrCode,
  HiOutlineTrash,
  HiOutlineXCircle,
} from "react-icons/hi2";
import apiRequest from "../lib/apiReq";

/* -------------------------------------------------------------------------
 * Types (mirror app/schemas/lead.py field-for-field)
 * ---------------------------------------------------------------------- */

type FieldType = "text" | "textarea" | "number" | "email" | "phone" | "date" | "select";

interface LeadFormField {
  key: string;
  label: string;
  type: FieldType;
  prompt: string;
  required: boolean;
  options: string[] | null;
}

interface LeadForm {
  id: string;
  name: string;
  trigger_intent: string | null;
  is_default: boolean;
  requires_payment: boolean;
  schema: { fields: LeadFormField[] };
  created_at: string;
  updated_at: string;
}

interface Lead {
  id: string;
  session_id: string;
  lead_form_id: string | null;
  data: Record<string, unknown>;
  status: string;
  payment_status: "pending" | "verified" | "rejected" | null;
  payment_proof_url: string | null;
  created_at: string;
}

type Feedback = { type: "success" | "error"; text: string };

const FIELD_TYPES: FieldType[] = ["text", "textarea", "number", "email", "phone", "date", "select"];

/* -------------------------------------------------------------------------
 * Small local primitives (same tokens as Settings.tsx)
 * ---------------------------------------------------------------------- */

function InlineMessage({ type, text }: Feedback) {
  return (
    <div
      className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs ${
        type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      }`}
    >
      {type === "error" ? (
        <HiOutlineExclamationTriangle size={14} className="mt-0.5 shrink-0" />
      ) : (
        <HiOutlineCheckCircle size={14} className="mt-0.5 shrink-0" />
      )}
      <span>{text}</span>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
  badge,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E5E0] bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#2B4EFF]">{icon}</span>
          <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#0B0F19]">{title}</h2>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#E5E5E0] bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-[#B9BAB6] focus:border-[#2B4EFF] transition-colors";
const labelClass = "mb-1.5 block text-xs font-medium text-[#6B6F76]";

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

/* =========================================================================
 * Top-level view
 * ====================================================================== */

export default function Leads() {
  const [tab, setTab] = useState<"forms" | "leads">("forms");
  const [forms, setForms] = useState<LeadForm[]>([]);
  const [paymentQr, setPaymentQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoadError(null);
    try {
      const [formsResult, settingsResult] = await Promise.all([
        apiRequest("/leads/forms") as Promise<LeadForm[]>,
        apiRequest("/settings") as Promise<{ payment_qr_image: string | null }>,
      ]);
      setForms(formsResult);
      setPaymentQr(settingsResult.payment_qr_image);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Couldn't load leads data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (loading) {
    return <p className="py-10 text-center text-sm text-[#6B6F76]">Loading…</p>;
  }

  if (loadError) {
    return <InlineMessage type="error" text={loadError} />;
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="flex gap-2 rounded-2xl border border-[#E5E5E0] bg-white p-1.5">
        {(["forms", "leads"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              tab === t ? "bg-[#2B4EFF] text-white" : "text-[#6B6F76] hover:bg-[#F5F5F3]"
            }`}
          >
            {t === "forms" ? "Lead forms" : "Submitted leads"}
          </button>
        ))}
      </div>

      {tab === "forms" ? (
        <FormsTab forms={forms} setForms={setForms} />
      ) : (
        <LeadsTab forms={forms} paymentQr={paymentQr} />
      )}
    </div>
  );
}

/* =========================================================================
 * Forms tab
 * ====================================================================== */

function FormsTab({ forms, setForms }: { forms: LeadForm[]; setForms: (f: LeadForm[]) => void }) {
  const [editing, setEditing] = useState<LeadForm | "new" | null>(null);

  const refresh = async () => {
    const result = (await apiRequest("/leads/forms")) as LeadForm[];
    setForms(result);
  };

  const handleDelete = async (form: LeadForm) => {
    if (
      !window.confirm(
        `Delete "${form.name}"? Existing leads submitted through it will keep their data, but it can no longer be triggered.`
      )
    ) {
      return;
    }
    await apiRequest(`/leads/forms/${form.id}`, { method: "DELETE" });
    await refresh();
  };

  if (editing) {
    return (
      <FormEditor
        initial={editing === "new" ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null);
          await refresh();
        }}
      />
    );
  }

  return (
    <SectionCard
      title="Lead forms"
      icon={<HiOutlineClipboardDocumentList size={16} />}
      badge={
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 rounded-xl bg-[#2B4EFF] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#1E3ADE]"
        >
          <HiOutlinePlus size={14} /> New form
        </button>
      }
    >
      {forms.length === 0 && (
        <p className="text-xs text-[#6B6F76]">
          No forms yet — create one to have your chatbot collect structured info (name, budget, date, etc.) from
          visitors mid-conversation.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {forms.map((form) => (
          <div
            key={form.id}
            className="flex flex-col gap-2 rounded-xl border border-[#E5E5E0] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-[#0B0F19]">{form.name}</p>
                {form.is_default && (
                  <span className="rounded-full bg-[#F4F4F1] px-2 py-0.5 text-[10px] font-medium text-[#6B6F76]">
                    Default
                  </span>
                )}
                {form.requires_payment && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                    <HiOutlineQrCode size={11} /> Payment
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-[#6B6F76]">
                {form.trigger_intent ? `Triggers on: ${form.trigger_intent}` : "No trigger hint set"} ·{" "}
                {form.schema.fields.length} field{form.schema.fields.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setEditing(form)}
                className="flex items-center gap-1.5 rounded-xl border border-[#E5E5E0] bg-white px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[#F5F5F3]"
              >
                <HiOutlinePencil size={13} /> Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(form)}
                className="flex items-center gap-1.5 rounded-xl border border-[#E5E5E0] bg-white px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
              >
                <HiOutlineTrash size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------------
 * Form editor: create or edit a single form + its dynamic field list
 * --------------------------------------------------------------------- */

function FormEditor({
  initial,
  onCancel,
  onSaved,
}: {
  initial: LeadForm | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [triggerIntent, setTriggerIntent] = useState(initial?.trigger_intent || "");
  const [isDefault, setIsDefault] = useState(initial?.is_default || false);
  const [requiresPayment, setRequiresPayment] = useState(initial?.requires_payment || false);
  const [fields, setFields] = useState<(LeadFormField & { _id: string })[]>(
    (initial?.schema.fields || []).map((f) => ({ ...f, _id: uid() }))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Feedback | null>(null);

  const addField = () =>
    setFields((prev) => [
      ...prev,
      { _id: uid(), key: "", label: "", type: "text", prompt: "", required: false, options: null },
    ]);

  const updateField = (id: string, patch: Partial<LeadFormField>) =>
    setFields((prev) => prev.map((f) => (f._id === id ? { ...f, ...patch } : f)));

  const removeField = (id: string) => setFields((prev) => prev.filter((f) => f._id !== id));

  const handleSave = async () => {
    setMessage(null);

    if (!name.trim()) {
      setMessage({ type: "error", text: "Give the form a name." });
      return;
    }
    if (fields.length === 0) {
      setMessage({ type: "error", text: "Add at least one field." });
      return;
    }
    const keys = fields.map((f) => f.key.trim());
    if (keys.some((k) => !k)) {
      setMessage({ type: "error", text: "Every field needs a key." });
      return;
    }
    if (new Set(keys).size !== keys.length) {
      setMessage({ type: "error", text: "Field keys must be unique." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        trigger_intent: triggerIntent.trim() || null,
        is_default: isDefault,
        requires_payment: requiresPayment,
        schema: {
          fields: fields.map(({ _id, ...f }) => ({
            ...f,
            key: f.key.trim(),
            label: f.label.trim() || f.key.trim(),
            prompt: f.prompt.trim() || `Could you share your ${f.label.trim() || f.key.trim()}?`,
            options: f.type === "select" ? f.options : null,
          })),
        },
      };

      if (initial) {
        await apiRequest(`/leads/forms/${initial.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await apiRequest("/leads/forms", { method: "POST", body: JSON.stringify(payload) });
      }
      onSaved();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Couldn't save form." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard
      title={initial ? `Edit "${initial.name}"` : "New lead form"}
      icon={<HiOutlineClipboardDocumentList size={16} />}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Form name</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Property Inquiry"
            />
          </div>
          <div>
            <label className={labelClass}>
              Trigger hint <span className="text-[#B9BAB6]">— optional</span>
            </label>
            <input
              className={inputClass}
              value={triggerIntent}
              onChange={(e) => setTriggerIntent(e.target.value)}
              placeholder="e.g. site visit, quote request"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-xs text-[#0B0F19]">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            Use as default form
          </label>
          <label className="flex items-center gap-2 text-xs text-[#0B0F19]">
            <input
              type="checkbox"
              checked={requiresPayment}
              onChange={(e) => setRequiresPayment(e.target.checked)}
            />
            Requires payment before completion
          </label>
        </div>

        {requiresPayment && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
            <HiOutlineExclamationTriangle size={14} className="mt-0.5 shrink-0" />
            <span>
              This never blocks form submission. Leads still complete instantly and start as{" "}
              <strong>pending</strong> — the visitor is then shown your QR and can optionally upload a payment
              screenshot. You verify it manually from the &quot;Submitted leads&quot; tab; if they never pay, the
              lead stays pending for you to follow up on.
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className={labelClass}>Fields</p>
            <button
              type="button"
              onClick={addField}
              className="flex items-center gap-1.5 rounded-xl border border-dashed border-[#E5E5E0] px-3 py-1.5 text-xs font-medium text-[#6B6F76] transition-colors hover:bg-black/[0.02]"
            >
              <HiOutlinePlus size={13} /> Add field
            </button>
          </div>

          {fields.length === 0 && <p className="text-xs text-[#6B6F76]">No fields yet.</p>}

          {fields.map((f) => (
            <div key={f._id} className="flex flex-col gap-2 rounded-xl border border-[#E5E5E0] p-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_120px]">
                <input
                  className={inputClass}
                  placeholder="key (e.g. budget)"
                  value={f.key}
                  onChange={(e) => updateField(f._id, { key: e.target.value.replace(/\s+/g, "_") })}
                />
                <input
                  className={inputClass}
                  placeholder="label (e.g. Budget)"
                  value={f.label}
                  onChange={(e) => updateField(f._id, { label: e.target.value })}
                />
                <select
                  className={inputClass}
                  value={f.type}
                  onChange={(e) => updateField(f._id, { type: e.target.value as FieldType })}
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <input
                className={inputClass}
                placeholder="What the bot asks (e.g. What's your budget range?)"
                value={f.prompt}
                onChange={(e) => updateField(f._id, { prompt: e.target.value })}
              />

              {f.type === "select" && (
                <input
                  className={inputClass}
                  placeholder="Options, comma separated (e.g. Under 50L, 50L-1Cr, 1Cr+)"
                  value={(f.options || []).join(", ")}
                  onChange={(e) =>
                    updateField(f._id, {
                      options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean),
                    })
                  }
                />
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-[#6B6F76]">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) => updateField(f._id, { required: e.target.checked })}
                  />
                  Required
                </label>
                <button
                  type="button"
                  onClick={() => removeField(f._id)}
                  className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:underline"
                >
                  <HiOutlineTrash size={13} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#2B4EFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1E3ADE] disabled:opacity-50"
          >
            {saving ? "Saving…" : initial ? "Save changes" : "Create form"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#E5E5E0] bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#F5F5F3]"
          >
            Cancel
          </button>
        </div>

        {message && <InlineMessage type={message.type} text={message.text} />}
      </div>
    </SectionCard>
  );
}

/* =========================================================================
 * Leads tab
 * ====================================================================== */

function LeadsTab({ forms, paymentQr }: { forms: LeadForm[]; paymentQr: string | null }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [message, setMessage] = useState<Feedback | null>(null);

  const formName = (id: string | null) => forms.find((f) => f.id === id)?.name || "—";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (paymentFilter) params.set("payment_status", paymentFilter);
      const qs = params.toString();
      const result = (await apiRequest(`/leads${qs ? `?${qs}` : ""}`)) as Lead[];
      setLeads(result);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Couldn't load leads." });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, paymentFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const setPayment = async (lead: Lead, next: "verified" | "rejected") => {
    try {
      await apiRequest(`/leads/${lead.id}/payment-status`, {
        method: "PATCH",
        body: JSON.stringify({ payment_status: next }),
      });
      await load();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Couldn't update payment status." });
    }
  };

  const paymentBadge = (status: Lead["payment_status"]) => {
    if (!status) return null;
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700",
      verified: "bg-emerald-50 text-emerald-700",
      rejected: "bg-rose-50 text-rose-700",
    };
    return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="flex flex-col gap-5">
      {paymentQr && (
        <SectionCard title="Your payment QR" icon={<HiOutlineQrCode size={16} />}>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={paymentQr} alt="Payment QR" className="h-20 w-20 rounded-xl border border-[#E5E5E0] object-cover" />
            <p className="text-xs text-[#6B6F76]">
              This is the same QR shown to visitors after they submit a payment-required form. Cross-check each
              &quot;pending&quot; lead below against payments you&apos;ve actually received before marking it
              verified.
            </p>
          </div>
        </SectionCard>
      )}

      <SectionCard
        title="Submitted leads"
        icon={<HiOutlineClipboardDocumentList size={16} />}
        badge={
          <div className="flex gap-2">
            <select
              className={`${inputClass} w-auto py-1.5 text-xs`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="in_progress">In progress</option>
              <option value="complete">Complete</option>
            </select>
            <select
              className={`${inputClass} w-auto py-1.5 text-xs`}
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="">All payments</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        }
      >
        {loading && <p className="text-xs text-[#6B6F76]">Loading…</p>}
        {!loading && leads.length === 0 && <p className="text-xs text-[#6B6F76]">No leads match these filters yet.</p>}

        <div className="flex flex-col gap-2">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-xl border border-[#E5E5E0]">
              <button
                type="button"
                onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                className="flex w-full items-center justify-between gap-3 p-3 text-left"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-[#0B0F19]">{formName(lead.lead_form_id)}</p>
                    <span className="rounded-full bg-[#F4F4F1] px-2 py-0.5 text-[10px] font-medium text-[#6B6F76]">
                      {lead.status}
                    </span>
                    {paymentBadge(lead.payment_status)}
                  </div>
                  <p className="mt-0.5 text-xs text-[#6B6F76]">
                    {new Date(lead.created_at).toLocaleString()} · session {lead.session_id.slice(0, 8)}…
                  </p>
                </div>
                {expanded === lead.id ? <HiOutlineChevronUp size={16} /> : <HiOutlineChevronDown size={16} />}
              </button>

              {expanded === lead.id && (
                <div className="border-t border-[#E5E5E0] p-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {Object.entries(lead.data).map(([k, v]) => (
                      <div key={k} className="rounded-lg bg-[#F4F4F1] px-3 py-2 text-xs">
                        <p className="text-[#6B6F76]">{k}</p>
                        <p className="mt-0.5 font-medium text-[#0B0F19]">{String(v)}</p>
                      </div>
                    ))}
                  </div>

                  {lead.payment_status === "pending" && (
                    <div className="mt-3">
                      {lead.payment_proof_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={lead.payment_proof_url}
                          alt="Payment proof"
                          className="h-32 w-32 rounded-xl border border-[#E5E5E0] object-cover"
                        />
                      ) : (
                        <p className="text-xs text-[#6B6F76]">No screenshot uploaded yet.</p>
                      )}

                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPayment(lead, "verified")}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                        >
                          <HiOutlineCheckCircle size={13} /> Mark verified
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayment(lead, "rejected")}
                          className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                        >
                          <HiOutlineXCircle size={13} /> Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {message && <InlineMessage type={message.type} text={message.text} />}
      </SectionCard>
    </div>
  );
}