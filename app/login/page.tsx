"use client";

/**
 * /login
 *
 * UI is the "brand panel + live demo" version (unchanged visual design).
 * Auth handling is delegated entirely to `@/components/lib/authServices`
 * (requestOtp / verifyOtp / googleLogin) instead of hand-rolled fetch()
 * calls -- that service layer owns request/response shape, headers, and
 * whatever cookie/localStorage token handling it does internally, so this
 * component no longer touches localStorage or the access token directly.
 *
 * `verifyOtp` / `googleLogin` already unwrap the backend's `TokenResponse`
 * (`{ access_token, token_type, user }`) for us -- they resolve directly with
 * the trimmed `UserOut` shape: `{ id, email, profile_completed,
 * is_configured }`. The access token itself is stashed into `authStore`
 * inside the service layer, never exposed here. Business profile fields
 * (business_name, category, logo) are NOT part of this response -- those
 * live behind the profile router and are fetched/edited there, not here.
 * This page only reads `profile_completed` off the resolved user to decide
 * where to send a person after they log in.
 *
 * Google sign-in uses `@react-oauth/google`'s <GoogleLogin> under the hood,
 * rendered invisible but positioned exactly on top of the custom-styled
 * "Continue with Google" button, so the real click event (a trusted user
 * gesture) lands on Google's actual button. A synthetic `.click()` forwarded
 * from a hidden button does NOT work here -- Google's popup flow requires a
 * real, trusted click, so this overlay approach replaces that earlier trick.
 * This assumes a <GoogleOAuthProvider> is set up higher in the tree
 * (e.g. in the root layout).
 *
 * Desktop (lg+): split layout -- brand panel with the live demo on the
 * left, form on the right.
 * Mobile (<lg): compact brand + rotating-demo-line strip above the form.
 */

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiAlertCircle,
  FiArrowRight,
  FiLoader,
  FiMail,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import {
  HiOutlineBuildingOffice2,
  HiOutlineChatBubbleLeftRight,
  HiOutlinePhoto,
  HiOutlineUser,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { requestOtp, verifyOtp, googleLogin } from "@/components/lib/authServices";

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

// Must match app/core/security.py::OTP_RESEND_COOLDOWN_SECONDS on the
// backend -- this is only the UI countdown, the backend enforces the real
// limit regardless. (Double-check this value against your current backend;
// the two source files disagreed on it.)
const RESEND_COOLDOWN = 60;

type Step = "email" | "otp";
type Loading = "otp" | "verify" | "google" | null;

// Mirrors the backend's trimmed UserOut (app/schemas/user_auth.py). No
// business_name/business_category/logo here -- those are profile-router
// concerns, fetched separately after login.
//
// Note: authServices already unwraps the backend's TokenResponse for us --
// verifyOtp/googleLogin resolve directly with this shape (the access token
// itself is stashed into authStore inside the service layer), so this page
// only ever deals with the user, never the raw TokenResponse envelope.
type AuthUser = {
  id: string;
  email: string;
  profile_completed: boolean;
  is_configured: boolean;
};

// ---------------------------------------------------------------------------
// Signature element: a looping demo of the actual product -- text reply,
// image reply, gallery link, escalation to admin. Used in full on desktop,
// and as a lightweight rotating one-liner on mobile (see MobileDemoTicker).
// ---------------------------------------------------------------------------

type DemoMsg = {
  from: "user" | "bot";
  text: string;
  icon?: "image" | "link" | "flag";
};

const DEMO_SCRIPT: DemoMsg[] = [
  { from: "user", text: "Do you have this in a 2BHK, under 80L?" },
  { from: "bot", text: "Yes — here's one that matches, with photos.", icon: "image" },
  { from: "user", text: "Can I see more listings like it?" },
  { from: "bot", text: "View the full gallery →", icon: "link" },
  { from: "user", text: "Can you hold it for 3 days without booking?" },
  { from: "bot", text: "Good question — flagged for the team, back shortly.", icon: "flag" },
];

function ConversationDemo() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    let i = 0;
    let dir: "growing" | "holding" | "resetting" = "growing";
    const tick = () => {
      if (dir === "growing") {
        i += 1;
        setVisible(i);
        if (i >= DEMO_SCRIPT.length) {
          dir = "holding";
          setTimeout(() => {
            dir = "resetting";
            setVisible(0);
            i = 0;
            setTimeout(() => {
              dir = "growing";
            }, 500);
          }, 1600);
        }
      }
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-2.5 min-h-[280px] justify-end">
      <AnimatePresence initial={false}>
        {DEMO_SCRIPT.slice(0, visible).map((m, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug flex items-center gap-2 ${
                m.from === "user"
                  ? "bg-white/10 text-white/90 rounded-br-sm"
                  : "bg-[#2B4EFF] text-white rounded-bl-sm"
              }`}
            >
              {m.icon === "image" && (
                <HiOutlinePhoto className="shrink-0 text-white/80" size={16} />
              )}
              {m.icon === "flag" && (
                <span className="shrink-0 rounded-full bg-[#F5A623] text-[#0B0F19] text-[10px] font-[family-name:var(--font-mono)] px-1.5 py-0.5">
                  admin
                </span>
              )}
              <span>{m.text}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile-only: a compact rotating one-liner instead of the full chat demo.
// ---------------------------------------------------------------------------

function MobileDemoTicker() {
  const botLines = DEMO_SCRIPT.filter((m) => m.from === "bot").map((m) => m.text);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % botLines.length), 2400);
    return () => clearInterval(id);
  }, [botLines.length]);

  return (
    <div className="relative h-5 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute inset-0 text-[12px] leading-5 text-[#8FA0FF] font-[family-name:var(--font-mono)] truncate"
        >
          "{botLines[idx]}"
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState<Loading>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Where a person lands after a successful login depends on whether their
  // profile is done. `redirect` query param (if present) always wins -- e.g.
  // someone was bounced here from a protected page and should go back to it,
  // as long as they've actually completed onboarding. A brand-new user (or
  // one who never finished profile setup) always goes to /onboarding first,
  // regardless of `redirect`, so they can't skip past a required step.
  const doRedirect = useCallback(
    (user: AuthUser) => {
      if (!user.profile_completed) {
        router.replace("onboarding");
        return;
      }
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.replace(redirectTo);
    },
    [router, searchParams]
  );

  const requestCode = useCallback(
    async (isResend: boolean) => {
      if (!emailValid || cooldown > 0) return;
      setError(null);
      setLoading("otp");
      try {
        await requestOtp(email.trim());
        setStep("otp");
        setCooldown(RESEND_COOLDOWN);
        if (isResend) {
          setDigits(Array(6).fill(""));
          inputRefs.current[0]?.focus();
        }
      } catch (err: any) {
        setError(err?.message || "Couldn't send the code. Try again.");
      } finally {
        setLoading(null);
      }
    },
    [email, emailValid, cooldown]
  );

  const submitCode = useCallback(async () => {
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Enter all 6 digits.");
      return;
    }
    setError(null);
    setLoading("verify");
    try {
      // verifyOtp already resolves with the unwrapped user (UserOut), not
      // the raw TokenResponse envelope -- the access token is handled
      // internally by the service layer (authStore), so we just pass the
      // user straight through.
      const user = await verifyOtp(email.trim(), code);
      doRedirect(user);
    } catch (err: any) {
      setError(err?.message || "Incorrect code. Try again.");
    } finally {
      setLoading(null);
    }
  }, [digits, email, doRedirect]);

  const handleGoogleCredential = useCallback(
    async (response: CredentialResponse) => {
      setError(null);
      setLoading("google");
      try {
        if (!response.credential) {
          throw new Error("Google did not return a credential.");
        }
        // Same as verifyOtp above: googleLogin resolves with the unwrapped
        // user, not the raw TokenResponse.
        const user = await googleLogin(response.credential);
        doRedirect(user);
      } catch (err: any) {
        setError(err?.message || "Google sign-in failed. Try again.");
      } finally {
        setLoading(null);
      }
    },
    [doRedirect]
  );

  const onDigitChange = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    setDigits((d) => {
      const next = [...d];
      next[idx] = clean;
      return next;
    });
    if (clean && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const onDigitKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const onDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    e.preventDefault();
    setDigits((d) => {
      const next = [...d];
      for (let i = 0; i < 6; i++) next[i] = paste[i] ?? "";
      return next;
    });
    inputRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  return (
    <div
      className={`${display.variable} ${body.variable} ${mono.variable} font-[family-name:var(--font-body)] min-h-screen w-full bg-[#FAFAF9] text-[#0B0F19] grid lg:grid-cols-2`}
    >
      {/* ---------------- Left: brand + live demo (desktop only) ---------------- */}
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
            One agent, trained on your data, that answers, shows, and points the way.
          </p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 max-w-sm">
            <ConversationDemo />
          </div>
        </div>

        <div className="relative flex items-center gap-2.5 text-xs text-white/50">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1">
            <HiOutlineUser size={13} /> Individual
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1">
            <HiOutlineUserGroup size={13} /> Growing team
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1">
            <HiOutlineBuildingOffice2 size={13} /> Enterprise
          </span>
        </div>
      </div>

      {/* ---------------- Right: the actual login form ---------------- */}
      <div
        className="flex flex-col justify-center px-5 py-8 sm:px-10 sm:py-12"
        style={{
          paddingTop: "max(2rem, env(safe-area-inset-top))",
          paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="mx-auto w-full max-w-[380px]">
          {/* Mobile-only brand + demo strip. */}
          <div className="lg:hidden relative overflow-hidden rounded-2xl bg-[#0B0F19] text-white px-4 py-4 mb-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-10 -right-8 h-28 w-28 rounded-full bg-[#2B4EFF]/25 blur-2xl"
            />
            <div className="relative flex items-center gap-2 mb-2">
              <HiOutlineChatBubbleLeftRight size={17} className="text-[#2B4EFF]" />
              <span className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight">
                Kiteum.Agent
              </span>
            </div>
            <p className="relative text-[12.5px] leading-snug text-white/65 mb-2.5">
              One agent, trained on your data, that answers, shows, and points the way.
            </p>
            <MobileDemoTicker />
          </div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-semibold tracking-tight">
                  Sign in to your workspace
                </h1>
                <p className="mt-2 text-sm text-[#6B6F76]">
                  We'll email you a 6-digit code. No password to remember.
                </p>

                <div className="mt-6 sm:mt-8 relative">
                  {/* Decorative button -- purely visual, sits underneath the
                      real (invisible) Google button below. Not clickable in
                      practice since the overlay above it intercepts the
                      click, but kept non-interactive-looking on purpose. */}
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                    disabled={loading !== null}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-[#E5E5E0] bg-white py-2.5 text-sm font-medium hover:bg-[#F5F5F3] transition-colors disabled:opacity-50"
                  >
                    {loading === "google" ? (
                      <FiLoader className="animate-spin" size={16} />
                    ) : (
                      <FcGoogle size={17} />
                    )}
                    Continue with Google
                  </button>

                  {/* Real Google button, invisible, positioned exactly on
                      top so the actual click (a trusted user gesture) lands
                      on Google's real button -- required for the popup flow
                      to fire at all. */}
                  <div
                    className={`absolute inset-0 opacity-0 overflow-hidden rounded-xl [&>div]:h-full [&>div]:w-full [&_iframe]:h-full [&_iframe]:w-full ${
                      loading !== null ? "pointer-events-none" : ""
                    }`}
                  >
                    <GoogleLogin
                      onSuccess={handleGoogleCredential}
                      onError={() => setError("Google sign-in failed. Try again.")}
                      width="100%"
                    />
                  </div>
                </div>

                <div className="my-5 sm:my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#E5E5E0]" />
                  <span className="text-xs text-[#6B6F76]">or with email</span>
                  <div className="h-px flex-1 bg-[#E5E5E0]" />
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    requestCode(false);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-medium text-[#6B6F76]">
                      Work email
                    </label>
                    <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#E5E5E0] bg-white px-3.5 py-2.5 focus-within:border-[#2B4EFF] transition-colors">
                      <FiMail size={16} className="text-[#6B6F76]" />
                      <input
                        type="email"
                        autoComplete="email"
                        placeholder="you@business.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-sm outline-none placeholder:text-[#B9BAB6]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!emailValid || loading !== null}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2B4EFF] py-2.5 text-sm font-medium text-white hover:bg-[#1E3ADE] transition-colors disabled:opacity-40 disabled:hover:bg-[#2B4EFF]"
                  >
                    {loading === "otp" ? (
                      <FiLoader className="animate-spin" size={16} />
                    ) : (
                      <>
                        Send code <FiArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-semibold tracking-tight">
                  Enter your code
                </h1>
                <p className="mt-2 text-sm text-[#6B6F76]">
                  Sent to <span className="text-[#0B0F19] font-medium">{email}</span>.
                  Didn't get it? Check spam, or resend below.
                </p>

                <div className="mt-6 sm:mt-8 flex justify-between gap-1.5 sm:gap-2">
                  {digits.map((d, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      value={d}
                      onChange={(e) => onDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => onDigitKeyDown(idx, e)}
                      onPaste={onDigitPaste}
                      inputMode="numeric"
                      maxLength={1}
                      className="h-12 w-10 sm:w-11 rounded-xl border border-[#E5E5E0] bg-white text-center text-lg font-[family-name:var(--font-mono)] outline-none focus:border-[#2B4EFF] transition-colors"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={submitCode}
                  disabled={loading !== null}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-[#2B4EFF] py-2.5 text-sm font-medium text-white hover:bg-[#1E3ADE] transition-colors disabled:opacity-40"
                >
                  {loading === "verify" ? (
                    <FiLoader className="animate-spin" size={16} />
                  ) : (
                    <>
                      Verify & continue <FiArrowRight size={15} />
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setDigits(Array(6).fill(""));
                      setError(null);
                      setCooldown(0);
                    }}
                    className="text-[#6B6F76] hover:text-[#0B0F19] transition-colors"
                  >
                    ← Use a different email
                  </button>
                  <button
                    type="button"
                    onClick={() => requestCode(true)}
                    disabled={cooldown > 0 || loading !== null}
                    className="text-[#2B4EFF] disabled:text-[#B9BAB6] font-medium"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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

          <p className="mt-8 sm:mt-10 text-center text-[11px] text-[#B9BAB6]">
            By continuing, you agree to the Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}