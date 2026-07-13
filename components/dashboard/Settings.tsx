"use client";

/**
 * Settings.tsx
 *
 * Business settings dashboard: profile, branding (logo/payment QR), business
 * links, usage, and a "coming soon" theme section. Each section saves
 * independently against its own backend endpoint (matching the router:
 * PATCH /settings/profile, PUT /settings/links, POST/DELETE /settings/logo,
 * POST/DELETE /settings/payment-qr) rather than one big form-wide save.
 *
 * Email is intentionally read-only here -- it's the login identity for both
 * OTP and Google, so changing it needs its own re-verification flow, not a
 * plain settings field (see backend router notes).
 *
 * File uploads (logo/QR) bypass apiRequest() via a local uploadFile() helper:
 * apiRequest always forces Content-Type: application/json, which breaks
 * multipart/form-data uploads (the browser needs to set its own boundary).
 *
 * Visual language matches ConversationHistory.tsx: #E5E5E0 hairlines,
 * #0B0F19 ink, #6B6F76 secondary text, #2B4EFF accent, rounded-2xl/rounded-xl
 * cards. Fully responsive: single column on mobile, two-column grid from lg+.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  HiOutlineBuildingOffice2,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineLink,
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineQrCode,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineUser,
} from "react-icons/hi2";
import apiRequest from "../lib/apiReq";
import { authStore } from "../lib/authStore";
import QRCode from "react-qr-code";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* -------------------------------------------------------------------------
 * Types (mirror app/schemas/settings.py field-for-field)
 * ---------------------------------------------------------------------- */

interface BusinessLink {
  platform: string;
  url: string;
  label: string | null;
}

interface UsageInfo {
  ai_credits_used: number;
  ai_credits_limit: number;
  email_used: number;
  email_limit: number;
  ai_voice_agents_used_min: number;
  ai_voice_agents_limit_min: number;
  storage_used_mb: number;
  storage_limit_mb: number;
  embedding_tokens_used: number;
  embedding_token_limit: number;
}

interface SettingsData {
  id: string;
  business_name: string | null;
  business_category: string | null;
  email: string;
  contact_number: string | null;
  logo: string | null;
  slug: string | null;
  payment_qr_image: string | null;
  profile_completed: boolean;
  is_configured: boolean;
  business_links: BusinessLink[];
  usage: UsageInfo | null;
  created_at: string;
}

type Feedback = { type: "success" | "error"; text: string };

/* -------------------------------------------------------------------------
 * Raw-fetch upload helper (see file header for why apiRequest won't work here)
 * ---------------------------------------------------------------------- */

async function uploadFile(endpoint: string, formData: FormData): Promise<SettingsData> {
  const token = authStore.getToken();
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Upload failed");
  }
  return res.json();
}

/* -------------------------------------------------------------------------
 * Small local primitives
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
          <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#0B0F19]">
            {title}
          </h2>
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

/* =========================================================================
 * Top-level view
 * ====================================================================== */

export default function Settings() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoadError(null);
    try {
      const result = (await apiRequest("/settings")) as SettingsData;
      setData(result);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Couldn't load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (loading) {
    return <p className="py-10 text-center text-sm text-[#6B6F76]">Loading settings…</p>;
  }

  if (loadError || !data) {
    return <InlineMessage type="error" text={loadError || "Something went wrong."} />;
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <HeaderBar data={data} />

      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
        <ProfileSection data={data} onUpdated={setData} />
        <BrandingSection data={data} onUpdated={setData} />
        <BusinessLinksSection data={data} onUpdated={setData} />
        <SlugSection data={data} onUpdated={setData} />

        <UsageSection data={data} />
                <ShareQrSection data={data} />
      </div>

      <ThemeSection />
    </div>
  );
}
/* ------------------------------------------------------------------------
 * Share QR: public chat link as a scannable/downloadable QR code
 * --------------------------------------------------------------------- */
