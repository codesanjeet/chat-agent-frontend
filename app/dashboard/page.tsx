"use client";

import { useState } from "react";
import Sidebar, { type DashboardTab } from "@/components/dashboard/Sidebar";
import MainContent from "@/components/dashboard/MainContent";

export default function DashboardPage() {
  const [active, setActive] = useState<DashboardTab>("dashboard");

  // TODO: replace with the real logged-in user, e.g. from a GET /auth/me
  // call on mount, instead of these placeholders.
  const businessName = "My Business";
  const email = "";

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[#FAFAF9]">
      <Sidebar
        activeId={active}
        onNavigate={setActive}
        businessName={businessName}
        email={email}
      />
      <MainContent activeId={active} />
    </div>
  );
}