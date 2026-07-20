"use client";

import { motion } from "framer-motion";
import { FaArrowRight, FaPlay, FaCheck, FaFileLines, FaGift } from "react-icons/fa6";
import { PhoneShell, ChatDemo } from "./ChatWidget";
import { chips, clinicTheme, clinicSteps } from "@/components/lib/data";

export function Hero() {
  return (
    <>
      <section className="relative overflow-hidden bg-white px-5 py-16 sm:px-8 sm:py-24">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.08)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(5,150,105,0.07)_0%,transparent_70%)]" />

        <div className="relative z-[1] mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-700 shadow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> July Special — 1 Month Free on Basic
              </div>

              <h1 className="font-display text-[2.1rem] font-black leading-[1.12] tracking-tight text-slate-900 sm:text-[3.4rem] lg:text-[3.75rem] lg:leading-[1.08]">
                Your business needs a{" "}
                <span className="bg-gradient-to-br from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  24/7 AI Assistant
                </span>
              </h1>

              <p className="mt-5 max-w-[460px] text-[1.05rem] leading-relaxed text-slate-600">
                Customers ask questions at all hours. Your AI Agent answers instantly — books appointments, shares
                your menu, captures leads — while you focus on running your business.
              </p>

              <div className="mt-4 flex max-w-[460px] items-start gap-2.5 rounded-xl bg-emerald-50 px-4 py-3 text-[0.85rem] font-semibold text-emerald-800 ring-1 ring-emerald-200">
                <FaGift className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                <span>
                  Sign up anytime in July and get your first month of the Basic plan (₹299) absolutely free —
                  individuals and businesses both qualify.
                </span>
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-7 py-3.5 text-sm font-bold tracking-tight text-white shadow-[0_10px_24px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_14px_30px_-6px_rgba(37,99,235,0.55)]"
                >
                  Sign Up — It&apos;s Free <FaArrowRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.15)] transition-all hover:-translate-y-0.5 hover:text-blue-700 hover:shadow-[0_10px_22px_-6px_rgba(15,23,42,0.18)]"
                >
                  <FaPlay className="h-3 w-3" /> See It in Action
                </a>
              </div>

              <div className="mt-11 flex gap-8">
                {[
                  ["24/7", "Always available"],
                  ["<3s", "Reply time"],
                  ["10m", "Setup time"],
                ].map(([num, label], i) => (
                  <div key={num} className={`flex items-center gap-8 ${i > 0 ? "border-l border-slate-200 pl-8" : ""}`}>
                    <div>
                      <div className="font-display text-[1.6rem] font-extrabold tracking-tight text-slate-900">{num}</div>
                      <div className="text-[0.78rem] font-medium text-slate-500">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative mx-auto max-w-[300px]">
            <motion.div
              className="absolute -right-6 top-12 z-20 hidden items-center gap-1.5 whitespace-nowrap rounded-xl bg-white px-3.5 py-2.5 text-[0.73rem] font-bold text-emerald-700 shadow-[0_10px_24px_-8px_rgba(15,23,42,0.2)] sm:flex"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaCheck className="h-3 w-3" /> Appointment Booked
            </motion.div>
            <motion.div
              className="absolute -left-6 bottom-16 z-20 hidden items-center gap-1.5 whitespace-nowrap rounded-xl bg-white px-3.5 py-2.5 text-[0.73rem] font-bold text-orange-700 shadow-[0_10px_24px_-8px_rgba(15,23,42,0.2)] sm:flex"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            >
              <FaFileLines className="h-3 w-3" /> New Lead Captured
            </motion.div>
            <PhoneShell radius={44}>
              <ChatDemo theme={clinicTheme} steps={clinicSteps} />
            </PhoneShell>
          </div>
        </div>
      </section>

      {/* Business-type strip */}
      <div className="bg-slate-50 px-5 py-7 sm:px-8">
        <div className="mx-auto max-w-[1180px]">
          <p className="mb-5 text-center text-[0.73rem] font-bold uppercase tracking-[1.5px] text-slate-500">
            Works for any type of business
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {chips.map((c) => (
              <div
                key={c.label}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.82rem] font-semibold shadow-sm transition-transform hover:-translate-y-0.5 ${c.cls}`}
              >
                {c.icon} {c.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}