const FRONTEND_BASE_URL = process.env.NEXT_PUBLIC_FRONTED_BASE_URL;
function ShareQrSection({ data }: { data: SettingsData }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<Feedback | null>(null);

  if (!FRONTEND_BASE_URL) {
    return (
      <SectionCard title="Share your chatbot" icon={<HiOutlineQrCode size={16} />}>
        <InlineMessage
          type="error"
          text="Missing NEXT_PUBLIC_FRONTED_BASE_URL environment variable."
        />
      </SectionCard>
    );
  }

  const chatUrl = `${FRONTEND_BASE_URL.replace(/\/$/, "")}/chat/${data.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chatUrl);
      setMessage({ type: "success", text: "Link copied." });
    } catch {
      setMessage({ type: "error", text: "Couldn't copy link." });
    }
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) {
      setMessage({ type: "error", text: "QR code isn't ready yet." });
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scale = 4;
      const padding = 32;
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = (size + padding * 2) * scale;
      canvas.height = (size + padding * 2) * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setMessage({ type: "error", text: "Couldn't generate image." });
        URL.revokeObjectURL(url);
        return;
      }

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, padding * scale, padding * scale, size * scale, size * scale);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${data.slug}-qr.png`;
        link.click();
        URL.revokeObjectURL(link.href);
      }, "image/png");
    };
    img.onerror = () => {
      setMessage({ type: "error", text: "Couldn't generate image." });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <SectionCard title="Share your chatbot" icon={<HiOutlineQrCode size={16} />}>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div
          ref={qrRef}
          className="flex shrink-0 items-center justify-center rounded-xl border border-[#E5E5E0] bg-white p-4"
        >
          <QRCode value={chatUrl} size={160} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            <label className={labelClass}>Chat link</label>
            <p className="truncate rounded-xl border border-[#E5E5E0] bg-[#F4F4F1] px-3.5 py-2.5 text-xs text-[#0B0F19]">
              {chatUrl}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-xl border border-[#E5E5E0] bg-white px-3.5 py-2 text-xs font-medium transition-colors hover:bg-[#F5F5F3]"
            >
              Copy link
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-xl bg-[#2B4EFF] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#1E3ADE]"
            >
              Download QR
            </button>
          </div>

          {message && <InlineMessage type={message.type} text={message.text} />}
        </div>
      </div>
    </SectionCard>
  );
}
/* ------------------------------------------------------------------------
 * Slug section
 * --------------------------------------------------------------------- */
function SlugSection({
  data,
  onUpdated,
}: {
  data: SettingsData;
  onUpdated: (d: SettingsData) => void;
}) {
  const [slug, setSlug] = useState(data.slug || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Feedback | null>(null);

  const handleSave = async () => {
    if (!slug.trim() || slug === data.slug) return;

    const confirmed = window.confirm(
      "Changing your chat link will break any QR codes or links you've already shared -- " +
        "they'll stop working. It may also reset any SEO ranking your current link has built up. " +
        "Continue?"
    );
    if (!confirmed) return;

    setSaving(true);
    setMessage(null);
    try {
      const updated = (await apiRequest("/settings/slug", {
        method: "PATCH",
        body: JSON.stringify({ slug }),
      })) as SettingsData;
      onUpdated(updated);
      setSlug(updated.slug || "");
      setMessage({ type: "success", text: "Chat link updated." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Couldn't update link." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Chat link (URL)" icon={<HiOutlineLink size={16} />}>
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelClass}>Slug</label>
          <input
            className={inputClass}
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            placeholder="your-business-name"
            disabled
          />
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
          <HiOutlineExclamationTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            (Currently unable to change) Changing this breaks any QR codes or links you&apos;ve already shared — they&apos;ll stop
            working — and may reset the SEO ranking your current link has built up. Only change it if
            you&apos;re sure.
          </span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !slug.trim() || slug === data.slug}
          className="self-start rounded-xl bg-[#2B4EFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1E3ADE] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Update chat link"}
        </button>

        {message && <InlineMessage type={message.type} text={message.text} />}
      </div>
    </SectionCard>
  );
}
/* ------------------------------------------------------------------------
 * Header: logo + business name + status badges at a glance
 * --------------------------------------------------------------------- */

function HeaderBar({ data }: { data: SettingsData }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E5E0] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E5E0] bg-[#F4F4F1]">
          {data.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logo} alt="Logo" className="h-full w-full object-cover" />
          ) : (
            <HiOutlineBuildingOffice2 size={20} className="text-[#B9BAB6]" />
          )}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-[family-name:var(--font-display)] text-lg font-semibold text-[#0B0F19]">
            {data.business_name || "Your business"}
          </h1>
          <p className="truncate text-xs text-[#6B6F76]">{data.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            data.profile_completed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {data.profile_completed ? (
            <HiOutlineCheckCircle size={13} />
          ) : (
            <HiOutlineExclamationTriangle size={13} />
          )}
          {data.profile_completed ? "Profile complete" : "Profile incomplete"}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            data.is_configured ? "bg-emerald-50 text-emerald-700" : "bg-[#F4F4F1] text-[#6B6F76]"
          }`}
        >
          {data.is_configured ? "Chatbot live" : "Not yet live"}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------
 * Profile
 * --------------------------------------------------------------------- */

function ProfileSection({
  data,
  onUpdated,
}: {
  data: SettingsData;
  onUpdated: (d: SettingsData) => void;
}) {
  const [businessName, setBusinessName] = useState(data.business_name || "");
  const [businessCategory, setBusinessCategory] = useState(data.business_category || "");
  const [contactNumber, setContactNumber] = useState(
  data.contact_number || ""
);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Feedback | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload: Record<string, unknown> = {
        business_name: businessName,
        business_category: businessCategory,
      };
      if (contactNumber.trim()) {
    if (!/^\d+$/.test(contactNumber)) {
        throw new Error("Contact number must be numeric.");
    }

    payload.contact_number = contactNumber;
}
      const updated = (await apiRequest("/settings/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      })) as SettingsData;
      onUpdated(updated);
      setMessage({ type: "success", text: "Profile updated." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Couldn't save profile." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Business profile" icon={<HiOutlineUser size={16} />}>
      <div className="flex flex-col gap-4">
        <div>
          <label className={labelClass}>Business name</label>
          <input
            className={inputClass}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Sunrise Realty"
          />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <input
            className={inputClass}
            value={businessCategory}
            onChange={(e) => setBusinessCategory(e.target.value)}
            placeholder="e.g. Real estate, Restaurant, Clinic"
          />
        </div>

        <div>
          <label className={labelClass}>Contact number</label>
          <input
            className={inputClass}
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="e.g. 9876543210"
            inputMode="numeric"
          />
        </div>

        <div>
          <label className={labelClass}>
            Email <span className="text-[#B9BAB6]">— your login, can&apos;t be changed here</span>
          </label>
          <input
            className={`${inputClass} cursor-not-allowed bg-[#F4F4F1] text-[#6B6F76]`}
            value={data.email}
            disabled
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="self-start rounded-xl bg-[#2B4EFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1E3ADE] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>

        {message && <InlineMessage type={message.type} text={message.text} />}
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------------
 * Branding: logo + payment QR
 * --------------------------------------------------------------------- */

function ImageUploadRow({
  label,
  icon,
  imageUrl,
  uploadEndpoint,
  deleteEndpoint,
  onUpdated,
}: {
  label: string;
  icon: ReactNode;
  imageUrl: string | null;
  uploadEndpoint: string;
  deleteEndpoint: string;
  onUpdated: (d: SettingsData) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Feedback | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const updated = await uploadFile(uploadEndpoint, formData);
      onUpdated(updated);
      setMessage({ type: "success", text: `${label} updated.` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const updated = (await apiRequest(deleteEndpoint, { method: "DELETE" })) as SettingsData;
      onUpdated(updated);
      setMessage({ type: "success", text: `${label} removed.` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Couldn't remove image." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className={labelClass}>{label}</label>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E5E0] bg-[#F4F4F1]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={label} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[#B9BAB6]">{icon}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-xl border border-[#E5E5E0] bg-white px-3.5 py-2 text-xs font-medium transition-colors hover:bg-[#F5F5F3] disabled:opacity-50"
          >
            {busy ? "Working…" : imageUrl ? "Replace" : "Upload"}
          </button>
          {imageUrl && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="rounded-xl border border-[#E5E5E0] bg-white px-3.5 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      {message && <InlineMessage type={message.type} text={message.text} />}
    </div>
  );
}

function BrandingSection({
  data,
  onUpdated,
}: {
  data: SettingsData;
  onUpdated: (d: SettingsData) => void;
}) {
  return (
    <SectionCard title="Branding" icon={<HiOutlinePhoto size={16} />}>
      <div className="flex flex-col gap-5">
        <ImageUploadRow
          label="Logo"
          icon={<HiOutlineBuildingOffice2 size={20} />}
          imageUrl={data.logo}
          uploadEndpoint="/settings/logo"
          deleteEndpoint="/settings/logo"
          onUpdated={onUpdated}
        />
        <ImageUploadRow
          label="Payment QR code"
          icon={<HiOutlineQrCode size={20} />}
          imageUrl={data.payment_qr_image}
          uploadEndpoint="/settings/payment-qr"
          deleteEndpoint="/settings/payment-qr"
          onUpdated={onUpdated}
        />
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------------
 * Business links: dynamic rows, full-replace save (PUT)
 * --------------------------------------------------------------------- */

function BusinessLinksSection({
  data,
  onUpdated,
}: {
  data: SettingsData;
  onUpdated: (d: SettingsData) => void;
}) {
  const [links, setLinks] = useState<BusinessLink[]>(data.business_links);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Feedback | null>(null);

  const updateLink = (idx: number, field: keyof BusinessLink, value: string) => {
    setLinks((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const addLink = () => setLinks((prev) => [...prev, { platform: "", url: "", label: "" }]);
  const removeLink = (idx: number) => setLinks((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const cleaned = links
        .filter((l) => l.platform.trim() && l.url.trim())
        .map((l) => ({ platform: l.platform.trim(), url: l.url.trim(), label: l.label?.trim() || null }));
      const updated = (await apiRequest("/settings/links", {
        method: "PUT",
        body: JSON.stringify({ links: cleaned }),
      })) as SettingsData;
      onUpdated(updated);
      setLinks(updated.business_links);
      setMessage({ type: "success", text: "Links updated." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Couldn't save links." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Business links" icon={<HiOutlineLink size={16} />}>
      <div className="flex flex-col gap-3">
        {links.length === 0 && (
          <p className="text-xs text-[#6B6F76]">
            No links yet — add Instagram, WhatsApp, your menu, a booking page, anything the bot should be
            able to share.
          </p>
        )}

        {links.map((link, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-2 rounded-xl border border-[#E5E5E0] p-3 sm:flex-row sm:items-center"
          >
            <input
              className={`${inputClass} sm:w-28`}
              placeholder="platform"
              value={link.platform}
              onChange={(e) => updateLink(idx, "platform", e.target.value)}
            />
            <input
              className={`${inputClass} flex-1`}
              placeholder="https://..."
              value={link.url}
              onChange={(e) => updateLink(idx, "url", e.target.value)}
            />
            <input
              className={`${inputClass} sm:w-36`}
              placeholder="label (optional)"
              value={link.label || ""}
              onChange={(e) => updateLink(idx, "label", e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeLink(idx)}
              className="flex shrink-0 items-center justify-center rounded-xl border border-[#E5E5E0] p-2.5 text-rose-500 transition-colors hover:bg-rose-50 sm:self-stretch"
              aria-label="Remove link"
            >
              <HiOutlineTrash size={15} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addLink}
          className="flex items-center justify-center gap-1.5 self-start rounded-xl border border-dashed border-[#E5E5E0] px-3.5 py-2 text-xs font-medium text-[#6B6F76] transition-colors hover:bg-black/[0.02]"
        >
          <HiOutlinePlus size={14} /> Add link
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="self-start rounded-xl bg-[#2B4EFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1E3ADE] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save links"}
        </button>

        {message && <InlineMessage type={message.type} text={message.text} />}
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------------
 * Usage: read-only
 * --------------------------------------------------------------------- */

function UsageBar({
  used,
  limit,
  label,
  formatValue = (n: number) => n.toLocaleString(),
}: {
  used: number;
  limit: number;
  label: string;
  formatValue?: (n: number) => string;
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-[#6B6F76]">{label}</span>
        <span className="font-medium text-[#0B0F19]">
          {formatValue(used)} / {formatValue(limit)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F4F4F1]">
        <div
          className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-rose-500" : "bg-[#2B4EFF]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function UsageSection({ data }: { data: SettingsData }) {
  if (!data.usage) {
    return (
      <SectionCard title="Usage" icon={<HiOutlineSparkles size={16} />}>
        <p className="text-xs text-[#6B6F76]">Usage data isn&apos;t available yet.</p>
      </SectionCard>
    );
  }

  const u = data.usage;

  return (
    <SectionCard title="Usage" icon={<HiOutlineSparkles size={16} />}>
<div className="flex flex-col gap-4">
        <UsageBar used={u.embedding_tokens_used} limit={u.embedding_token_limit} label="Knowledge base tokens" />

        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
          <div className="rounded-xl bg-[#F4F4F1] p-3">
            <p className="text-[#6B6F76]">AI credits</p>
            <p className="mt-0.5 font-[family-name:var(--font-display)] text-base font-semibold text-[#0B0F19]">
              {u.ai_credits_used.toLocaleString()} / {u.ai_credits_limit.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-[#F4F4F1] p-3">
            <p className="text-[#6B6F76]">Emails left</p>
            <p className="mt-0.5 font-[family-name:var(--font-display)] text-base font-semibold text-[#0B0F19]">
              {u.email_used.toLocaleString()} / {u.email_limit.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-[#F4F4F1] p-3">
            <p className="text-[#6B6F76]">Voice minutes</p>
            <p className="mt-0.5 font-[family-name:var(--font-display)] text-base font-semibold text-[#0B0F19]">
              {u.ai_voice_agents_used_min.toLocaleString()} / {u.ai_voice_agents_limit_min.toLocaleString()}
            </p>
          </div>
        </div>

        <p className="text-[10px] text-[#B9BAB6]">
          Storage used: {u.storage_used_mb.toFixed(1)} / {u.storage_limit_mb.toFixed(1)} MB
        </p>
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------------
 * Theme: disabled placeholder, coming soon
 * --------------------------------------------------------------------- */

function ThemeSection() {
  const swatches = ["#2B4EFF", "#0B0F19", "#16A34A", "#F5A623", "#DC2626"];

  return (
    <div className="rounded-2xl border border-dashed border-[#E5E5E0] bg-white p-5 opacity-70 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#B9BAB6]">
            <HiOutlineSparkles size={16} />
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#0B0F19]">
            Theme
          </h2>
        </div>
        <span className="rounded-full bg-[#F4F4F1] px-2.5 py-1 text-[10px] font-medium text-[#6B6F76]">
          Coming soon
        </span>
      </div>

      <p className="mb-4 text-xs text-[#6B6F76]">
        Customize your chat widget&apos;s colors and font to match your brand. Not available yet.
      </p>

      <div className="flex flex-wrap gap-2">
        {swatches.map((color) => (
          <span
            key={color}
            className="h-8 w-8 shrink-0 rounded-lg border border-black/5"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}