"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiBars3, HiXMark } from "react-icons/hi2";
import { navLinks } from "@/components/lib/data";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-[100] bg-white/90 backdrop-blur-xl transition-shadow duration-300 ${
        scrolled ? "shadow-[0_1px_24px_rgba(15,23,42,0.08)]" : "shadow-none"
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-5 sm:px-8">
        <a href="#" className="font-display text-[1.05rem] font-extrabold tracking-tight text-slate-900">
          Agent<span className="text-blue-600">.</span>Kiteum
        </a>

        <ul className="hidden gap-8 md:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Sign in
          </a>
          <a
            href="/login"
            className="rounded-lg bg-slate-900 px-[22px] py-2.5 text-sm font-bold tracking-tight text-white shadow-[0_6px_16px_-4px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_10px_22px_-6px_rgba(15,23,42,0.4)]"
          >
            Sign Up Free
          </a>
        </div>

        <button
          aria-label="Toggle menu"
          className="rounded-md p-1.5 text-slate-900 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <HiXMark className="h-6 w-6" /> : <HiBars3 className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white shadow-[0_12px_24px_-8px_rgba(15,23,42,0.12)] md:hidden"
          >
            <div className="flex flex-col px-6 pb-6 pt-2">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-slate-100 py-3.5 text-[0.95rem] font-medium text-slate-700"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-3.5 block rounded-lg bg-slate-900 px-[22px] py-2.5 text-center text-sm font-bold text-white shadow-[0_6px_16px_-4px_rgba(15,23,42,0.35)]"
              >
                Sign Up — Free
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}