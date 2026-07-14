import { FaCheck, FaStar } from "react-icons/fa6";
import { Reveal } from "./Reveal";
import { whyProblems, whySolutions, plans } from "@/components/lib/data";

export function PricingSection({ onContactClick }: { onContactClick: () => void }) {
  return (
    <>
      {/* Why us */}
      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue-600">Why Agent.Kiteum</div>
              <h2 className="mb-3.5 font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[2.5rem]">
                Most businesses lose customers before saying hello
              </h2>
              <p className="mb-8 max-w-[540px] text-base leading-loose text-slate-600">
                Every missed call, every unanswered message, every slow reply — that&apos;s a customer who chose your
                competitor. Here&apos;s what&apos;s really happening:
              </p>
            </Reveal>
            <Reveal className="flex flex-col gap-3">
              {whyProblems.map((p) => (
                <div key={p.title} className="flex items-start gap-3.5 rounded-xl bg-white p-4.5 px-5 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
                  <div className="mt-0.5 flex-shrink-0 text-lg text-red-500">{p.icon}</div>
                  <div>
                    <div className="mb-1 text-[0.88rem] font-bold text-slate-900">{p.title}</div>
                    <div className="text-[0.79rem] leading-relaxed text-slate-600">{p.desc}</div>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>

          <div>
            <Reveal className="mb-4 text-xs font-bold uppercase tracking-[1.2px] text-emerald-600">
              Kiteum Agent solves all of this
            </Reveal>
            <Reveal className="flex flex-col gap-3">
              {whySolutions.map((s) => (
                <div key={s.title} className="flex items-start gap-3.5 rounded-xl bg-emerald-50 p-4.5 px-5 shadow-sm">
                  <div className="mt-0.5 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[0.65rem] font-extrabold text-white">
                    <FaCheck className="h-2.5 w-2.5" />
                  </div>
                  <div>
                    <div className="mb-1 text-[0.88rem] font-bold text-emerald-900">{s.title}</div>
                    <div className="text-[0.79rem] leading-relaxed text-emerald-800">{s.desc}</div>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-24" id="pricing">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue-600">Pricing</div>
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[2.5rem]">
              Start free. Upgrade when you&apos;re ready.
            </h2>
            <p className="mx-auto mt-3.5 max-w-[540px] text-base leading-loose text-slate-600">
              No hidden charges. No setup fees. No long contracts. Cancel anytime.
            </p>
          </Reveal>

          <div className="mx-auto mt-14 grid max-w-[420px] gap-5 lg:max-w-none lg:grid-cols-3">
            {plans.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.1}>
                <div
                  className={`relative h-full rounded-2xl bg-white p-8 px-7 transition-all hover:-translate-y-1 ${
                    p.popular
                      ? "shadow-[0_24px_50px_-16px_rgba(37,99,235,0.35)] ring-2 ring-blue-600 lg:scale-[1.03]"
                      : "shadow-[0_2px_10px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_36px_-12px_rgba(15,23,42,0.18)]"
                  }`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-600 px-4 py-1 text-[0.7rem] font-bold text-white shadow-md">
                      <FaStar className="mr-1 inline h-2.5 w-2.5 -translate-y-px" /> Most Popular
                    </div>
                  )}
                  <div className="mb-3 text-[0.72rem] font-bold uppercase tracking-[1.5px] text-slate-500">{p.name}</div>
                  <div className="font-display text-[2.6rem] font-black leading-none tracking-tight text-slate-900">
                    {p.price} <span className="text-base font-medium tracking-normal text-slate-500">/ month</span>
                  </div>
                  <div className="mb-1.5 mt-1.5 text-sm font-semibold text-slate-700">{p.convos}*</div>
                  <div className="mb-5 border-b border-slate-100 pb-5 text-[0.76rem] text-slate-500">{p.credits}</div>
                  <div className="mb-6 flex flex-col gap-2.5">
                    {p.feats.map((f) => (
                      <div key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <FaCheck className="mt-1 h-3 w-3 flex-shrink-0 text-emerald-600" /> {f}
                      </div>
                    ))}
                  </div>
                  <a
                    href="/login"
                    className={
                      p.popular
                        ? "block w-full rounded-lg bg-blue-600 py-3.5 text-center text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                        : "block w-full rounded-lg bg-slate-100 py-3.5 text-center text-sm font-bold text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700"
                    }
                  >
                    {p.cta}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="mx-auto mt-6 max-w-[620px] text-center text-[0.78rem] leading-relaxed text-slate-500">
            *Conversation counts are an average estimate calculated from each plan&apos;s AI credit allowance at typical
            conversation length. Your actual number may be lower if conversations run long or cover a lot of detail,
            or higher for short, simple chats.
          </p>
          <p className="mt-4 text-center text-[0.83rem] text-slate-600">
            🎁 New sign-ups get <strong className="font-semibold text-slate-900">1 month free</strong> on the Pro
            plan.{" "}
            <button onClick={onContactClick} className="font-semibold text-blue-600 hover:text-blue-700">
              Have a question? Contact us →
            </button>
          </p>
        </div>
      </section>
    </>
  );
}