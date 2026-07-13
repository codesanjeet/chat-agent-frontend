"use client";

/**
 * Sidebar.tsx
 *
 * CHANGED FROM DARK -> LIGHT CHROME: this sidebar sits in front of the
 * working dashboard (conversation queues, lead lists, config screens) where
 * admins spend hours at a time -- light, quiet chrome reduces fatigue over a
 * full shift better than a bold dark panel does. The dark ink + animated
 * demo treatment stays on the login/marketing surface only, where a bolder
 * first impression is the right call.
 *
 * Still fully self-contained for its own responsive behavior: collapse
 * state (desktop) and drawer state (mobile) live here, nowhere else.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineClipboardDocumentList,
  HiOutlineCog6Tooth,
  HiOutlineCpuChip,
  HiOutlineFlag,
  HiOutlineHome,
  HiOutlineSquares2X2,
  HiOutlineXMark,
} from "react-icons/hi2";
import { Space_Grotesk, Inter } from "next/font/google";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type DashboardTab = "dashboard" | "settings"| "escalation" | "conversation-history"|"inquires"|"train-ai";

// Add/rename tabs here -- MainContent's VIEWS map must use the same ids.


export const NAV_ITEMS: { id: DashboardTab; label: string; icon: typeof HiOutlineHome }[] = [
  { id: "dashboard", label: "Dashboard", icon: HiOutlineSquares2X2 },
  { id: "train-ai", label: "Train AI", icon: HiOutlineCpuChip },
  { id: "escalation", label: "Escalation", icon: HiOutlineFlag },
  { id: "inquires", label: "Inquiries", icon: HiOutlineClipboardDocumentList },
  { id: "conversation-history", label: "Chat History", icon: HiOutlineChatBubbleLeftRight },
  { id: "settings", label: "Settings", icon: HiOutlineCog6Tooth },
];
interface SidebarProps {
  activeId: DashboardTab;
  onNavigate: (id: DashboardTab) => void;
  businessName?: string;
  email?: string;
}

export default function Sidebar({
  activeId,
  onNavigate,
  businessName = "My Business",
  email = "",
}: SidebarProps) {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = businessName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSelect = (id: DashboardTab) => {
    onNavigate(id);
    setMobileOpen(false); // auto-close the drawer on mobile after a tap
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // best-effort -- still clear local state and redirect even if this fails
    }
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  return (
    <div className={`${display.variable} ${body.variable}`}>
      {/* Mobile hamburger -- fixed, always reachable */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E5E0] bg-white text-[#0B0F19] shadow-sm lg:hidden"
        aria-label="Open menu"
      >
        <HiOutlineBars3 size={20} />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/*
        Mobile (below lg): `fixed` -- out of normal flow entirely, so it never
        affects MainContent's width, it just overlays on top when open.
        Desktop (lg+): `lg:sticky` -- back in flow, taking its animated width,
        with MainContent's flex-1 filling whatever's left.
      */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col justify-between overflow-hidden border-r border-[#E5E5E0] bg-[#F5F5F3] text-[#0B0F19] transition-transform duration-200 lg:sticky lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2 overflow-hidden">
              <HiOutlineChatBubbleLeftRight
                size={22}
                className="shrink-0 text-[#2B4EFF]"
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap font-[family-name:var(--font-display)] text-base font-semibold"
                  >
                    Kiteum.Agent
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="text-[#6B6F76] hover:text-[#0B0F19] lg:hidden"
              aria-label="Close menu"
            >
              <HiOutlineXMark size={20} />
            </button>
          </div>

          <nav className="mt-4 flex flex-col gap-1 px-3">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = id === activeId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelect(id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    active
                      ? "bg-[#2B4EFF]/10 text-[#0B0F19]"
                      : "text-[#6B6F76] hover:bg-black/[0.03] hover:text-[#0B0F19]"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                      active ? "text-[#2B4EFF]" : ""
                    }`}
                  >
                    <Icon size={19} />
                  </span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="whitespace-nowrap font-medium"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#E5E5E0] px-3 py-4">
          <div className="flex items-center gap-2.5 rounded-xl px-1 py-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2B4EFF] text-xs font-semibold text-white">
              {initials || "?"}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-medium text-[#0B0F19]">
                    {businessName}
                  </p>
                  {email && (
                    <p className="truncate text-xs text-[#6B6F76]">{email}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#6B6F76] transition-colors hover:bg-black/[0.03] hover:text-[#0B0F19]"
          >
            <HiOutlineArrowRightOnRectangle size={19} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap"
                >
                  Log out
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="mt-2 hidden w-full items-center justify-center rounded-xl px-3 py-2 text-[#6B6F76] hover:bg-black/[0.03] hover:text-[#0B0F19] lg:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <HiOutlineChevronRight size={17} />
            ) : (
              <HiOutlineChevronLeft size={17} />
            )}
          </button>
        </div>
      </motion.aside>
    </div>
  );
}