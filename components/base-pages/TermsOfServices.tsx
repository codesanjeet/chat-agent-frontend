"use client";

import { useState } from "react";
import {
  FiFileText, FiUsers, FiCreditCard, FiZap, FiAlertTriangle,
  FiShield, FiSlash, FiMail, FiGlobe, FiXCircle,
  FiRefreshCw, FiBookOpen,
} from "react-icons/fi";

const sections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    icon: FiBookOpen,
    content: [
      "These Terms of Service ('Terms') govern access to and use of Kiteum Agent (the 'Platform'), operated by Kiteum ('Kiteum', 'we', 'our'). By creating an account, or by using the Platform in any way, the business and any individual acting on its behalf agree to be bound by these Terms.",
      "If you do not agree to these Terms, you must not register for or use the Platform. If you are agreeing on behalf of a business, you confirm that you have the authority to bind that business to these Terms.",
    ],
  },
  {
    id: "service-description",
    title: "Description of Service",
    icon: FiUsers,
    content: [
      "Kiteum Agent is an AI-native platform that lets a business set up an AI Agent to answer questions from its customers and visitors. Depending on the plan, this includes a QR code and hosted business page, a website chat widget, appointment booking, lead collection, and a dashboard for managing the Agent.",
      "The Platform is provided on a subscription basis with multiple plans (Free, Basic, Pro, and Business), each with different limits on conversations, AI credits, email notifications, document storage, and features, as described on agent.kiteum.com/pricing.",
      "Kiteum may add, change, or remove features of the Platform at any time. We will make reasonable efforts to notify businesses of material changes that affect their plan.",
    ],
  },
  {
    id: "account",
    title: "Account Registration & Responsibilities",
    icon: FiShield,
    content: [
      "To use the Platform, a business must register for an account and provide accurate information, including business name, contact details, and billing information where applicable.",
      "The business is responsible for maintaining the confidentiality of its account credentials and for all activity that occurs under its account, including actions taken by staff it authorises to use the Platform.",
      "The business must promptly notify Kiteum of any unauthorised use of its account or any other security breach it becomes aware of.",
    ],
  },
  {
    id: "billing-credits",
    title: "Subscription Plans, Billing & AI Credits",
    icon: FiCreditCard,
    content: [
      "Each paid plan is billed on a recurring monthly basis at the price listed on agent.kiteum.com/pricing, unless otherwise agreed in writing. Prices are subject to change with reasonable prior notice.",
      "Any promotional offer (such as a free period for a specific plan during a specific month) applies only as described at the time it is offered, and reverts to standard billing at the end of the promotional period unless the business cancels beforehand.",
      "Fees are non-refundable except where required by law or expressly stated otherwise. A business may cancel its subscription at any time; cancellation takes effect at the end of the current billing cycle.",
    ],
  },
  {
    id: "ai-credits-estimate",
    title: "AI Credits & Conversation Estimates — Please Read",
    icon: FiZap,
    content: [
      "Each plan is described with an estimated number of conversations per month (for example, ~50 for Free, ~140 for Basic, ~350 for Pro, ~800 for Business). This number is an estimate only, calculated using an average conversation length, and is provided purely as guidance to help a business choose a plan.",
      "Actual usage is metered in AI credits, not in a fixed conversation count. Every message exchanged, and every piece of content the Agent needs to process to respond, consumes credits. Longer, more detailed, or more complex conversations consume more credits than shorter ones.",
      "As a direct result, if a business's actual conversations tend to be longer or more complex than the average used to calculate the estimate, the actual number of conversations it can support within its monthly credit allowance may be lower than the estimate shown for its plan. Kiteum does not guarantee that the estimated conversation count will be achieved in every case.",
      "If a business exhausts its monthly AI credits, its Agent may stop responding, respond with reduced functionality, or the business may be offered the option to purchase additional credits or upgrade its plan, depending on what Kiteum makes available at the time.",
    ],
  },
  {
    id: "content-public-exposure",
    title: "Content You Provide Is Public-Facing",
    icon: FiAlertTriangle,
    content: [
      "The Agent answers customer and visitor questions using the information the business uploads — including business details, menus, brochures, pricing, FAQs, and other documents. By uploading this content, the business acknowledges and agrees that it will be surfaced, in whole or in part, to any customer or visitor who interacts with its Agent through the QR code, hosted business page, or website chat widget.",
      "The business must not upload any information it considers confidential, sensitive, or proprietary and does not want disclosed to the public. Kiteum is not liable for the disclosure of any content the business chooses to upload for use by its Agent.",
      "Lead and enquiry details submitted by a visitor through the Agent (such as name, phone number, or email) are shared only with the business that owns the Agent, and are handled as described in our Privacy Policy.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    icon: FiSlash,
    content: [
      "The business agrees not to use the Platform to upload unlawful, defamatory, fraudulent, or misleading content, or to impersonate any person or entity.",
      "The business agrees not to attempt to reverse-engineer, disrupt, or gain unauthorised access to the Platform, or to use the Platform to send spam or unsolicited communications.",
      "Kiteum may suspend or terminate an account that it reasonably believes violates this section, with notice to the business where practicable.",
    ],
  },
  {
    id: "ai-accuracy",
    title: "AI-Generated Responses",
    icon: FiRefreshCw,
    content: [
      "The Agent generates responses using artificial intelligence based on the content a business has provided and general knowledge. Responses may occasionally be inaccurate, incomplete, or out of date, and Kiteum does not guarantee the accuracy of any AI-generated response.",
      "The business is responsible for reviewing the content it uploads and for monitoring conversations where accuracy is important (for example, pricing or availability), and should not rely on the Agent as the sole source of information for decisions with legal, financial, or safety consequences.",
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    icon: FiFileText,
    content: [
      "Kiteum retains all rights, title, and interest in the Platform itself, including its software, design, and branding. Nothing in these Terms transfers ownership of the Platform to any business.",
      "The business retains ownership of the content it uploads (business information, documents, menus, brochures) and of the leads it collects, as set out in our Privacy Policy.",
    ],
  },
  {
    id: "disclaimers-liability",
    title: "Disclaimers & Limitation of Liability",
    icon: FiXCircle,
    content: [
      "The Platform is provided 'as is' and 'as available'. To the maximum extent permitted by law, Kiteum disclaims all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.",
      "To the maximum extent permitted by law, Kiteum's total liability arising out of or relating to these Terms or use of the Platform will not exceed the amount paid by the business to Kiteum in the three months preceding the claim.",
      "Kiteum is not liable for indirect, incidental, or consequential damages, including loss of profits, data, or business opportunities, arising from use of the Platform.",
    ],
  },
  {
    id: "termination",
    title: "Termination",
    icon: FiSlash,
    content: [
      "Either party may terminate the agreement at any time, subject to any notice period specified in the applicable plan. Kiteum may suspend or terminate an account immediately for a material breach of these Terms.",
      "On termination, the business's access to the Platform ends, and data will be handled in accordance with the retention and deletion terms in our Privacy Policy.",
    ],
  },
  {
    id: "international",
    title: "Governing Law",
    icon: FiGlobe,
    content: [
      "These Terms are governed by the laws of India. Any dispute arising out of or relating to these Terms will be subject to the exclusive jurisdiction of the courts located in India.",
    ],
  },
  {
    id: "changes-contact",
    title: "Changes to These Terms",
    icon: FiRefreshCw,
    content: [
      "Kiteum may update these Terms from time to time. When changes are made, the updated Terms will be posted at agent.kiteum.com/terms with a revised 'Last Updated' date. For material changes, Kiteum will notify registered businesses by email or in-Platform notice at least 14 days before the changes take effect. Continued use of the Platform after changes take effect constitutes acceptance of the updated Terms.",
    ],
  },
];

export default function TermsOfServicePage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      {/* ── Hero ── */}
      <section className="bg-[#f8fafc] border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-[#1d4ed8]/10">
              <FiFileText className="w-4 h-4 text-[#1d4ed8]" />
            </div>
            <span className="text-[12px] font-bold tracking-widest text-slate-500 uppercase">Legal Agreement</span>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-[16px] text-slate-500 leading-relaxed max-w-2xl mb-6">
            These Terms of Service govern the use of Kiteum Agent by businesses and their staff. Please read them carefully, especially the sections on AI credits and on content you provide to your Agent.
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
                  Plan conversation counts are estimates only — long conversations use more AI credits, so your actual usage may fall below the listed estimate. Anything you upload for your Agent may be shown to the public.
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
                Welcome to Kiteum Agent. These Terms of Service ('Terms') form a binding agreement between Kiteum ('Kiteum', 'we', 'our') and any business ('you', 'your') that registers for or uses the Platform, accessible at agent.kiteum.com and related subdomains. We are a young company, we build in the open, and we ship improvements every week — these Terms are written to be as clear and direct as the product itself.
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
                Questions about these Terms? Contact us at <strong>support@kiteum.com</strong> or visit <strong>agent.kiteum.com/contact</strong>. We respond within 1–2 business days.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}