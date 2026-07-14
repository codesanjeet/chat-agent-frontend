"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa6";
import { Reveal } from "./Reveal";
import { perks, faqs } from "@/components/lib/data";

export const ContactFaq = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", biz: "", email: "", phone: "", type: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    if (!form.name || !form.biz || !form.email || !form.phone || !form.type) {
      setError("Please fill in all fields to send your message.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("https://api.edu.kiteum.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          institute: form.biz,
          email: form.email,
          phone: form.phone,
          message: form.type,
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

  const inputCls =
    "w-full rounded-lg bg-slate-50 px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-inset ring-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500";

  return (
    <>
      {/* Contact */}
      <section className="px-5 py-16 sm:px-8 sm:py-24" id="contact">
        <div className="mx-auto grid max-w-[1180px] items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue-600">Contact Us</div>
            <h3 className="mb-2 font-display text-2xl font-extrabold tracking-tight text-slate-900">
              Questions? Custom plan? Let&apos;s talk.
            </h3>
            <p className="mb-8 text-[0.92rem] leading-loose text-slate-600">
              Whether you want a personal walkthrough, need a plan tailored to your business, or just have a
              question — send us a message and our team will get back to you within one business day.
            </p>
            <div className="flex flex-col gap-6">
              {perks.map((p) => (
                <div key={p.title} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-600 shadow-sm">
                    {p.icon}
                  </div>
                  <div>
                    <div className="mb-1 text-[0.88rem] font-bold text-slate-900">{p.title}</div>
                    <div className="text-[0.8rem] leading-relaxed text-slate-600">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="rounded-2xl bg-white p-9 shadow-[0_10px_40px_-16px_rgba(15,23,42,0.18)]">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h3 className="mb-1.5 font-display text-xl font-extrabold tracking-tight text-slate-900">Contact Us</h3>
                    <p className="mb-6 text-[0.85rem] text-slate-600">
                      Fill in your details and let us know what you need — our team will reach out shortly.
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
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Business Name *</label>
                        <input
                          value={form.biz}
                          onChange={(e) => setForm({ ...form, biz: e.target.value })}
                          placeholder="Sharma Clinic"
                          className={inputCls}
                        />
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
                    <div className="mb-4">
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
                      {submitting ? "Sending…" : "Send Message →"}
                    </button>
                    {error && <p className="mt-2.5 text-center text-sm font-medium text-red-600">{error}</p>}
                    <p className="mt-3 text-center text-[0.74rem] text-slate-500">
                      🔒 Your details are safe. We will never spam you.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
                    <div className="mb-3.5 text-5xl">🎉</div>
                    <h3 className="mb-2 text-lg font-extrabold text-slate-900">Message received!</h3>
                    <p className="text-[0.85rem] leading-loose text-slate-600">
                      Thanks for reaching out. Our team will get back to you within one business day. In the
                      meantime, feel free to{" "}
                      <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                        sign up
                      </a>{" "}
                      and explore the free plan.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-24" id="faq">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue-600">FAQ</div>
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[2.5rem]">
              Questions we get asked a lot
            </h2>
          </Reveal>
          <div className="mx-auto mt-12 flex max-w-[720px] flex-col gap-2.5">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.03}>
                <div className="overflow-hidden rounded-xl bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4.5 text-left text-sm font-bold text-slate-900 transition-colors hover:text-blue-700"
                  >
                    {f.q}
                    <motion.span
                      animate={{ rotate: openFaq === i ? 180 : 0, color: openFaq === i ? "#2563eb" : "#64748b" }}
                      className="flex-shrink-0 text-sm"
                    >
                      <FaChevronDown />
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4.5 text-[0.85rem] leading-loose text-slate-600">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};