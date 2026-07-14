"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheck } from "react-icons/fa6";
import { Reveal } from "./Reveal";
import { PhoneShell, ChatDemo } from "./ChatWidget";
import { demoTabs, industries } from "@/components/lib/data";

export function LiveDemo() {
  const [activeDemo, setActiveDemo] = useState(demoTabs[0].id);
  const activeTab = demoTabs.find((t) => t.id === activeDemo)!;

  return (
    <>
      {/* Live demo */}
      <section className="px-5 py-16 sm:px-8 sm:py-24" id="demo">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue-600">Live Demo</div>
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[2.5rem]">
              See it in action — for your business type
            </h2>
            <p className="mx-auto mt-3.5 max-w-[540px] text-base leading-loose text-slate-600">
              Watch exactly what your customers will experience. Choose your industry below.
            </p>
          </Reveal>

          <Reveal className="mt-14">
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_-16px_rgba(15,23,42,0.18)]">
              <div className="flex flex-col bg-slate-50 sm:flex-row">
                {demoTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveDemo(t.id)}
                    className={`flex flex-1 items-center justify-center gap-2.5 px-5 py-4 text-sm font-semibold transition-colors ${
                      activeDemo === t.id
                        ? "bg-white text-blue-700 shadow-[inset_0_-2px_0_0_#2563eb]"
                        : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
                    }`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-left">
                      <div className="font-bold">{t.name}</div>
                      <div className="text-[0.72rem] font-medium text-slate-500">{t.sub}</div>
                    </span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid items-center lg:grid-cols-[1fr_1.4fr]"
                >
                  <div className="p-6 sm:p-10">
                    <div className="mb-2.5 text-xs font-bold uppercase tracking-[1.5px] text-blue-600">{activeTab.eyebrow}</div>
                    <h3 className="mb-3.5 font-display text-xl font-extrabold tracking-tight text-slate-900">{activeTab.title}</h3>
                    <p className="mb-6 text-sm leading-relaxed text-slate-600">{activeTab.desc}</p>
                    <div className="flex flex-col gap-2.5">
                      {activeTab.bullets.map((b) => (
                        <div key={b} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-emerald-100 text-[0.62rem] font-extrabold text-emerald-700">
                            <FaCheck className="h-2.5 w-2.5" />
                          </span>
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex min-h-[420px] items-center justify-center bg-slate-50 p-8 sm:min-h-[560px]">
                    <div className="w-[260px] sm:w-[300px]">
                      <PhoneShell radius={50}>
                        <ChatDemo theme={activeTab.theme} steps={activeTab.steps} />
                      </PhoneShell>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
          <p className="mt-4 text-center text-[0.78rem] text-slate-500">
            Your Agent will be trained specifically on your business information — not a generic demo.
          </p>
        </div>
      </section>

      {/* Industries */}
      <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-24" id="industries">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue-600">Who It&apos;s For</div>
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[2.5rem]">
              Built for businesses like yours
            </h2>
            <p className="mx-auto mt-3.5 max-w-[540px] text-base leading-loose text-slate-600">
              No matter what type of business you run, Kiteum Agent adapts to your needs and speaks your customers&apos;
              language.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((ind, i) => (
              <Reveal key={ind.title} delay={(i % 3) * 0.08}>
                <div className="relative h-full overflow-hidden rounded-2xl bg-white p-7 pt-8 shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_-12px_rgba(15,23,42,0.2)]">
                  <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: ind.accent }} />
                  <div className="mb-3.5 text-3xl" style={{ color: ind.accent }}>{ind.icon}</div>
                  <div className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-[1.2px] text-slate-500">{ind.cat}</div>
                  <div className="mb-2 font-display text-base font-extrabold text-slate-900">{ind.title}</div>
                  <div className="mb-4 text-[0.82rem] leading-relaxed text-slate-600">{ind.desc}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ind.tags.map((tag) => (
                      <span key={tag} className={`rounded-full px-2.5 py-1 text-[0.71rem] font-semibold ${ind.accentBg} ${ind.accentText}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}