import { Reveal } from "./Reveal";
import { problemCards, steps, features } from "@/components/lib/data";

export function ValueProps() {
  return (
    <>
      {/* Problem */}
      <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-24" id="problem">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue-600">The Problem</div>
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[2.5rem]">
              Your customers ask the same questions every day
            </h2>
            <p className="mx-auto mt-3.5 max-w-[540px] text-base leading-loose text-slate-600">
              Your staff repeats the same answers 20 times a day. And when they are busy or off-hours, customers go
              unanswered — and choose someone else.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {problemCards.map((p, i) => (
              <Reveal key={p.biz} delay={i * 0.08}>
                <div className="h-full rounded-2xl bg-white p-7 shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_-12px_rgba(15,23,42,0.18)]">
                  <div className="mb-3.5 text-2xl text-slate-700">{p.icon}</div>
                  <div className="mb-2.5 text-[0.7rem] font-bold uppercase tracking-[1.2px] text-slate-500">{p.biz}</div>
                  <div className="mb-3 rounded-lg bg-amber-50 px-3.5 py-2.5 text-[0.93rem] font-bold leading-relaxed text-slate-900 shadow-[inset_3px_0_0_0_#f59e0b]">
                    {p.q}
                  </div>
                  <p className="mb-4 text-[0.8rem] leading-relaxed text-slate-600">{p.desc}</p>
                  <div className="rounded-xl bg-emerald-50 p-3.5 shadow-inner">
                    <div className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-wide text-emerald-700">
                      ✦ Kiteum Agent answers instantly
                    </div>
                    <p className="text-[0.82rem] leading-relaxed text-emerald-900">{p.ai}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 py-16 sm:px-8 sm:py-24" id="how">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue-600">How It Works</div>
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[2.5rem]">
              Set up in under 10 minutes
            </h2>
            <p className="mx-auto mt-3.5 max-w-[540px] text-base leading-loose text-slate-600">
              No coding. No technical skills required. If you can fill a form and share a link, you can set this up
              today.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08} className="relative">
                <div className="relative h-full rounded-2xl bg-white p-7 px-5 text-center shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_-12px_rgba(15,23,42,0.18)]">
                  {i < steps.length - 1 && (
                    <div className="absolute right-[-12px] top-[38px] hidden h-0.5 w-6 bg-blue-200 lg:block" />
                  )}
                  <div className="mx-auto mb-4 flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-blue-50 font-display text-sm font-extrabold text-blue-700 shadow-sm">
                    {i + 1}
                  </div>
                  <div className="mb-3 flex justify-center text-xl text-blue-600">{s.icon}</div>
                  <div className="mb-2 text-sm font-bold text-slate-900">{s.title}</div>
                  <div className="text-[0.8rem] leading-relaxed text-slate-600">{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-24" id="features">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue-600">Features</div>
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[2.5rem]">
              Everything your business needs
            </h2>
            <p className="mx-auto mt-3.5 max-w-[540px] text-base leading-loose text-slate-600">
              One AI Agent that handles customer conversations end to end — so your team can focus on the work that
              really matters.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 5) * 0.06}>
                <div className="h-full rounded-2xl bg-white p-6 px-4 text-center shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:bg-blue-50 hover:shadow-[0_14px_30px_-10px_rgba(37,99,235,0.25)]">
                  <div className="mb-3 flex justify-center text-xl text-blue-600">{f.icon}</div>
                  <div className="mb-1.5 text-[0.85rem] font-bold text-slate-900">{f.title}</div>
                  <div className="text-[0.76rem] leading-relaxed text-slate-600">{f.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}