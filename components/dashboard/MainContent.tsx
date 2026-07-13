/**
 * MainContent.tsx
 *
 * Renders a different view component depending on `activeId`, which the
 * parent (page.tsx) owns and passes down alongside Sidebar -- both read
 * from the same piece of state, so they can never disagree about what's
 * "currently open."
 *
 * `min-w-0` on the root is the important, easy-to-miss fix for small
 * screens: without it, a flex child with wide inner content (a table, a
 * long unbroken string) forces the whole row wider than the viewport
 * instead of scrolling internally.
 */

import { Space_Grotesk, Inter } from "next/font/google";
import type { DashboardTab } from "./Sidebar";
import DashboardView from "./Dashboard"
import TrainerView from "./Trainer";
import ConversationHistory from "./ConversationHistory";
import Escalations from "./Escalation";
import Inquiries from "./Inquires";
import Settings from "./Settings";
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

const VIEWS: Record<DashboardTab, { title: string; render: () => React.ReactNode }> = {
  dashboard: { title: "Dashboard", render: () => <DashboardView /> },
  escalation: { title: "Escalation", render: () => <Escalations /> },
  inquires: { title: "Inquires", render: () => <Inquiries /> },
  "conversation-history": { title: "Conversation History", render: () => <ConversationHistory /> },
  "train-ai": { title: "AI Trainer", render: () => <TrainerView /> },
  settings: { title: "Settings", render: () => <Settings /> },
};

interface MainContentProps {
  activeId: DashboardTab;
  actions?: React.ReactNode;
}

export default function MainContent({ activeId, actions }: MainContentProps) {
  const view = VIEWS[activeId];

  return (
    <div
      className={`${display.variable} ${body.variable} flex max-h-screen min-w-0 flex-1 flex-col bg-[#F4F4F1] font-[family-name:var(--font-body)]`}
    >
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E5E5E0] bg-[#F4F4F1]/80 px-6 py-4 backdrop-blur lg:px-8">
        {/* pl-14 on mobile clears the fixed hamburger button rendered by Sidebar */}
        <h1 className="truncate pl-14 font-[family-name:var(--font-display)] text-xl font-semibold text-[#0B0F19] lg:pl-0">
          {view.title}
        </h1>
        {actions && (
          <div className="flex shrink-0 items-center gap-3">{actions}</div>
        )}
      </header>

      <main className="min-w-0 flex-1 overflow-y-scroll px-6 py-6 lg:px-8 lg:py-8">
        {view.render()}
      </main>
    </div>
  );
}