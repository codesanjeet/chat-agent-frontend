"use client";

/**
 * PaymentStep.tsx
 *
 * Shown right after a lead form submits successfully, only when the
 * returned lead has payment_status === "pending" AND a payment_qr_image
 * was returned (i.e. that form requires payment). The QR comes straight
 * from the /leads/{slug}/submit response now -- no separate fetch needed.
 */

import { useRef, useState } from "react";

interface PaymentStepProps {
  slug: string;
  leadId: string;
  apiBaseUrl: string;
  qrImage: string;
  businessName?: string | null;
  onDone: () => void; // called whether they upload or skip
}

export default function PaymentStep({ slug, leadId, apiBaseUrl, qrImage, businessName, onDone }: PaymentStepProps) {
  const [uploaded, setUploaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${apiBaseUrl}/leads/${slug}/${leadId}/payment-proof`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Upload failed");
      }
      setUploaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E5E0] bg-white p-4 text-sm">
      <p className="font-medium text-[#0B0F19]">
        {businessName ? `Complete payment to ${businessName}` : "Complete payment"}
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrImage} alt="Payment QR" className="mx-auto h-40 w-40 rounded-xl border border-[#E5E5E0] object-cover" />

      {!uploaded ? (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-xl bg-[#2B4EFF] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "Uploading…" : "Upload payment screenshot"}
          </button>
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
        </>
      ) : (
        <p className="text-xs text-emerald-700">Screenshot received — thanks!</p>
      )}

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <p className="text-xs text-[#6B6F76]">
        {uploaded
          ? "We'll verify it shortly and follow up with you."
          : "Haven't paid yet? No problem — your submission is already saved. If we don't see payment come through, our team will follow up with you directly."}
      </p>

      <button type="button" onClick={onDone} className="self-start text-xs font-medium text-[#6B6F76] underline">
        {uploaded ? "Done" : "I'll do this later"}
      </button>
    </div>
  );
}