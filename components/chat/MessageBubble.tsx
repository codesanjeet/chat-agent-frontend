"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineFlag, HiOutlineFolder } from "react-icons/hi2";
import {
  FiAlertCircle,
  FiArrowUpRight,
  FiCheck,
  FiExternalLink,
  FiFacebook,
  FiInstagram,
  FiLink,
  FiLoader,
  FiYoutube,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import type { GalleryItemRef, LeadFormRef, LinkRef, ThreadMessage } from "@/components/lib/chat";
import PaymentStep from "./PaymentStep";

/* ---------------------------------------------------------------------
 * Typing indicator -- three bouncing dots, shown in place of the
 * assistant's next bubble while a request is in flight.
 * ------------------------------------------------------------------- */

export function TypingIndicator({ accentColor }: { accentColor: string }) {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-black/[0.06] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: accentColor }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
 * Link chips -- already a list, unchanged from before. Never blocks
 * rendering on an unrecognized platform string.
 * ------------------------------------------------------------------- */

function iconFor(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("instagram")) return FiInstagram;
  if (p.includes("facebook")) return FiFacebook;
  if (p.includes("youtube")) return FiYoutube;
  if (p.includes("whatsapp")) return FaWhatsapp;
  if (p.includes("website") || p.includes("site")) return FiExternalLink;
  return FiLink;
}

