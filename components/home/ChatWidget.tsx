"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaArrowRight } from "react-icons/fa6";
import type { ChatStep, ChatTheme } from "@/components/lib/data";

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Auto-scaling device frame. Measures its own width and scales a fixed
 *  390×844 "screen" to fit, so one chat script works at any container size. */
export function PhoneShell({
  children,
  radius = 44,
}: {
  children: React.ReactNode;
  radius?: number;
}) {
  const screenWrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = screenWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setScale(w / 390);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="relative bg-slate-950 shadow-[0_2px_2px_rgba(0,0,0,0.2),0_40px_80px_-24px_rgba(15,23,42,0.55)]"
      style={{ borderRadius: radius, padding: 12 }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{ borderRadius: radius, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
      />
      <div
        className="relative z-10 mx-auto mb-2 bg-slate-950"
        style={{ width: "23%", height: 22, borderRadius: "0 0 14px 14px" }}
      />
      <div
        ref={screenWrapRef}
        className="relative overflow-hidden bg-white shadow-inner"
        style={{ borderRadius: radius - 12, aspectRatio: "9 / 19.5" }}
      >
        <div style={{ width: 390, height: 844, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** A single looping animated chat conversation. Theme + script are supplied
 *  per business type so the same component powers every demo phone. */
export function ChatDemo({ theme, steps }: { theme: ChatTheme; steps: ChatStep[] }) {
  const [visible, setVisible] = useState<ChatStep[]>([]);
  const [typing, setTyping] = useState(false);
  const [success, setSuccess] = useState<{ title: string; subtitle: string } | null>(null);

  useEffect(() => {
    let alive = true;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    async function run() {
      while (alive) {
        setVisible([]);
        setSuccess(null);
        setTyping(false);
        for (const step of steps) {
          if (!alive) return;
          if (step.from === "bot") {
            setTyping(true);
            await wait(step.typingMs ?? 900);
            if (!alive) return;
            setTyping(false);
          } else {
            await wait(step.typingMs ?? 700);
          }
          if (!alive) return;
          setVisible((prev) => [...prev, step]);
          if (step.success) {
            await wait(350);
            if (!alive) return;
            setSuccess(step.success);
            hideTimer = setTimeout(() => {
              if (alive) setSuccess(null);
            }, 3000);
          }
          await wait(step.gapMs ?? 1300);
        }
        if (!alive) return;
        await wait(3500);
      }
    }
    run();
    return () => {
      alive = false;
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [steps]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${theme.bgImage})` }} />
      <div className={`absolute inset-0 ${theme.overlay}`} />

      {/* Top bar */}
      <div className="relative z-10 px-5 pt-[52px]">
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 shadow-lg backdrop-blur-2xl">
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.avatarGrad} text-lg text-white shadow-md`}>
            {theme.agentIcon}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">{theme.brandName}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[0.68rem] text-white/75">
              <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-emerald-400" />
              Online · Replies in seconds
            </div>
          </div>
          <div className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[0.68rem] font-semibold text-white/60">← Back</div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex flex-1 flex-col justify-end gap-2.5 overflow-hidden px-4 py-5">
        {visible.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex items-end gap-2 ${m.from === "user" ? "flex-row-reverse" : ""}`}
          >
            {m.from === "bot" ? (
              <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${theme.avatarGrad} text-xs text-white shadow`}>
                {theme.agentIcon}
              </div>
            ) : (
              <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${theme.userAvatarGrad} text-[0.7rem] font-bold ${theme.userAvatarText}`}>
                RS
              </div>
            )}
            <div
              className={`max-w-[72%] whitespace-pre-line rounded-[18px] px-3.5 py-2.5 text-[0.84rem] leading-relaxed shadow-md ${
                m.from === "bot"
                  ? "rounded-bl-[5px] bg-white/15 text-white backdrop-blur-xl"
                  : `rounded-br-[5px] bg-gradient-to-br ${theme.userBubbleGrad} ${theme.userBubbleText}`
              }`}
            >
              {m.from === "bot" && (
                <div className={`mb-1 text-[0.62rem] font-bold uppercase tracking-wide ${theme.bubbleLabelColor}`}>
                  {theme.brandName.split(" — ")[0]}
                </div>
              )}
              {m.text}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-end gap-2">
              <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${theme.avatarGrad} text-xs text-white shadow`}>
                {theme.agentIcon}
              </div>
              <div className="flex items-center gap-1.5 rounded-[18px] rounded-bl-[5px] bg-white/15 px-4 py-3 shadow-md backdrop-blur-xl">
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="h-[7px] w-[7px] rounded-full bg-white/70"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 16, scale: 0.94, x: "-50%" }}
            className="absolute bottom-[118px] left-1/2 z-30 flex max-w-[300px] items-center gap-3 rounded-2xl bg-slate-950/90 p-3.5 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-md">
              <FaCheck className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-sm font-bold text-white">{success.title}</div>
              <div className="text-[0.74rem] text-white/70">{success.subtitle}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="relative z-10 px-4 pb-9 pt-3">
        <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-3.5 py-3 shadow-lg backdrop-blur-2xl">
          <span className="flex-1 text-[0.84rem] text-white/55">Type your message…</span>
          <div className={`flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br ${theme.avatarGrad} text-white shadow-md`}>
            <FaArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 right-4 z-10 text-[0.65rem] font-semibold text-white/35">Agent.Kiteum</div>
    </div>
  );
}