"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiAlertCircle,
  FiArrowRight,
  FiLoader,
  FiUpload,
  FiX,
} from "react-icons/fi";
import {
  HiOutlineBuildingOffice2,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChevronDown,
  HiOutlineLink,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { fetchCurrentUser } from "@/components/lib/authServices";
import { completeProfile, uploadLogo, acceptAgreement } from "@/components/lib/Profileservices";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
});

const CATEGORIES = [
  "Real Estate & Property",
  "Retail & Shopping",
  "Restaurants & Food",
  "Home Services",
  "Healthcare & Wellness",
  "Education",
  "Other",
];

const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5MB, client-side sanity check only

// Display-only base for the "your chat link" preview -- adjust to the real
// public domain this app is served from.
const CHAT_LINK_BASE = "agent.kiteum.com/chat";

// Must match app/routers/legal.py::CURRENT_VERSIONS exactly. Bump both by
// hand whenever the static ToS/Privacy HTML changes meaningfully -- the
// backend independently enforces this version too, so a stale value here
// just means the accept call succeeds but complete_profile_endpoint still
// 403s, not a silent bypass.
const CURRENT_TOS_VERSION = "v1";
const CURRENT_PRIVACY_VERSION = "v1";

// Mirrors crud/user.py::_slugify exactly -- lowercase, any run of
// non-alphanumeric characters collapses to a single hyphen, leading/
// trailing hyphens stripped. Used both to auto-fill the slug from the
// business name and to normalize whatever the person types into the slug
// field directly, so what's shown always matches what the backend will
// actually store.
function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Guard = "checking" | "ready";
type Loading = "logo" | "submit" | null;