function LinkChips({ links, accentColor }: { links: LinkRef[]; accentColor: string }) {
  if (links.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {links.map((link, idx) => {
        const Icon = iconFor(link.platform);
        return (
          <a
            key={`${link.platform}-${idx}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:scale-[1.03] hover:shadow-sm"
            style={{ borderColor: `${accentColor}35`, color: accentColor }}
          >
            <Icon size={13} />
            {link.label || link.platform}
          </a>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------
 * Gallery row -- horizontal scroll of cards, images and/or folders
 * mixed, best match first (order as given). `title` is optional on
 * both item types now (was `name`, always present) -- render nothing
 * where there's no title rather than fall back to filename-style text.
 * ------------------------------------------------------------------- */

function GalleryImageCard({
  item,
  accentColor,
  onOpenGallery,
}: {
  item: GalleryItemRef;
  accentColor: string;
  onOpenGallery: (folderId: string | null) => void;
}) {
  return (
    <div className="w-44 shrink-0 overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image_url ?? ""}
        alt={item.title ?? ""}
        className="h-32 w-full object-cover"
        loading="lazy"
      />
      {(item.title || item.external_url || item.parent_folder) && (
        <div className="flex flex-col gap-1.5 p-2.5">
          {item.title && <p className="truncate text-xs font-medium text-[#0B0F19]">{item.title}</p>}

          {(item.external_url || item.parent_folder) && (
            <div className="flex flex-wrap items-center gap-2.5">
              {item.external_url && (
                <a
                  href={item.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: accentColor }}
                >
                  View more <FiArrowUpRight size={12} />
                </a>
              )}
              {item.parent_folder && (
                <button
                  type="button"
                  onClick={() => onOpenGallery(item.parent_folder!.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold underline-offset-2 hover:underline"
                  style={{ color: accentColor }}
                >
                  <HiOutlineFolder size={13} />
                  See all{item.parent_folder.title ? ` in ${item.parent_folder.title}` : ""}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GalleryFolderCard({
  item,
  accentColor,
  onOpenGallery,
}: {
  item: GalleryItemRef;
  accentColor: string;
  onOpenGallery: (folderId: string | null) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenGallery(item.item_id)}
      className="flex w-44 shrink-0 flex-col items-start gap-2 rounded-xl border border-black/[0.06] bg-white p-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform hover:scale-[1.02]"
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
      >
        <HiOutlineFolder size={18} />
      </span>
      <span className="truncate text-sm font-medium text-[#0B0F19]">
        {item.title ?? "Untitled folder"}
      </span>
    </button>
  );
}

function GalleryRow({
  items,
  accentColor,
  onOpenGallery,
}: {
  items: GalleryItemRef[] | undefined;
  accentColor: string;
  onOpenGallery: (folderId: string | null) => void;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-2 -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
      {items.map((item) =>
        item.item_type === "folder" ? (
          <GalleryFolderCard key={item.item_id} item={item} accentColor={accentColor} onOpenGallery={onOpenGallery} />
        ) : (
          <GalleryImageCard key={item.item_id} item={item} accentColor={accentColor} onOpenGallery={onOpenGallery} />
        )
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
 * Lead form -- inline dynamic form, rendered in the chat flow (not a
 * modal). Submitting flips it to a confirmation state in place.
 * Unchanged from before -- included here only because it lives in this
 * file, not because anything about it changed.
 * ------------------------------------------------------------------- */

function inputTypeFor(fieldType: string): string {
  const t = fieldType.toLowerCase();
  if (t === "number") return "number";
  if (t === "tel" || t === "phone") return "tel";
  if (t === "email") return "email";
  return "text"; // generic fallback
}

function LeadFormCard({
  leadForm,
  accentColor,
  submitted,
  onSubmit,
}: {
  leadForm: LeadFormRef;
  accentColor: string;
  submitted: boolean;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fields = leadForm.form_schema?.fields ?? [];
  const setField = (key: string, val: string) => setValues((prev) => ({ ...prev, [key]: val }));
  const missingRequired = fields.filter((f) => f.required && !values[f.key]?.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (missingRequired.length > 0) {
      setError(`Please fill in: ${missingRequired.map((f) => f.label).join(", ")}`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const data: Record<string, unknown> = {};
      for (const f of fields) {
        const raw = values[f.key];
        if (raw === undefined || raw === "") continue;
        data[f.key] = f.type.toLowerCase() === "number" ? Number(raw) : raw;
      }
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit that, try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700"
      >
        <FiCheck size={16} className="shrink-0" />
        <span>
          Thanks, we&apos;ll be in touch!
          {leadForm.requires_payment && (
            <span className="mt-0.5 block text-xs text-emerald-600">
              Payment will be verified separately -- we&apos;ll confirm once it&apos;s checked.
            </span>
          )}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="mt-2 flex flex-col gap-2.5 rounded-xl border border-black/[0.06] bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6F76]">{leadForm.name}</p>

      {fields.map((field) => (
        <label key={field.key} className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-[#0B0F19]">
            {field.label}
            {field.required && <span className="text-rose-500"> *</span>}
          </span>
          <input
            type={inputTypeFor(field.type)}
            value={values[field.key] ?? ""}
            onChange={(e) => setField(field.key, e.target.value)}
            placeholder={field.prompt}
            className="rounded-lg border border-black/[0.08] bg-[#FAFAF9] px-2.5 py-2 text-sm text-[#0B0F19] outline-none transition-colors focus:border-[var(--accent)] focus:bg-white"
            style={{ ["--accent" as string]: accentColor }}
          />
        </label>
      ))}

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)` }}
      >
        {submitting ? <FiLoader className="animate-spin" size={15} /> : "Submit"}
      </button>
    </motion.form>
  );
}

/* ---------------------------------------------------------------------
 * MessageBubble -- the actual exported component. Composes all of the
 * above depending on message.role and which optional fields are present.
 *
 * Payment step: once a lead is submitted AND the backend returned a
 * payment_qr_image on that submission (only happens when the triggered
 * form has requires_payment=true), PaymentStep renders right under the
 * "thanks" confirmation -- no separate fetch, the QR travels with the
 * submit response the whole way here via ThreadMessage.leadSubmission.
 * ------------------------------------------------------------------- */

export default function MessageBubble({
  message,
  accentColor,
  slug,
  apiBaseUrl,
  businessName,
  onSubmitLead,
  onOpenGallery,
}: {
  message: ThreadMessage;
  accentColor: string;
  slug: string;
  apiBaseUrl: string;
  businessName?: string;
  onSubmitLead: (data: Record<string, unknown>) => Promise<void>;
  onOpenGallery: (folderId: string | null) => void;
}) {
  if (message.role === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="flex justify-end">
        <div
          className="max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2.5 text-sm text-white shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
            opacity: message.failed ? 0.5 : 1,
          }}
        >
          {message.text}
        </div>
      </motion.div>
    );
  }

  if (message.role === "error") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
        <div className="flex max-w-[85%] items-start gap-2 rounded-2xl rounded-bl-sm border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
          <FiAlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{message.text}</span>
        </div>
      </motion.div>
    );
  }

  // assistant
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-black/[0.06] bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <p className="whitespace-pre-wrap text-sm text-[#0B0F19]">{message.text}</p>

        <GalleryRow items={message.galleryItems} accentColor={accentColor} onOpenGallery={onOpenGallery} />
        <LinkChips links={message.links} accentColor={accentColor} />

        {message.leadForm && (
          <>
            <LeadFormCard
              leadForm={message.leadForm}
              accentColor={accentColor}
              submitted={message.leadFormState === "submitted"}
              onSubmit={onSubmitLead}
            />

            {message.leadFormState === "submitted" && message.leadSubmission?.paymentQrImage && (
              <div className="mt-2">
                <PaymentStep
                  slug={slug}
                  leadId={message.leadSubmission.leadId}
                  apiBaseUrl={apiBaseUrl}
                  qrImage={message.leadSubmission.paymentQrImage}
                  businessName={businessName}
                  onDone={() => {
                    // no-op for now -- the card handles its own
                    // uploaded/skip state internally
                  }}
                />
              </div>
            )}
          </>
        )}

        {message.escalated && (
          <p className="mt-2 flex items-center gap-1 text-[11px] text-[#6B6F76]">
            <HiOutlineFlag size={11} />
            I&apos;ve flagged this for the team — they may follow up.
          </p>
        )}
      </div>
    </motion.div>
  );
}