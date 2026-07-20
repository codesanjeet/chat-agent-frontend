"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FiLoader } from "react-icons/fi";
import { useUser } from "@/components/lib/UserContext";
import Sidebar, { NAV_ITEMS } from "@/components/dashboard/Sidebar";
import {
  apiJson,
  TestChatbotButton,
  DOCUMENTS_UPDATED_EVENT,
} from "@/components/dashboard/Trainer";

const UNLOCKED_PATH = "/dashboard/train-ai";

const TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  "train-ai": "AI Trainer",
  escalation: "Escalation",
  inquiries: "Inquiries",
  "chat-history": "Chat History",
  settings: "Settings",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status } = useUser();

  // Count of confirmed/embedded documents, fetched once here so the
  // "Test your live chatbot" button can live in the header (and therefore
  // on every dashboard route) instead of only inside the AI Trainer page.
  // null = not loaded yet, so we don't flash the button on/off on load.
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null);

  const loadConfirmedCount = useCallback(async () => {
    try {
      const docs = (await apiJson("/documents")) as { is_active: boolean }[];
      setConfirmedCount(docs.filter((d) => d.is_active).length);
    } catch {
      // Non-critical -- the button just stays hidden/stale until the next
      // successful fetch rather than breaking the whole layout.
    }
  }, []);

  useEffect(() => {
    if (status !== "ready" || !user) return;

    if (!user.profile_completed) {
      router.replace("/onboarding");
      return;
    }

    if (!user.is_configured && pathname !== UNLOCKED_PATH) {
      router.replace(UNLOCKED_PATH);
    }
  }, [status, user, pathname, router]);

  // Fetch the confirmed-document count once the user is ready, and again on
  // every route change (covers switching tabs and coming back). This is the
  // "1 extra query" needed since the header lives outside AI Trainer's own
  // state tree and has no other way to know how many documents are confirmed.
  useEffect(() => {
    if (status !== "ready" || !user) return;
    loadConfirmedCount();
  }, [status, user, pathname, loadConfirmedCount]);

  // AI Trainer dispatches this event right after a document is confirmed or
  // deleted, so the header button updates immediately without waiting for a
  // route change.
  useEffect(() => {
    if (status !== "ready" || !user) return;
    window.addEventListener(DOCUMENTS_UPDATED_EVENT, loadConfirmedCount);
    return () => window.removeEventListener(DOCUMENTS_UPDATED_EVENT, loadConfirmedCount);
  }, [status, user, loadConfirmedCount]);

  if (status === "checking" || !user) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#FAFAF9]">
        <FiLoader className="animate-spin text-[#6B6F76]" size={20} />
      </div>
    );
  }

  const activeId = pathname === "/dashboard" ? "dashboard" : pathname.split("/").pop();
  const title = TITLES[activeId ?? "dashboard"] ?? "Dashboard";

  return (
    <div className="flex min-h-[100dvh] w-full overflow-x-hidden bg-[#FAFAF9]">
      <Sidebar />
      <div className="flex max-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[#E5E5E0] bg-[#F4F4F1]/80 px-6 py-4 backdrop-blur lg:px-8">
          <h1 className="truncate pl-14 font-[family-name:var(--font-display)] text-xl font-semibold text-[#0B0F19] lg:pl-0">
            {title}
          </h1>
          {confirmedCount !== null && confirmedCount > 0 && (
            <TestChatbotButton slug={user.slug} chunkCount={confirmedCount} />
          )}
        </header>
        <main className="min-w-0 flex-1 overflow-y-scroll px-6 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}