"use client";


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
  form_schema: { fields: LeadFormField[] };
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
                {form.form_schema.fields.length} field{form.form_schema.fields.length === 1 ? "" : "s"}
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


// Common fields a small business almost always wants -- one tap adds them
// with sensible defaults already filled in, so most owners never have to
// touch "custom field" at all.
const FIELD_PRESETS: { label: string; type: FieldType; required?: boolean }[] = [
  { label: "Name", type: "text", required: true },
  { label: "Phone number", type: "phone", required: true },
  { label: "Email", type: "email" },
  { label: "Address", type: "text" },
  { label: "Preferred date", type: "date" },
  { label: "Budget", type: "number" },
  { label: "Message", type: "textarea" },
];

// Plain-language labels for the field type picker -- "type: select" means
// nothing to a business owner, "Multiple choice" does.
const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Short answer",
  textarea: "Long answer",
  number: "Number",
  email: "Email",
  phone: "Phone number",
  date: "Date",
  select: "Multiple choice",
};

function slugifyKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "field";
}

function uniqueKey(base: string, existing: string[]): string {
  if (!existing.includes(base)) return base;
  let i = 2;
  while (existing.includes(`${base}_${i}`)) i++;
  return `${base}_${i}`;
}

type WizardStep = 1 | 2 | 3;

