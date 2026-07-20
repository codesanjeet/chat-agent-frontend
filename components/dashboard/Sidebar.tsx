"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { useUser } from "../lib/UserContext";
import { logout as logoutRequest } from "@/components/lib/authServices";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export type DashboardTab =
  | "dashboard"
  | "settings"
  | "escalation"
  | "chat-history"
  | "inquiries"
  | "train-ai";

export const NAV_ITEMS: { id: DashboardTab; label: string; icon: typeof HiOutlineHome }[] = [
  { id: "dashboard", label: "Dashboard", icon: HiOutlineSquares2X2 },
  { id: "train-ai", label: "Train AI", icon: HiOutlineCpuChip },
  { id: "escalation", label: "Escalation", icon: HiOutlineFlag },
  { id: "inquiries", label: "Inquiries", icon: HiOutlineClipboardDocumentList },
  { id: "chat-history", label: "Chat History", icon: HiOutlineChatBubbleLeftRight },
  { id: "settings", label: "Settings", icon: HiOutlineCog6Tooth },
];

const UNLOCKED_TAB: DashboardTab = "train-ai";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const businessName = user?.business_name || "My Business";
  const email = user?.email || "";
  const isConfigured = user?.is_configured ?? true;

  const initials = businessName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // derive active tab from the URL instead of a prop
  const activeId = (
  pathname === "/dashboard" ? "dashboard" : pathname.split("/").pop()
) as DashboardTab;

  const isLocked = (id: DashboardTab) => !isConfigured && id !== UNLOCKED_TAB;

  const handleLogout = async () => {
    try {
      await logoutRequest(); // clears authStore + redirects to /login internally
    } catch {
      // best-effort -- still bounce to login even if the request fails
      router.push("/login");
    }
  };

  return (
    <div className={`${display.variable} ${body.variable}`}>
      {/* Mobile hamburger */}
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

      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] flex-col justify-between overflow-hidden border-r border-[#E5E5E0] bg-[#F5F5F3] text-[#0B0F19] transition-transform duration-200 lg:sticky lg:translate-x-0 ${
  mobileOpen ? "translate-x-0" : "-translate-x-full"
}`}
      >
        <div>
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2 overflow-hidden">
              <HiOutlineChatBubbleLeftRight size={22} className="shrink-0 text-[#2B4EFF]" />
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

          {!isConfigured && !collapsed && (
            <div className="mx-3 mt-3 rounded-xl bg-[#2B4EFF]/10 px-3 py-2.5 text-xs text-[#0B0F19]">
              <p className="font-medium">Finish training your AI</p>
              <p className="mt-0.5 text-[#6B6F76]">
                Other sections unlock once your bot is set up.
              </p>
            </div>
          )}

          <nav className="mt-4 flex flex-col gap-1 px-3">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = id === activeId;
              const locked = isLocked(id);

              return (
                <Link
                  key={id}
                  href={id === "dashboard" ? "/dashboard" : `/dashboard/${id}`}
                  onClick={(e) => {
                    if (locked) {
                      e.preventDefault();
                      return;
                    }
                    setMobileOpen(false);
                  }}
                  aria-disabled={locked}
                  title={locked ? "Finish training your AI first" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    locked
                      ? "cursor-not-allowed text-[#B9BAB6] opacity-50"
                      : active
                      ? "bg-[#2B4EFF]/10 text-[#0B0F19]"
                      : "text-[#6B6F76] hover:bg-black/[0.03] hover:text-[#0B0F19]"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                      !locked && active ? "text-[#2B4EFF]" : ""
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
                </Link>
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
                  <p className="truncate text-sm font-medium text-[#0B0F19]">{businessName}</p>
                  {email && <p className="truncate text-xs text-[#6B6F76]">{email}</p>}
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
            {collapsed ? <HiOutlineChevronRight size={17} /> : <HiOutlineChevronLeft size={17} />}
          </button>
        </div>
      </motion.aside>
    </div>
  );
}