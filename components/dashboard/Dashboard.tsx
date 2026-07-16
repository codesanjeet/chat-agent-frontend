/**
 * DashboardView.tsx
 *
 * Charts use recharts. Data now comes from GET /settings/analytics --
 * conversations/leads are already deduped by session server-side (a
 * returning visitor on the same session_id is never double-counted), so
 * this component just renders whatever it's given.
 *
 * Auth/refresh/base-URL handling all comes from lib/apiReq -- this file
 * doesn't touch fetch() directly.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import apiRequest from "@/components/lib/apiReq";
import { HiOutlineQrCode, HiOutlineSparkles } from "react-icons/hi2";
import QRCode from "react-qr-code";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// --- API types, mirrors app/schemas/analytics.py ---------------------------

interface ConversationDay {
  day: string;
  conversations: number;
}

interface LeadDay {
  day: string;
  leads: number;
}

interface ResolutionSlice {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsResponse {
  conversations: ConversationDay[];
  leads: LeadDay[];
  resolution: ResolutionSlice[];
}

async function fetchAnalytics(): Promise<AnalyticsResponse> {
  // apiRequest already attaches the bearer token, retries once on a 401
  // via refreshAccessToken, and parses the JSON body -- errors surface as
  // a thrown Error with the backend's `detail` message.
  return (await apiRequest("/user/analytics", { method: "GET" })) as AnalyticsResponse;
}

// Usage + slug live on GET /settings (same shape as Settings.tsx's
// SettingsData) -- only pulling the two fields this view actually needs.
interface UsageInfo {
  ai_credits_used: number;
  ai_credits_limit: number;
  email_used: number;
  email_limit: number;
  ai_voice_agents_used_min: number;
  ai_voice_agents_limit_min: number;
  storage_used_mb: number;
  storage_limit_mb: number;
  embedding_tokens_used: number;
  embedding_token_limit: number;
}

interface DashboardSettings {
  slug: string | null;
  usage: UsageInfo | null;
}

async function fetchSettings(): Promise<DashboardSettings> {
  return (await apiRequest("/settings", { method: "GET" })) as DashboardSettings;
}

// --- Shared style tokens so every chart reads consistently -----------------

const axisTick = { fill: "#6B6F76", fontSize: 12 };
const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid #E5E5E0",
    fontSize: 13,
    boxShadow: "0 4px 12px rgba(11,15,25,0.06)",
  },
};

function CardShell({
  title,
  subtitle,
  icon,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#E5E5E0]/60 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-[#2B4EFF]">{icon}</span>}
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#0B0F19]">
          {title}
        </p>
      </div>
      {subtitle && <p className="mt-0.5 text-xs text-[#6B6F76]">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="animate-pulse rounded-xl bg-[#F2F2EF]"
      style={{ height }}
    />
  );
}

// --- Usage card (same bars as Settings.tsx's UsageSection) -----------------

function UsageBar({
  used,
  limit,
  label,
  formatValue = (n: number) => n.toLocaleString(),
}: {
  used: number;
  limit: number;
  label: string;
  formatValue?: (n: number) => string;
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-[#6B6F76]">{label}</span>
        <span className="font-medium text-[#0B0F19]">
          {formatValue(used)} / {formatValue(limit)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F4F4F1]">
        <div
          className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-rose-500" : "bg-[#2B4EFF]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function UsageCard({ usage }: { usage: UsageInfo | null }) {
  if (!usage) {
    return (
      <CardShell title="Usage" icon={<HiOutlineSparkles size={16} />}>
        <p className="text-xs text-[#6B6F76]">Usage data isn&apos;t available yet.</p>
      </CardShell>
    );
  }

  return (
    <CardShell title="Usage" icon={<HiOutlineSparkles size={16} />}>
      <div className="flex flex-col gap-4">
        <UsageBar
          used={usage.embedding_tokens_used}
          limit={usage.embedding_token_limit}
          label="Knowledge base tokens"
        />

        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
          <div className="rounded-xl bg-[#F4F4F1] p-3">
            <p className="text-[#6B6F76]">AI credits</p>
            <p className="mt-0.5 font-[family-name:var(--font-display)] text-base font-semibold text-[#0B0F19]">
              {usage.ai_credits_used.toLocaleString()} / {usage.ai_credits_limit.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-[#F4F4F1] p-3">
            <p className="text-[#6B6F76]">Emails left</p>
            <p className="mt-0.5 font-[family-name:var(--font-display)] text-base font-semibold text-[#0B0F19]">
              {usage.email_used.toLocaleString()} / {usage.email_limit.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-[#F4F4F1] p-3">
            <p className="text-[#6B6F76]">Voice minutes</p>
            <p className="mt-0.5 font-[family-name:var(--font-display)] text-base font-semibold text-[#0B0F19]">
              {usage.ai_voice_agents_used_min.toLocaleString()} /{" "}
              {usage.ai_voice_agents_limit_min.toLocaleString()}
            </p>
          </div>
        </div>

        <p className="text-[10px] text-[#B9BAB6]">
          Storage used: {usage.storage_used_mb.toFixed(1)} / {usage.storage_limit_mb.toFixed(1)} MB
        </p>
      </div>
    </CardShell>
  );
}

// --- Share-QR card (same widget as Settings.tsx's ShareQrSection) ----------

const FRONTEND_BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL;

type Feedback = { type: "success" | "error"; text: string };

function InlineMessage({ type, text }: Feedback) {
  return (
    <div
      className={`mt-3 rounded-xl px-3 py-2.5 text-xs ${
        type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      }`}
    >
      {text}
    </div>
  );
}

function ShareQrCard({ slug }: { slug: string | null }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<Feedback | null>(null);

  if (!FRONTEND_BASE_URL) {
    return (
      <CardShell title="Share your chatbot" icon={<HiOutlineQrCode size={16} />}>
        <InlineMessage type="error" text="Missing NEXT_PUBLIC_FRONTEND_BASE_URL environment variable." />
      </CardShell>
    );
  }

  if (!slug) {
    return (
      <CardShell title="Share your chatbot" icon={<HiOutlineQrCode size={16} />}>
        <p className="text-xs text-[#6B6F76]">Finish setting up your chat link to get a QR code.</p>
      </CardShell>
    );
  }

  const chatUrl = `${FRONTEND_BASE_URL.replace(/\/$/, "")}/chat/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chatUrl);
      setMessage({ type: "success", text: "Link copied." });
    } catch {
      setMessage({ type: "error", text: "Couldn't copy link." });
    }
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) {
      setMessage({ type: "error", text: "QR code isn't ready yet." });
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scale = 4;
      const padding = 32;
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = (size + padding * 2) * scale;
      canvas.height = (size + padding * 2) * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setMessage({ type: "error", text: "Couldn't generate image." });
        URL.revokeObjectURL(url);
        return;
      }

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, padding * scale, padding * scale, size * scale, size * scale);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${slug}-qr.png`;
        link.click();
        URL.revokeObjectURL(link.href);
      }, "image/png");
    };
    img.onerror = () => {
      setMessage({ type: "error", text: "Couldn't generate image." });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <CardShell title="Share your chatbot" icon={<HiOutlineQrCode size={16} />}>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div
          ref={qrRef}
          className="flex shrink-0 items-center justify-center rounded-xl border border-[#E5E5E0] bg-white p-4"
        >
          <QRCode value={chatUrl} size={128} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="truncate rounded-xl border border-[#E5E5E0] bg-[#F4F4F1] px-3.5 py-2.5 text-xs text-[#0B0F19]">
            {chatUrl}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-xl border border-[#E5E5E0] bg-white px-3.5 py-2 text-xs font-medium transition-colors hover:bg-[#F5F5F3]"
            >
              Copy link
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-xl bg-[#2B4EFF] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#1E3ADE]"
            >
              Download QR
            </button>
          </div>

          {message && <InlineMessage type={message.type} text={message.text} />}
        </div>
      </div>
    </CardShell>
  );
}

export default function DashboardView() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [settings, setSettings] = useState<DashboardSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchAnalytics(), fetchSettings()])
      .then(([analyticsRes, settingsRes]) => {
        if (cancelled) return;
        setData(analyticsRes);
        setSettings(settingsRes);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load dashboard");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-[#E5E5E0]/60 bg-white p-5 text-sm text-[#6B6F76]">
        Couldn&apos;t load dashboard data: {error}
      </div>
    );
  }

  if (!data || !settings) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <CardShell title="Conversations" subtitle="Last 7 days" className="lg:col-span-2">
            <ChartSkeleton height={220} />
          </CardShell>
          <CardShell title="Resolution rate" subtitle="Bot vs. escalated to admin">
            <ChartSkeleton height={140} />
          </CardShell>
        </div>
        <CardShell title="Leads captured" subtitle="Last 7 days">
          <ChartSkeleton height={200} />
        </CardShell>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ChartSkeleton height={180} />
          <ChartSkeleton height={180} />
        </div>
      </div>
    );
  }

  const { conversations, leads, resolution } = data;
  const totalResolved = resolution.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Conversations over time -- area chart, spans 2 columns */}
        <CardShell
          title="Conversations"
          subtitle="Last 7 days"
          className="lg:col-span-2"
        >
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={conversations}>
                <defs>
                  <linearGradient id="conversationsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2B4EFF" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2B4EFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E0" vertical={false} />
                <XAxis dataKey="day" tick={axisTick} axisLine={{ stroke: "#E5E5E0" }} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={28} />
                <Tooltip {...tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="conversations"
                  stroke="#2B4EFF"
                  strokeWidth={2}
                  fill="url(#conversationsFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardShell>

        {/* Resolution breakdown -- donut chart + custom legend */}
        <CardShell title="Resolution rate" subtitle="Bot vs. escalated to admin">
          {totalResolved === 0 ? (
            <p className="text-xs text-[#6B6F76]">No conversations yet.</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-[140px] w-[140px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resolution}
                      dataKey="value"
                      innerRadius={42}
                      outerRadius={62}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {resolution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="min-w-0 flex-1 space-y-2.5">
                {resolution.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs text-[#6B6F76]">{entry.name}</p>
                      <p className="text-sm font-semibold text-[#0B0F19]">
                        {entry.value}{" "}
                        <span className="text-xs font-normal text-[#6B6F76]">
                          ({Math.round((entry.value / totalResolved) * 100)}%)
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardShell>
      </div>

      {/* Leads captured -- bar chart, full width */}
      <CardShell title="Leads captured" subtitle="Last 7 days">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leads}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E0" vertical={false} />
              <XAxis dataKey="day" tick={axisTick} axisLine={{ stroke: "#E5E5E0" }} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={28} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="leads" fill="#2B4EFF" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardShell>

      {/* Quick-glance usage + share link, same widgets as Settings */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UsageCard usage={settings.usage} />
        <ShareQrCard slug={settings.slug} />
      </div>
    </div>
  );
}