function StepHeader({ step }: { step: WizardStep }) {
  const steps = ["Basics", "Questions", "Review"];
  return (
    <div className="mb-5 flex items-center gap-2">
      {steps.map((label, i) => {
        const n = (i + 1) as WizardStep;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                active
                  ? "bg-[#2B4EFF] text-white"
                  : done
                  ? "bg-[#2B4EFF]/15 text-[#2B4EFF]"
                  : "bg-[#F4F4F1] text-[#B9BAB6]"
              }`}
            >
              {done ? <HiOutlineCheckCircle size={14} /> : n}
            </div>
            <span className={`text-xs font-medium ${active ? "text-[#0B0F19]" : "text-[#B9BAB6]"}`}>{label}</span>
            {i < steps.length - 1 && <div className="h-px w-4 bg-[#E5E5E0]" />}
          </div>
        );
      })}
    </div>
  );
}

function FormEditor({
  initial,
  onCancel,
  onSaved,
}: {
  initial: LeadForm | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [step, setStep] = useState<WizardStep>(1);

  const [name, setName] = useState(initial?.name || "");
  const [triggerIntent, setTriggerIntent] = useState(initial?.trigger_intent || "");
  const [isDefault, setIsDefault] = useState(initial?.is_default || false);
  const [requiresPayment, setRequiresPayment] = useState(initial?.requires_payment || false);
  const [fields, setFields] = useState<(LeadFormField & { _id: string })[]>(
    (initial?.form_schema.fields || []).map((f) => ({ ...f, _id: uid() }))
  );
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Feedback | null>(null);

  const existingKeys = (excludeId?: string) => fields.filter((f) => f._id !== excludeId).map((f) => f.key);

  const addPreset = (preset: (typeof FIELD_PRESETS)[number]) => {
    const key = uniqueKey(slugifyKey(preset.label), existingKeys());
    setFields((prev) => [
      ...prev,
      {
        _id: uid(),
        key,
        label: preset.label,
        type: preset.type,
        prompt: "",
        required: preset.required ?? false,
        options: preset.type === "select" ? [] : null,
      },
    ]);
  };

  const addCustomField = () => {
    const newField = {
      _id: uid(),
      key: "",
      label: "",
      type: "text" as FieldType,
      prompt: "",
      required: false,
      options: null,
    };
    setFields((prev) => [...prev, newField]);
    setEditingFieldId(newField._id);
  };

  const updateField = (id: string, patch: Partial<LeadFormField>) =>
    setFields((prev) =>
      prev.map((f) => {
        if (f._id !== id) return f;
        const next = { ...f, ...patch };
        // Keep key in sync with label for fields the person is typing fresh,
        // so they never have to think about "key" as a separate concept.
        if (patch.label !== undefined) {
          next.key = uniqueKey(slugifyKey(patch.label), existingKeys(id));
        }
        return next;
      })
    );

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f._id !== id));
    if (editingFieldId === id) setEditingFieldId(null);
  };

  const presetAlreadyAdded = (label: string) =>
    fields.some((f) => f.label.trim().toLowerCase() === label.toLowerCase());

  const goToStep = (next: WizardStep) => {
    setMessage(null);
    if (next === 2 && !name.trim()) {
      setMessage({ type: "error", text: "Give the form a name first." });
      return;
    }
    if (next === 3 && fields.length === 0) {
      setMessage({ type: "error", text: "Add at least one question." });
      return;
    }
    setStep(next);
  };

  const handleSave = async () => {
    setMessage(null);

    if (!name.trim()) {
      setMessage({ type: "error", text: "Give the form a name." });
      setStep(1);
      return;
    }
    if (fields.length === 0) {
      setMessage({ type: "error", text: "Add at least one question." });
      setStep(2);
      return;
    }
    const emptyLabel = fields.find((f) => !f.label.trim());
    if (emptyLabel) {
      setMessage({ type: "error", text: "Every question needs a label." });
      setStep(2);
      setEditingFieldId(emptyLabel._id);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        trigger_intent: triggerIntent.trim() || null,
        is_default: isDefault,
        requires_payment: requiresPayment,
        form_schema: {
          fields: fields.map(({ _id, ...f }) => ({
            ...f,
            key: f.key.trim(),
            label: f.label.trim(),
            prompt: f.prompt.trim() || `Could you share your ${f.label.trim()}?`,
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
      <StepHeader step={step} />

      {/* ---------------- Step 1: Basics ---------------- */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>What's this form for?</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Property Inquiry, Book a Table"
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>
              When should your chatbot bring this up? <span className="text-[#B9BAB6]">— optional</span>
            </label>
            <input
              className={inputClass}
              value={triggerIntent}
              onChange={(e) => setTriggerIntent(e.target.value)}
              placeholder="e.g. when someone asks for a quote or wants to book a visit"
            />
            <p className="mt-1.5 text-[11px] text-[#6B6F76]">
              Leave this blank and your chatbot will use its best judgment.
            </p>
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-[#E5E5E0] px-3.5 py-2.5 text-sm text-[#0B0F19]">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            Make this the go-to form when nothing else fits
          </label>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="rounded-xl bg-[#2B4EFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1E3ADE]"
            >
              Next: add questions
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Step 2: Fields ---------------- */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div>
            <p className={labelClass}>Tap to add a common question</p>
            <div className="flex flex-wrap gap-2">
              {FIELD_PRESETS.map((p) => {
                const added = presetAlreadyAdded(p.label);
                return (
                  <button
                    key={p.label}
                    type="button"
                    disabled={added}
                    onClick={() => addPreset(p)}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                      added
                        ? "border-[#E5E5E0] bg-[#F4F4F1] text-[#B9BAB6]"
                        : "border-[#E5E5E0] bg-white text-[#0B0F19] hover:border-[#2B4EFF] hover:text-[#2B4EFF]"
                    }`}
                  >
                    {added ? <HiOutlineCheckCircle size={13} /> : <HiOutlinePlus size={13} />}
                    {p.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={addCustomField}
                className="flex items-center gap-1.5 rounded-full border border-dashed border-[#E5E5E0] px-3.5 py-2 text-xs font-medium text-[#6B6F76] transition-colors hover:bg-black/[0.02]"
              >
                <HiOutlinePlus size={13} /> Something else
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {fields.length === 0 && (
              <p className="rounded-xl border border-dashed border-[#E5E5E0] py-6 text-center text-xs text-[#6B6F76]">
                No questions yet — tap a button above to add one.
              </p>
            )}

            {fields.map((f) => (
              <FieldRow
                key={f._id}
                field={f}
                editing={editingFieldId === f._id}
                onEdit={() => setEditingFieldId(editingFieldId === f._id ? null : f._id)}
                onChange={(patch) => updateField(f._id, patch)}
                onRemove={() => removeField(f._id)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-[#E5E5E0] bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#F5F5F3]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="rounded-xl bg-[#2B4EFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1E3ADE]"
            >
              Next: review
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Step 3: Review + settings ---------------- */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-[#E5E5E0] p-4">
            <p className="text-sm font-medium text-[#0B0F19]">{name}</p>
            {triggerIntent && <p className="mt-0.5 text-xs text-[#6B6F76]">Triggers on: {triggerIntent}</p>}
            <div className="mt-3 flex flex-col gap-1.5">
              {fields.map((f) => (
                <div key={f._id} className="flex items-center justify-between text-xs">
                  <span className="text-[#0B0F19]">
                    {f.label} <span className="text-[#B9BAB6]">· {FIELD_TYPE_LABELS[f.type]}</span>
                  </span>
                  {f.required && <span className="text-[10px] font-medium text-[#2B4EFF]">Required</span>}
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-2 rounded-xl border border-[#E5E5E0] px-3.5 py-2.5 text-sm text-[#0B0F19]">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={requiresPayment}
              onChange={(e) => setRequiresPayment(e.target.checked)}
            />
            <span>
              Ask for payment before this is done
              <span className="mt-0.5 block text-xs font-normal text-[#6B6F76]">
                Visitors can still submit the form right away — they'll just see your payment QR afterward and you
                confirm payment yourself from "Submitted leads."
              </span>
            </span>
          </label>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl border border-[#E5E5E0] bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#F5F5F3]"
            >
              Back
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-[#E5E5E0] bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#F5F5F3]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-[#2B4EFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1E3ADE] disabled:opacity-50"
              >
                {saving ? "Saving…" : initial ? "Save changes" : "Create form"}
              </button>
            </div>
          </div>
        </div>
      )}

      {message && <InlineMessage type={message.type} text={message.text} />}
    </SectionCard>
  );
}

/* ------------------------------------------------------------------------
 * One question in the step-2 list. Collapsed by default (just the label +
 * type + required badge, tap to edit); expands into a small inline editor.
 * No "key" input anywhere -- key is derived from label automatically.
 * --------------------------------------------------------------------- */

function FieldRow({
  field,
  editing,
  onEdit,
  onChange,
  onRemove,
}: {
  field: LeadFormField & { _id: string };
  editing: boolean;
  onEdit: () => void;
  onChange: (patch: Partial<LeadFormField>) => void;
  onRemove: () => void;
}) {
  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-[#E5E5E0] px-3.5 py-2.5">
        <button type="button" onClick={onEdit} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="truncate text-sm font-medium text-[#0B0F19]">{field.label || "Untitled question"}</span>
          <span className="shrink-0 text-xs text-[#6B6F76]">{FIELD_TYPE_LABELS[field.type]}</span>
          {field.required && <span className="shrink-0 text-[10px] font-medium text-[#2B4EFF]">Required</span>}
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B6F76] hover:bg-black/[0.05] hover:text-[#0B0F19]"
            aria-label="Edit question"
          >
            <HiOutlinePencil size={13} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B6F76] hover:bg-rose-50 hover:text-rose-600"
            aria-label="Remove question"
          >
            <HiOutlineTrash size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-[#2B4EFF]/40 bg-[#2B4EFF]/[0.02] p-3.5">
      <input
        className={inputClass}
        placeholder="What do you want to ask? (e.g. Budget)"
        value={field.label}
        onChange={(e) => onChange({ label: e.target.value })}
        autoFocus
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          className={inputClass}
          value={field.type}
          onChange={(e) => onChange({ type: e.target.value as FieldType })}
        >
          {FIELD_TYPES.map((t) => (
            <option key={t} value={t}>
              {FIELD_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-xl border border-[#E5E5E0] bg-white px-3.5 text-sm text-[#0B0F19]">
          <input type="checkbox" checked={field.required} onChange={(e) => onChange({ required: e.target.checked })} />
          Required
        </label>
      </div>

      {field.type === "select" && (
        <input
          className={inputClass}
          placeholder="Choices, separated by commas (e.g. Under 50L, 50L-1Cr, 1Cr+)"
          value={(field.options || []).join(", ")}
          onChange={(e) => onChange({ options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean) })}
        />
      )}

      <details className="text-xs">
        <summary className="cursor-pointer select-none text-[#6B6F76]">Customize how the bot asks this</summary>
        <input
          className={`${inputClass} mt-2`}
          placeholder={`Could you share your ${field.label || "answer"}?`}
          value={field.prompt}
          onChange={(e) => onChange({ prompt: e.target.value })}
        />
      </details>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-xl bg-[#2B4EFF] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1E3ADE]"
        >
          Done
        </button>
      </div>
    </div>
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