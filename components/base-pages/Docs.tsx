"use client";

import { useState } from "react";
import {
  FiCode, FiSettings, FiLayers, FiSliders,
  FiMail, FiCopy, FiCheck,
} from "react-icons/fi";

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
      {label && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
          <span className="text-[11px] font-medium text-slate-400">{label}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      <pre className="px-4 py-4 overflow-x-auto text-[12.5px] leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const htmlCode = `<!-- Paste this just before the closing </body> tag -->

<script
  src="https://agent.kiteum.com/widget.js"
  data-slug="kiteum"   // 👈 your slug
  data-accent-color="#2B4EFF"
  async
></script>`;

const reactCode = `// components/ChatWidgetLoader.jsx
import { useEffect } from "react";

const WIDGET_SRC = "https://agent.kiteum.com/widget.js";

export default function ChatWidgetLoader() {
  useEffect(() => {
    // Stops duplicate widget injects during hot-reloads
    if (document.querySelector(\`script[src="\${WIDGET_SRC}"]\`)) return;

    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    script.setAttribute("data-slug", "kiteum"); // 👈 your slug
    script.setAttribute("data-accent-color", "#2B4EFF");
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}

// ────────────────────────────────
// App.jsx (To render it on EVERY page automatically)
import ChatWidgetLoader from "./components/ChatWidgetLoader";

export default function App() {
  return (
    <div>
      <Navbar />
      <MainRoutes />
      <Footer />
      
      <ChatWidgetLoader /> {/* 👈 1 line code setup site-wide */}
    </div>
  );
}

// Only want it on specific pages? Just mount <ChatWidgetLoader /> 
// inside that specific page component instead of global App.jsx.`;

const angularCode = `import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
})
export class ContactComponent implements OnInit, OnDestroy {
  private widgetScript!: HTMLScriptElement;

  ngOnInit(): void {
    this.widgetScript = document.createElement('script');
    this.widgetScript.src = 'https://agent.kiteum.com/widget.js';
    this.widgetScript.async = true;
    this.widgetScript.setAttribute('data-slug', 'kiteum');   // 👈 your slug
    this.widgetScript.setAttribute('data-accent-color', '#2B4EFF');
    document.body.appendChild(this.widgetScript);
  }

  ngOnDestroy(): void {
    if (this.widgetScript) {
      document.body.removeChild(this.widgetScript);
    }
  }
}`;

const nextCode = `// components/ChatWidgetLoader.tsx
"use client";
import { useEffect } from "react";

const WIDGET_SRC = "https://agent.kiteum.com/widget.js";

export default function ChatWidgetLoader() {
  useEffect(() => {
    // stops a duplicate widget if this ever mounts twice
    if (document.querySelector(\`script[src="\${WIDGET_SRC}"]\`)) return;

    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    script.setAttribute("data-slug", "kiteum"); // 👈 your slug
    script.setAttribute("data-accent-color", "#2B4EFF");
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}

// ────────────────────────────────
// app/layout.tsx  (shows the widget on every page)
import ChatWidgetLoader from "@/components/ChatWidgetLoader";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        
        <ChatWidgetLoader /> {/* 👈 1 line code setup site-wide */}
      </body>
    </html>
  );
}

// Only want it on one page instead of every route?
// Import <ChatWidgetLoader /> into that page.tsx instead of layout.tsx.`;

const wpCode = `<!-- Add via a plugin like "Insert Headers and Footers",
     or paste directly into your theme's footer.php
     just before wp_footer(); -->

<script
  src="https://agent.kiteum.com/widget.js"
  data-slug="kiteum"   // 👈 your slug
  data-accent-color="#2B4EFF"
  async
></script>`;

const frameworks = [
  { id: "html", label: "HTML", code: htmlCode, file: "index.html" },
  { id: "react", label: "React", code: reactCode, file: "ChatWidgetLoader.jsx" },
  { id: "angular", label: "Angular", code: angularCode, file: "contact.component.ts" },
  { id: "next", label: "Next.js", code: nextCode, file: "ChatWidgetLoader.tsx" },
  { id: "wp", label: "WordPress", code: wpCode, file: "footer.php" },
] as const;

const attributesTable = [
  { attr: "data-slug", required: true, desc: "Your Agent's slug. Copy it from your Dashboard — see step 1." },
  { attr: "data-accent-color", required: false, desc: "Hex color for the widget's accent (buttons, header). Defaults to #2B4EFF." },
];

function FrameworkTabs() {
  const [tab, setTab] = useState<(typeof frameworks)[number]["id"]>("html");
  const active = frameworks.find((f) => f.id === tab)!;

  return (
    <div>
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-slate-100 w-fit flex-wrap">
        {frameworks.map((f) => (
          <button
            key={f.id}
            onClick={() => setTab(f.id)}
            className={`px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all
              ${tab === f.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <CodeBlock code={active.code} label={active.file} />
    </div>
  );
}

const sections = [
  {
    id: "get-slug",
    title: "1. Find your slug",
    icon: FiSettings,
    body: (
      <p className="text-[14.5px] text-slate-500 leading-[1.85]">
        Your slug is created when you set up your account, and you choose it yourself — for example{" "}
        <code className="px-1.5 py-0.5 rounded bg-slate-100 text-[13px] text-slate-700">kiteum</code>{" "}
        rather than a random string. You can find it any time on your{" "}
        <strong className="text-slate-700">Dashboard</strong>, and it's also listed under{" "}
        <strong className="text-slate-700">Settings</strong> in the{" "}
        <strong className="text-slate-700">Slug</strong> column, where you can update it later if you want to
        change it. Copy it — every code snippet below has a{" "}
        <code className="px-1.5 py-0.5 rounded bg-slate-100 text-[13px] text-slate-700">data-slug</code>{" "}
        line marked <strong className="text-slate-700">👈 your slug</strong> — swap in your own value there before
        you install.
      </p>
    ),
  },
  {
    id: "choose-pages",
    title: "2. Decide which pages get the widget",
    icon: FiLayers,
    body: (
      <p className="text-[14.5px] text-slate-500 leading-[1.85]">
        The widget can either be added site-wide so that it automatically loads on every route, or placed selectively on individual pages (such as Home, Contact, or Pricing) depending on your design setup.
      </p>
    ),
  },
  {
    id: "install",
    title: "3. Install the widget",
    icon: FiCode,
    body: (
      <>
        <p className="text-[14.5px] text-slate-500 leading-[1.85] mb-4">
          Pick your platform below — the code shown only applies to that one, so you don't have to sort through
          setup instructions that don't apply to your project. If your site is plain HTML, the{" "}
          <strong className="text-slate-700">HTML</strong> tab is all you need — just one script tag, no build
          step required. Remember to swap the <code className="px-1 py-0.5 rounded bg-white border border-slate-200 text-[12.5px]">data-slug</code>{" "}
          value for your own slug from step 1 in whichever snippet you use.
        </p>
        <FrameworkTabs />
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5 space-y-2">
          <p className="text-[13.5px] text-slate-600 leading-relaxed">
            <strong className="text-slate-800">HTML:</strong> Paste the script tag near the end of your template,
            just before the closing{" "}
            <code className="px-1 py-0.5 rounded bg-white border border-slate-200 text-[12.5px]">&lt;/body&gt;</code>{" "}
            tag inside your main <code className="px-1 py-0.5 rounded bg-white border border-slate-200 text-[12.5px]">index.html</code> file to instantly load it globally.
          </p>
          <p className="text-[13.5px] text-slate-600 leading-relaxed">
            <strong className="text-slate-800">React:</strong> To prevent inline hooks cluttering your interface layouts, we recommend creating a clean component called <code className="px-1 py-0.5 rounded bg-white border border-slate-200 text-[12.5px]">ChatWidgetLoader.jsx</code>. You can mount it globally inside your root <code className="px-1 py-0.5 rounded bg-white border border-slate-200 text-[12.5px]">App.jsx</code> file to load it instantly across all screens, or explicitly within targeted sections.
          </p>
          <p className="text-[13.5px] text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Angular:</strong> Manage the code globally or locally via lifecycle mounts. The script is safely attached within{" "}
            <code className="px-1 py-0.5 rounded bg-white border border-slate-200 text-[12.5px]">ngOnInit</code>{" "}
            and cleaned up during{" "}
            <code className="px-1 py-0.5 rounded bg-white border border-slate-200 text-[12.5px]">ngOnDestroy</code>. For an automated site-wide setup, drop this routine direct into your root <code className="px-1 py-0.5 rounded bg-white border border-slate-200 text-[12.5px]">app.component.ts</code> file.
          </p>
          <p className="text-[13.5px] text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Next.js:</strong> Since modern single-page framework routing doesn't carry a basic static body index, we recommend bypassing raw scripts that could create duplicate widget bundles during hot-reloads. Instead, build a dedicated component called{" "}
            <code className="px-1 py-0.5 rounded bg-white border border-slate-200 text-[12.5px]">ChatWidgetLoader.tsx</code>. Include this single component directly inside your root layout (e.g., <code className="px-1 py-0.5 rounded bg-white border border-slate-200 text-[12.5px]">app/layout.tsx</code>) right within the main body layout to dynamically initialize the chat window everywhere.
          </p>
          <p className="text-[13.5px] text-slate-600 leading-relaxed">
            <strong className="text-slate-800">WordPress:</strong> Use a plugin like{" "}
            <strong>Insert Headers and Footers</strong> to paste the snippet without editing theme files, or add
            it directly to your theme's <code className="px-1 py-0.5 rounded bg-white border border-slate-200 text-[12.5px]">footer.php</code>{" "}
            just before the closing footer action hook.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "configuration",
    title: "4. Configuration options",
    icon: FiSliders,
    body: (
      <div className="overflow-x-auto">
        <table className="w-full text-[13.5px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2.5 pr-4 font-semibold text-slate-700">Attribute</th>
              <th className="text-left py-2.5 pr-4 font-semibold text-slate-700">Required</th>
              <th className="text-left py-2.5 font-semibold text-slate-700">What it does</th>
            </tr>
          </thead>
          <tbody>
            {attributesTable.map((row) => (
              <tr key={row.attr} className="border-b border-slate-100">
                <td className="py-3 pr-4">
                  <code className="px-1.5 py-0.5 rounded bg-slate-100 text-[12.5px] text-slate-700">{row.attr}</code>
                </td>
                <td className="py-3 pr-4 text-slate-500">{row.required ? "Yes" : "No"}</td>
                <td className="py-3 text-slate-500 leading-relaxed">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
];

export default function DocsPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      {/* ── Hero ── */}
      <section className="bg-[#f8fafc] border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-[#1d4ed8]/10">
              <FiCode className="w-4 h-4 text-[#1d4ed8]" />
            </div>
            <span className="text-[12px] font-bold tracking-widest text-slate-500 uppercase">Documentation</span>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Add the widget to your site
          </h1>
          <p className="text-[16px] text-slate-500 leading-relaxed max-w-2xl">
            A step-by-step guide to installing your Kiteum Agent widget on a plain HTML site, or in React, Angular,
            Next.js, or WordPress. Takes about 5 minutes.
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-8 lg:h-fit">
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Steps</p>
              </div>
              <ul className="p-2 space-y-0.5">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={() => setActive(s.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150
                        ${active === s.id
                          ? 'bg-[#eff6ff] text-[#1d4ed8] font-semibold'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                      <s.icon className="w-3.5 h-3.5 flex-shrink-0" />
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-6">
            {sections.map((section, i) => (
              <div
                key={section.id}
                id={section.id}
                className="rounded-xl border border-slate-200 overflow-hidden scroll-mt-8"
              >
                <div className="flex items-center gap-3 px-7 py-4 bg-slate-50 border-b border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-[#1d4ed8]/10 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-4 h-4 text-[#1d4ed8]" />
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[12px] font-bold text-slate-300">{String(i + 1).padStart(2, '0')}</span>
                    <h2 className="text-[16px] font-semibold text-slate-900">{section.title}</h2>
                  </div>
                </div>
                <div className="px-7 py-6">{section.body}</div>
              </div>
            ))}

            {/* Contact note */}
            <div className="rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-7 py-5 flex items-start gap-3">
  <FiMail className="w-4 h-4 text-[#1d4ed8] mt-0.5 flex-shrink-0" />
  <p className="text-[13.5px] text-[#1e40af] leading-relaxed">
    Stuck on installation? Email <strong>support@kiteum.com</strong> or chat with AI by clicking on the icon in the bottom right with your site URL and we'll help you get it live.
  </p>
</div>
          </div>
        </div>
      </section>
    </main>
  );
}