export default function ProfilePage() {
  const router = useRouter();

  const [guard, setGuard] = useState<Guard>("checking");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<Loading>(null);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  // Slug -- auto-fills from businessName until the person edits it
  // directly, at which point it becomes independent (see handleSlugChange).
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ---- Route guard: only people with an incomplete profile belong here ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await fetchCurrentUser();
        if (cancelled) return;
        if (user.profile_completed) {
          router.replace("/dashboard");
          return;
        }
        setGuard("ready");
      } catch {
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Auto-fill slug from business name -- stops the moment the person edits
  // the slug field themselves, so their manual edit is never overwritten
  // by continuing to type the business name.
  useEffect(() => {
    if (slugTouched) return;
    setSlug(slugify(businessName));
  }, [businessName, slugTouched]);

const handleSlugChange = (raw: string) => {
    setSlugTouched(true);
    // No live transformation -- let the person type freely (spaces,
    // hyphens, anything). We only normalize once, right before submit,
    // via slugify(). The backend independently slugifies too, so this
    // is just a client-side preview step, not the source of truth.
    setSlug(raw);
  };

  const nameValid = businessName.trim().length > 0;
  const categoryValid = category.length > 0;
  const slugValid = slugify(slug).length > 0;
  const canSubmit =
    nameValid && categoryValid && slugValid && agreed && loading === null;

  const handleLogoPick = () => fileInputRef.current?.click();

  const handleLogoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // allow re-picking the same file later
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Logo needs to be an image file.");
        return;
      }
      if (file.size > MAX_LOGO_BYTES) {
        setError("Logo is too large -- keep it under 5MB.");
        return;
      }

      setError(null);
      const localPreview = URL.createObjectURL(file);
      setLogoPreview(localPreview);
      setLoading("logo");
      try {
        const url = await uploadLogo(file);
        setLogoUrl(url);
      } catch (err: any) {
        setError(err?.message || "Couldn't upload the logo. Try again.");
        setLogoPreview(null);
      } finally {
        setLoading(null);
      }
    },
    []
  );

  const removeLogo = () => {
    setLogoUrl(null);
    setLogoPreview(null);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      setError(null);
      setLoading("submit");
      try {
        // Must succeed before the profile can be marked complete. The
        // backend independently re-checks both agreements exist at the
        // current version inside complete_profile_endpoint, so this isn't
        // the only gate -- it's just what avoids a doomed profile-complete
        // call when it's preventable client-side.
        await acceptAgreement("tos", CURRENT_TOS_VERSION);
        await acceptAgreement("privacy", CURRENT_PRIVACY_VERSION);

const user = await completeProfile({
          business_name: businessName.trim(),
          business_category: category,
          slug: slugify(slug),
        });
        router.replace("/dashboard");
      } catch (err: any) {
        setError(err?.message || "Couldn't save your profile. Try again.");
      } finally {
        setLoading(null);
      }
    },
    [canSubmit, businessName, category, logoUrl, slug, router]
  );

  if (guard === "checking") {
    return (
      <div
        className={`${body.variable} font-[family-name:var(--font-body)] min-h-screen w-full bg-[#FAFAF9] flex items-center justify-center`}
      >
        <FiLoader className="animate-spin text-[#6B6F76]" size={20} />
      </div>
    );
  }

  return (
    <div
      className={`${display.variable} ${body.variable} ${mono.variable} font-[family-name:var(--font-body)] min-h-screen w-full bg-[#FAFAF9] text-[#0B0F19] grid lg:grid-cols-2`}
    >
      {/* ---------------- Left: live agent-header preview (desktop only) ---------------- */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0B0F19] text-white px-14 py-12 relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#2B4EFF]/20 blur-3xl"
        />

        <div className="flex items-center gap-2 relative">
          <HiOutlineChatBubbleLeftRight size={22} className="text-[#2B4EFF]" />
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
            Kiteum.Agent
          </span>
        </div>

        <div className="relative">
          <p className="font-[family-name:var(--font-display)] text-[28px] leading-[1.15] font-medium max-w-sm mb-8">
            This is what your customers see the moment they open a chat.
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 max-w-sm">
            <AgentHeaderPreview
              name={businessName}
              category={category}
              logoPreview={logoPreview}
              uploading={loading === "logo"}
            />
            <div className="mt-4 rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-white/50 italic">
              Live preview -- updates as you fill in the form.
            </div>
          </div>
        </div>

        <div className="relative text-xs text-white/40">
          Step 1 of 2 -- profile, then a quick onboarding.
        </div>
      </div>

      {/* ---------------- Right: the form ---------------- */}
      <div
        className="flex flex-col justify-center px-5 py-8 sm:px-10 sm:py-12"
        style={{
          paddingTop: "max(2rem, env(safe-area-inset-top))",
          paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="mx-auto w-full max-w-[420px]">
          {/* Mobile-only compact preview. */}
          <div className="lg:hidden relative overflow-hidden rounded-2xl bg-[#0B0F19] text-white px-4 py-4 mb-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-10 -right-8 h-28 w-28 rounded-full bg-[#2B4EFF]/25 blur-2xl"
            />
            <div className="relative">
              <AgentHeaderPreview
                name={businessName}
                category={category}
                logoPreview={logoPreview}
                uploading={loading === "logo"}
                compact
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-semibold tracking-tight">
              Set up your business profile
            </h1>
            <p className="mt-2 text-sm text-[#6B6F76]">
              This is what powers your agent's replies -- name, category, and
              logo. You can change any of it later.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-5">
              {/* Logo */}
              <div>
                <label className="text-xs font-medium text-[#6B6F76]">
                  Logo <span className="text-[#B9BAB6]">(optional)</span>
                </label>
                <div className="mt-1.5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleLogoPick}
                    disabled={loading === "logo"}
                    className="relative h-16 w-16 shrink-0 rounded-xl border border-dashed border-[#E5E5E0] bg-white flex items-center justify-center overflow-hidden hover:border-[#2B4EFF] transition-colors disabled:opacity-60"
                  >
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FiUpload size={18} className="text-[#B9BAB6]" />
                    )}
                    {loading === "logo" && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <FiLoader className="animate-spin text-[#2B4EFF]" size={16} />
                      </div>
                    )}
                  </button>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={handleLogoPick}
                      disabled={loading === "logo"}
                      className="text-xs font-medium text-[#2B4EFF] text-left disabled:opacity-60"
                    >
                      {logoPreview ? "Replace" : "Upload an image"}
                    </button>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={removeLogo}
                        disabled={loading === "logo"}
                        className="text-xs text-[#6B6F76] hover:text-[#0B0F19] flex items-center gap-1 text-left disabled:opacity-60"
                      >
                        <FiX size={12} /> Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Business name */}
              <div>
                <label className="text-xs font-medium text-[#6B6F76]">
                  Business name
                </label>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#E5E5E0] bg-white px-3.5 py-2.5 focus-within:border-[#2B4EFF] transition-colors">
                  <HiOutlineBuildingOffice2 size={16} className="text-[#6B6F76]" />
                  <input
                    type="text"
                    autoComplete="organization"
                    placeholder="e.g. Sunrise Properties"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[#B9BAB6]"
                  />
                </div>
              </div>

              {/* Slug -- editable, auto-filled from business name until touched */}
              <div>
                <label className="text-xs font-medium text-[#6B6F76]">
                  Your chat link
                </label>
                <div className="mt-1.5 flex items-center gap-1.5 rounded-xl border border-[#E5E5E0] bg-white px-3.5 py-2.5 focus-within:border-[#2B4EFF] transition-colors">
                  <HiOutlineLink size={16} className="shrink-0 text-[#6B6F76]" />
                  <span className="shrink-0 text-sm text-[#B9BAB6] font-[family-name:var(--font-mono)]">
                    {CHAT_LINK_BASE}/
                  </span>
<input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="your-business-name"
                    className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#B9BAB6] font-[family-name:var(--font-mono)] text-[#0B0F19]"
                  />
                </div>
                {slug.trim() && slugify(slug) !== slug.trim() && (
                  <p className="mt-1 text-[11px] text-[#6B6F76]">
                    Will be saved as:{" "}
                    <span className="font-[family-name:var(--font-mono)] text-[#0B0F19]">
                      {slugify(slug) || "—"}
                    </span>
                  </p>
                )}
                <div className="mt-1.5 flex items-start gap-1.5 text-xs text-[#8A5A00]">
                  <HiOutlineExclamationTriangle size={13} className="mt-0.5 shrink-0" />
                  <span>
                    This is the link your customers will use. Try to get it
                    right now — if you change it later, links you've already
                    shared will stop working. If your business name's taken,
                    try adding your city or a number (e.g.
                    my-business-new-delhi).
                  </span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-medium text-[#6B6F76]">
                  Category
                </label>
                <div className="mt-1.5 relative rounded-xl border border-[#E5E5E0] bg-white px-3.5 py-2.5 focus-within:border-[#2B4EFF] transition-colors">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none bg-transparent text-sm outline-none pr-6 text-[#0B0F19] disabled:text-[#B9BAB6]"
                  >
                    <option value="" disabled>
                      Choose one
                    </option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <HiOutlineChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6F76]"
                  />
                </div>
              </div>

              {/* Terms agreement -- required, gates canSubmit */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#E5E5E0] text-[#2B4EFF] focus:ring-[#2B4EFF]"
                />
                <label htmlFor="agree-terms" className="text-xs text-[#6B6F76]">
                  I agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2B4EFF] underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2B4EFF] underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2B4EFF] py-2.5 text-sm font-medium text-white hover:bg-[#1E3ADE] transition-colors disabled:opacity-40 disabled:hover:bg-[#2B4EFF]"
              >
                {loading === "submit" ? (
                  <FiLoader className="animate-spin" size={16} />
                ) : (
                  <>
                    Save & continue <FiArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex items-start gap-2 rounded-xl bg-[#F5A623]/10 px-3.5 py-2.5 text-xs text-[#8A5A00]"
                >
                  <FiAlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Signature element: a live preview of the chat header a customer would see,
// reacting to the form as it's filled in. Shared between the desktop panel
// (full size) and the mobile strip (compact).
// ---------------------------------------------------------------------------

function AgentHeaderPreview({
  name,
  category,
  logoPreview,
  uploading,
  compact = false,
}: {
  name: string;
  category: string;
  logoPreview: string | null;
  uploading: boolean;
  compact?: boolean;
}) {
  const displayName = name.trim() || "Your business";
  const displayCategory = category || "Category";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl bg-[#2B4EFF] text-white ${
        compact ? "px-3 py-2.5" : "px-4 py-3.5"
      }`}
    >
      <div
        className={`relative shrink-0 rounded-full bg-white/15 flex items-center justify-center overflow-hidden ${
          compact ? "h-8 w-8" : "h-10 w-10"
        }`}
      >
        {logoPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoPreview} alt="" className="h-full w-full object-cover" />
        ) : (
          <HiOutlineBuildingOffice2 size={compact ? 15 : 18} className="text-white/70" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-[#2B4EFF]/60 flex items-center justify-center">
            <FiLoader className="animate-spin" size={compact ? 11 : 13} />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p
          className={`font-[family-name:var(--font-display)] font-medium truncate ${
            compact ? "text-[13px]" : "text-[15px]"
          }`}
        >
          {displayName}
        </p>
        <p
          className={`text-white/60 truncate ${
            compact ? "text-[10px]" : "text-[11px]"
          }`}
        >
          {displayCategory}
        </p>
      </div>
    </div>
  );
}