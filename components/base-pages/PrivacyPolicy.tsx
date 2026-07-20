"use client";

import { useState } from "react";
import {
  FiFileText, FiUsers, FiDatabase, FiEye, FiLock,
  FiShare2, FiClock, FiUserCheck, FiGlobe, FiMail,
  FiRefreshCw, FiShield, FiAlertTriangle,
} from "react-icons/fi";

const sections = [
  {
    id: "scope",
    title: "Scope of This Policy",
    icon: FiFileText,
    content: [
      "This Privacy Policy ('Policy') explains how Kiteum ('Kiteum', 'we', 'our') collects, uses, shares, and protects information in connection with Kiteum Agent (the 'Platform'), operated at agent.kiteum.com and related subdomains.",
      "This Policy applies to two kinds of people: businesses that register for and manage an account on the Platform ('Business', 'you'), and the customers or visitors who interact with a Business's AI Agent through a QR code, hosted business page, or website chat widget ('Visitors'). Where relevant, this Policy distinguishes between the two.",
      "This Policy should be read together with our Terms of Service. If you do not agree with this Policy, you must not use the Platform.",
    ],
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    icon: FiDatabase,
    content: [
      "Account information: when a Business registers, we collect business name, contact details, email address, and billing information where a paid plan is selected.",
      "Content you upload: business details, menus, brochures, pricing, FAQs, and other documents that a Business provides to configure its Agent. This content is used to power the Agent's responses and, as explained in our Terms of Service, is surfaced to Visitors who interact with the Agent.",
      "Conversation data: messages exchanged between a Visitor and an Agent, including timestamps and metadata, are stored so that a Business can review conversations, and so Kiteum can operate, monitor credit usage, and improve the Platform.",
      "Lead and enquiry details: when a Visitor voluntarily submits information through the Agent, such as name, phone number, or email address, this is collected and stored so it can be shared with the Business that owns the Agent.",
      "Usage and device data: we automatically collect limited technical information such as IP address, browser type, device type, and general usage patterns (for example, pages visited or features used) to operate and secure the Platform.",
    ],
  },
  {
    id: "how-we-use",
    title: "How We Use Information",
    icon: FiEye,
    content: [
      "To provide, maintain, and improve the Platform, including generating AI Agent responses, tracking AI credit usage, and enabling features such as appointment booking and lead collection.",
      "To communicate with a Business about its account, billing, plan usage, and material changes to the Platform or these policies.",
      "To detect, prevent, and address fraud, abuse, security incidents, or violations of our Terms of Service.",
      "To analyse aggregated, non-identifying usage trends so we can improve the Platform's performance and features. Kiteum does not sell personal information to third parties.",
    ],
  },
  {
    id: "ai-processing",
    title: "AI Processing of Your Content",
    icon: FiAlertTriangle,
    content: [
      "To generate Agent responses, the content a Business uploads and the messages exchanged in a conversation are processed by artificial intelligence models, which may include third-party AI model providers operating under their own data processing terms.",
      "As set out in our Terms of Service, any content a Business uploads for use by its Agent should be treated as public-facing, since it may be surfaced in whole or in part to any Visitor who interacts with the Agent. Businesses should not upload confidential, sensitive, or proprietary information they do not want disclosed.",
      "Kiteum does not use a Business's uploaded content or conversation data to train AI models for the benefit of other businesses.",
    ],
  },
  {
    id: "sharing",
    title: "How Information Is Shared",
    icon: FiShare2,
    content: [
      "Lead and enquiry details submitted by a Visitor are shared only with the Business that owns the Agent through which they were submitted. Kiteum does not sell or rent this information to unrelated third parties.",
      "We share information with service providers who help us operate the Platform, such as hosting providers, payment processors, email delivery services, and AI model providers, solely to the extent needed to provide the Platform.",
      "We may disclose information where required by law, regulation, legal process, or a valid governmental request, or where necessary to protect the rights, property, or safety of Kiteum, our users, or the public.",
      "If Kiteum is involved in a merger, acquisition, or sale of assets, information may be transferred as part of that transaction, subject to this Policy or a policy offering at least equivalent protection.",
    ],
  },
  {
    id: "retention",
    title: "Data Retention & Deletion",
    icon: FiClock,
    content: [
      "We retain account information, uploaded content, and conversation data for as long as the account remains active, and for a reasonable period afterward to comply with legal obligations, resolve disputes, and enforce our agreements.",
      "On termination of an account, as described in our Terms of Service, a Business's access to the Platform ends and associated data is deleted or anonymised within a reasonable period, except where retention is required by law.",
      "A Business may request deletion of specific uploaded content or Visitor lead data at any time by contacting us, subject to any legal or operational retention requirements.",
    ],
  },
  {
    id: "security",
    title: "Data Security",
    icon: FiLock,
    content: [
      "We use reasonable administrative, technical, and physical safeguards designed to protect information from unauthorised access, disclosure, alteration, or destruction.",
      "No method of transmission or storage is completely secure. While we work to protect information, we cannot guarantee absolute security, and a Business is responsible for maintaining the confidentiality of its own account credentials as described in our Terms of Service.",
    ],
  },
  {
    id: "your-rights",
    title: "Your Rights & Choices",
    icon: FiUserCheck,
    content: [
      "A Business may access, correct, or update its account information at any time through its dashboard, or by contacting us directly.",
      "A Visitor who has submitted information through an Agent and wishes to access, correct, or request deletion of that information may contact the Business that owns the Agent, or contact Kiteum directly, and we will coordinate with the relevant Business as needed.",
      "Depending on applicable law, individuals may have additional rights regarding their personal information, including the right to object to certain processing or to request a copy of their data. Requests can be sent to the contact details below.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies & Similar Technologies",
    icon: FiUsers,
    content: [
      "The Platform and Agent-hosted pages use cookies and similar technologies to keep users signed in, remember preferences, and understand how the Platform and Agents are used.",
      "A Business or Visitor can control cookies through their browser settings; disabling cookies may affect certain features of the Platform or the Agent experience.",
    ],
  },
  {
    id: "children",
    title: "Children's Privacy",
    icon: FiShield,
    content: [
      "The Platform is intended for use by businesses and their staff, and is not directed at children. We do not knowingly collect personal information from children. If we become aware that a child's information has been collected without appropriate consent, we will take steps to delete it.",
    ],
  },
  {
    id: "international",
    title: "International Data & Governing Law",
    icon: FiGlobe,
    content: [
      "Kiteum is based in India, and information collected through the Platform may be stored and processed in India or other countries where our service providers operate.",
      "This Policy is governed by the laws of India, consistent with the governing law provision in our Terms of Service.",
    ],
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    icon: FiRefreshCw,
    content: [
      "Kiteum may update this Policy from time to time. When changes are made, the updated Policy will be posted at agent.kiteum.com/privacy-policy with a revised 'Last Updated' date. For material changes, we will notify registered businesses by email or in-Platform notice at least 14 days before the changes take effect. Continued use of the Platform after changes take effect constitutes acceptance of the updated Policy.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      {/* ── Hero ── */}
      <section className="bg-[#f8fafc] border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-[#1d4ed8]/10">
              <FiLock className="w-4 h-4 text-[#1d4ed8]" />
            </div>
            <span className="text-[12px] font-bold tracking-widest text-slate-500 uppercase">Legal Agreement</span>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-[16px] text-slate-500 leading-relaxed max-w-2xl mb-6">
            This Privacy Policy explains what information Kiteum Agent collects from businesses and their visitors, how it's used, and the choices you have — including how uploaded content and AI processing work.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-slate-400">
            <span>Effective: <strong className="text-slate-600">1 June 2026</strong></span>
            <span className="w-px h-4 bg-slate-200" />
            <span>Last Updated: <strong className="text-slate-600">17 July 2026</strong></span>
            <span className="w-px h-4 bg-slate-200" />
            <span>Jurisdiction: <strong className="text-slate-600">India</strong></span>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-8 lg:h-fit">
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Contents</p>
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

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2.5">
                <FiAlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-amber-700 leading-relaxed">
                  Content uploaded for your Agent may be shown to the public and is processed by AI models to generate responses.
                </p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-6">

            {/* Intro */}
            <div className="rounded-xl border border-slate-200 p-7">
              <h2 className="text-[18px] font-semibold text-slate-900 mb-3">Introduction</h2>
              <p className="text-[14.5px] text-slate-500 leading-[1.85]">
                Kiteum ('Kiteum', 'we', 'our') respects the privacy of the businesses that use Kiteum Agent and the visitors who interact with their AI Agents. This Policy describes what information we collect, why we collect it, how it's used and shared, and the choices available to you. It applies to the Platform at agent.kiteum.com and related subdomains, and should be read alongside our Terms of Service.
              </p>
            </div>

            {/* Sections */}
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
                <div className="px-7 py-6 space-y-3">
                  {section.content.map((para, j) => (
                    <p key={j} className="text-[14.5px] text-slate-500 leading-[1.85]">{para}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Contact note */}
            <div className="rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-7 py-5 flex items-start gap-3">
              <FiMail className="w-4 h-4 text-[#1d4ed8] mt-0.5 flex-shrink-0" />
              <p className="text-[13.5px] text-[#1e40af] leading-relaxed">
                Questions about this Policy, or requests to access, correct, or delete your information? Contact us at <strong>support@kiteum.com</strong> or visit <strong>agent.kiteum.com/contact</strong>. We respond within 1–2 business days.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}