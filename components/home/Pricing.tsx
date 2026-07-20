"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheck, FaStar, FaXmark } from "react-icons/fa6";
import { Reveal } from "./Reveal";
import { whyProblems, whySolutions, plans } from "@/components/lib/data";

const ENQUIRY_PLANS = ["Pro", "Business"];

function PlanEnquiryModal({ planName, onClose }: { planName: string; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", plan: planName, email: "", phone: "", type: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const inputCls =
    "w-full rounded-lg bg-slate-50 px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-inset ring-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500";

  async function handleSubmit() {
    setError("");
    if (!form.name || !form.plan || !form.email || !form.phone || !form.type) {
      setError("Please fill in all fields so our team can reach you.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("https://api.edu.kiteum.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          institute: form.plan,
          email: form.email,
          phone: form.phone,
          message: `[Plan Enquiry: ${form.plan}] Business type: ${form.type}`,
        }),
      });
      if (res.ok || res.status === 201) {
        setSubmitted(true);
      } else {
        let msg = "Something went wrong. Please try again.";
        try {
          const data = await res.json();
          if (data?.detail) msg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        } catch {
          /* ignore parse errors */
        }
        setError(msg);
        setSubmitting(false);
      }
    } catch {
      setError("Could not connect. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  function goToSignup() {
    window.location.href = "/dashboard";
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 py-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-[101] max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-2xl bg-white p-8 shadow-[0_24px_60px_-16px_rgba(15,23,42,0.35)]"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <FaXmark className="h-3.5 w-3.5" />
        </button>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-1.5 text-xs font-bold uppercase tracking-[1.5px] text-blue-600">
                {planName} Plan
              </div>
              <h3 className="mb-2 font-display text-xl font-extrabold tracking-tight text-slate-900">
                Let&apos;s get you set up
              </h3>
              <p className="mb-6 text-[0.85rem] leading-loose text-slate-600">
                We&apos;re onboarding {planName} customers personally for now — no payment gateway yet. Fill in
                your details and our team will reach out to confirm payment and get you upgraded. Meanwhile, go
                ahead and create your free account below — once payment is confirmed, we&apos;ll upgrade it to{" "}
                {planName} for you.
              </p>
              <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Your Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Rahul Sharma"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Plan *</label>
                  <select
                    value={form.plan}
                    onChange={(e) => setForm({ ...form, plan: e.target.value })}
                    className={`${inputCls} appearance-none`}
                  >
                    {ENQUIRY_PLANS.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="rahul@email.com"
                  className={inputCls}
                />
              </div>
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone Number *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className={inputCls}
                />
              </div>
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Business Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={`${inputCls} appearance-none`}
                >
                  <option value="" disabled>Select your business type</option>
                  <option>Clinic / Hospital</option>
                  <option>School / College</option>
                  <option>Restaurant / Cafe</option>
                  <option>Salon / Spa</option>
                  <option>Gym / Fitness</option>
                  <option>Real Estate</option>
                  <option>Retail Shop</option>
                  <option>Other</option>
                </select>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full rounded-lg bg-blue-600 py-4 text-[0.92rem] font-bold tracking-tight text-white shadow-[0_10px_24px_-8px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:opacity-70"
              >
                {submitting ? "Sending…" : "Send & Continue →"}
              </button>
              {error && <p className="mt-2.5 text-center text-sm font-medium text-red-600">{error}</p>}
              <p className="mt-3 text-center text-[0.74rem] text-slate-500">
                🔒 Your details are safe. We will never spam you.
              </p>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 text-center">
              <div className="mb-3.5 text-5xl">🎉</div>
              <h3 className="mb-2 text-lg font-extrabold text-slate-900">Got it, thanks!</h3>
              <p className="mb-6 text-[0.85rem] leading-loose text-slate-600">
                Our team will reach out shortly to confirm payment for the {form.plan} plan. Create your free
                account now — we&apos;ll upgrade it as soon as payment is confirmed.
              </p>
              <button
                onClick={goToSignup}
                className="w-full rounded-lg bg-blue-600 py-3.5 text-center text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Create My Free Account →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export function PricingSection({ onContactClick }: { onContactClick: () => void }) {
  const [enquiryPlan, setEnquiryPlan] = useState<string | null>(null);

  return (
    <>
      {/* Why us */}
      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue-600">Why Agent.Kiteum</div>
              <h2 className="mb-3.5 font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[2.5rem]">
                Most businesses lose customers before saying hello
              </h2>
              <p className="mb-8 max-w-[540px] text-base leading-loose text-slate-600">
                Every missed call, every unanswered message, every slow reply — that&apos;s a customer who chose your
                competitor. Here&apos;s what&apos;s really happening:
              </p>
            </Reveal>
            <Reveal className="flex flex-col gap-3">
              {whyProblems.map((p) => (
                <div key={p.title} className="flex items-start gap-3.5 rounded-xl bg-white p-4.5 px-5 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
                  <div className="mt-0.5 flex-shrink-0 text-lg text-red-500">{p.icon}</div>
                  <div>
                    <div className="mb-1 text-[0.88rem] font-bold text-slate-900">{p.title}</div>
                    <div className="text-[0.79rem] leading-relaxed text-slate-600">{p.desc}</div>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>

          <div>
            <Reveal className="mb-4 text-xs font-bold uppercase tracking-[1.2px] text-emerald-600">
              Kiteum Agent solves all of this
            </Reveal>
            <Reveal className="flex flex-col gap-3">
              {whySolutions.map((s) => (
                <div key={s.title} className="flex items-start gap-3.5 rounded-xl bg-emerald-50 p-4.5 px-5 shadow-sm">
                  <div className="mt-0.5 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[0.65rem] font-extrabold text-white">
                    <FaCheck className="h-2.5 w-2.5" />
                  </div>
                  <div>
                    <div className="mb-1 text-[0.88rem] font-bold text-emerald-900">{s.title}</div>
                    <div className="text-[0.79rem] leading-relaxed text-emerald-800">{s.desc}</div>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-24" id="pricing">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue-600">Pricing</div>
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[2.5rem]">
              Start free. Upgrade when you&apos;re ready.
            </h2>
            <p className="mx-auto mt-3.5 max-w-[540px] text-base leading-loose text-slate-600">
              No hidden charges. No setup fees. No long contracts. Cancel anytime.
            </p>
          </Reveal>

          <div className="mx-auto mt-14 grid max-w-[420px] gap-5 sm:max-w-[720px] sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
            {plans.map((p, i) => {
              const needsEnquiry = ENQUIRY_PLANS.includes(p.name);
              const btnClass = p.popular
                ? "block w-full rounded-lg bg-blue-600 py-3.5 text-center text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                : "block w-full rounded-lg bg-slate-100 py-3.5 text-center text-sm font-bold text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700";

              return (
                <Reveal key={p.name} delay={i * 0.1}>
                  <div
                    className={`relative h-full rounded-2xl bg-white p-8 px-7 transition-all hover:-translate-y-1 ${
                      p.popular
                        ? "shadow-[0_24px_50px_-16px_rgba(37,99,235,0.35)] ring-2 ring-blue-600 lg:scale-[1.03]"
                        : "shadow-[0_2px_10px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_36px_-12px_rgba(15,23,42,0.18)]"
                    }`}
                  >
                    {p.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-600 px-4 py-1 text-[0.7rem] font-bold text-white shadow-md">
                        <FaStar className="mr-1 inline h-2.5 w-2.5 -translate-y-px" /> Most Popular
                      </div>
                    )}
                    <div className="mb-3 text-[0.72rem] font-bold uppercase tracking-[1.5px] text-slate-500">{p.name}</div>
                    <div className="font-display text-[2.6rem] font-black leading-none tracking-tight text-slate-900">
                      {p.price} <span className="text-base font-medium tracking-normal text-slate-500">/ month</span>
                    </div>
                    <div className="mb-1.5 mt-1.5 text-sm font-semibold text-slate-700">{p.convos}*</div>
                    <div className="mb-5 border-b border-slate-100 pb-5 text-[0.76rem] text-slate-500">{p.credits}</div>
                    <div className="mb-6 flex flex-col gap-2.5">
                      {p.feats.map((f) => (
                        <div key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <FaCheck className="mt-1 h-3 w-3 flex-shrink-0 text-emerald-600" /> {f}
                        </div>
                      ))}
                    </div>
                    {needsEnquiry ? (
                      <button onClick={() => setEnquiryPlan(p.name)} className={btnClass}>
                        {p.cta}
                      </button>
                    ) : (
                      <a href="/dashboard" className={btnClass}>
                        {p.cta}
                      </a>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>

          <p className="mx-auto mt-6 max-w-[620px] text-center text-[0.78rem] leading-relaxed text-slate-500">
            *Conversation counts are an average estimate calculated from each plan&apos;s AI credit allowance at typical
            conversation length. Your actual number may be lower if conversations run long or cover a lot of detail,
            or higher for short, simple chats.
          </p>
          <p className="mt-4 text-center text-[0.83rem] text-slate-600">
            🎁 New sign-ups get <strong className="font-semibold text-slate-900">1 month free</strong> on the Basic
            plan.{" "}
            <button onClick={onContactClick} className="font-semibold text-blue-600 hover:text-blue-700">
              Have a question? Contact us →
            </button>
          </p>
        </div>
      </section>

      <AnimatePresence>
        {enquiryPlan && <PlanEnquiryModal planName={enquiryPlan} onClose={() => setEnquiryPlan(null)} />}
      </AnimatePresence>
    </>
  );
}