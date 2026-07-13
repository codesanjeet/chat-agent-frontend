import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Agent.Kiteum",
  description:
    "How Agent.Kiteum collects, uses, and protects information from business owners and their customers.",
};

const sections = [
  {
    title: "1. Who We Are",
    body: (
      <>
        <p className="mb-3">
          Agent.Kiteum ("Kiteum", "we", "us", or "our") builds an AI chat agent that businesses — clinics, schools,
          restaurants, salons, gyms, real estate agencies, and similar small businesses — embed on their website, share
          as a link, or place as a QR code so their customers can ask questions, book appointments, and get answers
          automatically.
        </p>
        <p className="mb-3">
          This Privacy Policy explains what we collect and how we use it in two different contexts: (a) when you are a{" "}
          <strong>business owner</strong> signing up for or using Agent.Kiteum, and (b) when you are an{" "}
          <strong>end customer</strong> chatting with a business's AI Agent that is powered by Agent.Kiteum.
        </p>
      </>
    ),
  },
  {
    title: "2. Information We Collect",
    body: (
      <>
        <p className="mb-2 font-semibold text-ink">From business owners (waitlist &amp; account holders)</p>
        <ul className="mb-4 list-disc space-y-2 pl-5">
          <li>Full name and business name</li>
          <li>Email address and phone number</li>
          <li>Business type, services, timings, pricing, and other business details you provide to train your Agent</li>
          <li>Documents you upload (menus, fee charts, brochures, price lists) so the Agent can answer from them</li>
          <li>Billing information, where applicable, processed via our payment processor</li>
        </ul>
        <p className="mb-2 font-semibold text-ink">From end customers chatting with an Agent</p>
        <ul className="mb-3 list-disc space-y-2 pl-5">
          <li>The messages you send to the Agent and the Agent's replies (chat transcripts)</li>
          <li>Name, phone number, and/or email address, when you share them to book an appointment or make an enquiry</li>
          <li>Appointment, order, or reservation details you provide (e.g., preferred date, time, service requested)</li>
          <li>Basic technical data such as device type, browser, and approximate location, used for security and to keep the chat working correctly</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. How We Use Your Information",
    body: (
      <>
        <p className="mb-3">We use the information above to:</p>
        <ul className="mb-3 list-disc space-y-2 pl-5">
          <li>Operate the Agent — answer customer questions, and create, confirm, or cancel bookings on behalf of a business</li>
          <li>Train and configure a business's Agent on that business's own information (business data is not used to answer another business's customers)</li>
          <li>Notify business owners by email or phone when a customer books, enquires, or leaves their contact details</li>
          <li>Provide the dashboard where business owners review conversations and leads</li>
          <li>Respond to support requests and set up new accounts during onboarding calls</li>
          <li>Send product updates, early-access perks, and service announcements to business owners who join our waitlist</li>
          <li>Monitor, secure, and improve the reliability and accuracy of the Agent</li>
        </ul>
        <p className="mb-3">
          We do not use a business's customer conversations to train or improve any other business's Agent, and we do
          not use chat content to build advertising profiles.
        </p>
      </>
    ),
  },
  {
    title: "4. Data Sharing",
    body: (
      <>
        <p className="mb-3">We do not sell, rent, or trade your personal information to third parties.</p>
        <p className="mb-3">We do share limited information with:</p>
        <ul className="mb-3 list-disc space-y-2 pl-5">
          <li>The specific business you are chatting with, so they can respond to your enquiry, confirm a booking, or follow up with you</li>
          <li>Infrastructure and AI-model providers that power the Agent's conversations, strictly to generate and deliver responses</li>
          <li>Cloud hosting, analytics, email/SMS, and payment providers that help us run the service</li>
          <li>Authorities, if required by law, or to protect the rights, safety, or property of Agent.Kiteum, a business, or their customers</li>
        </ul>
        <p className="mb-3">
          If Agent.Kiteum is ever involved in a merger, acquisition, or asset sale, customer information may be
          transferred as part of that transaction, subject to the same commitments described in this policy.
        </p>
      </>
    ),
  },
  {
    title: "5. Data Retention",
    body: (
      <p className="mb-3">
        We keep chat transcripts and lead details for as long as the business's account is active, so they can follow
        up with customers and review past conversations, and for a reasonable period afterward for backups, fraud
        prevention, and legal compliance. Waitlist and account information is kept until you ask us to delete it or
        your account is closed and any retention obligations have passed.
      </p>
    ),
  },
  {
    title: "6. Data Security",
    body: (
      <p className="mb-3">
        We use industry-standard safeguards — including encryption in transit, access controls, and restricted
        internal access — to protect information from unauthorized access, disclosure, alteration, or misuse. No
        method of transmission or storage is completely secure, so we cannot guarantee absolute security, but we work
        to continuously improve our practices.
      </p>
    ),
  },
  {
    title: "7. Cookies & Similar Technologies",
    body: (
      <p className="mb-3">
        Our website and the Agent chat widget use essential cookies and similar technologies to keep a conversation
        session working correctly and to remember basic preferences. We may also use privacy-respecting analytics to
        understand overall usage patterns and improve the product. We do not use cookies to serve third-party
        advertising.
      </p>
    ),
  },
  {
    title: "8. Children's Privacy",
    body: (
      <p className="mb-3">
        Agent.Kiteum is intended for use by business owners and their adult customers. Some of our business clients
        (such as schools) may involve conversations from parents or guardians on behalf of a minor; in these cases, we
        expect the school or institution to have appropriate consent to share the student's relevant details with us.
        We do not knowingly collect personal information directly from children for our own marketing purposes.
      </p>
    ),
  },
  {
    title: "9. Your Rights & Choices",
    body: (
      <>
        <p className="mb-3">Depending on your location, you may have the right to:</p>
        <ul className="mb-3 list-disc space-y-2 pl-5">
          <li>Request access to the personal information we hold about you</li>
          <li>Ask us to correct inaccurate information</li>
          <li>Request deletion of your information, subject to legal or contractual retention needs</li>
          <li>Opt out of marketing emails at any time using the unsubscribe link, or by contacting us directly</li>
        </ul>
        <p className="mb-3">
          If you are a customer who chatted with a business's Agent and want your conversation data removed, you can
          contact either that business directly or us, and we will coordinate the request.
        </p>
      </>
    ),
  },
  {
    title: "10. Changes to This Policy",
    body: (
      <p className="mb-3">
        We may update this Privacy Policy as our product evolves. If we make material changes, we will update the
        "Last Updated" date below and, where appropriate, notify business owners directly. Continued use of
        Agent.Kiteum after changes take effect means you accept the revised policy.
      </p>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-surface font-body text-ink">
      <div className="mx-auto max-w-[900px] px-5 py-14 sm:py-16">
        <div className="rounded-[20px] bg-white p-6 shadow-lg2 sm:p-10">
          <div className="mb-2.5 font-display text-2xl font-extrabold text-blue">Agent.Kiteum</div>
          <h1 className="mb-2.5 font-display text-3xl font-extrabold sm:text-[42px]">Privacy Policy</h1>
          <p className="mb-10 text-ink-3">Last Updated: July 6, 2026</p>

          <p className="mb-3 leading-relaxed">
            At Agent.Kiteum, we respect your privacy and are committed to protecting the personal information of both
            the businesses that use our AI Agent and the customers who chat with it. This policy explains what we
            collect, why we collect it, and the choices you have.
          </p>

          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="mb-3 mt-9 text-xl font-bold text-ink">{s.title}</h2>
              <div className="leading-relaxed">{s.body}</div>
            </div>
          ))}

          <h2 className="mb-3 mt-9 text-xl font-bold text-ink">11. Contact Us</h2>
          <p className="mb-3 leading-relaxed">
            If you have any questions regarding this Privacy Policy, or want to exercise any of the rights described
            above, please contact us at:
          </p>
          <p className="mb-3 leading-relaxed">
            Email:{" "}
            <a href="mailto:service@kiteum.com" className="text-blue hover:underline">
              service@kiteum.com
            </a>
          </p>

          <div className="mt-10 text-center text-sm text-ink-3">© 2026 Agent.Kiteum. All Rights Reserved.</div>
        </div>
      </div>
    </div>
  );
}