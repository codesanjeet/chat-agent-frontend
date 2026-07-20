export function SiteFooter() {
  return (
    <footer className="bg-slate-950 px-5 py-16 pb-8 sm:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[2.2fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-3 font-display text-[1.05rem] font-extrabold tracking-tight text-white">
              Agent.<em className="not-italic text-sky-400">Kiteum</em>
            </div>
            <p className="max-w-[260px] text-[0.82rem] leading-loose text-slate-400">
              An AI Agent that works like a digital employee for your business — available 24/7, no website needed,
              set up in 10 minutes.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-[0.72rem] font-bold uppercase tracking-[1.5px] text-slate-300">Product</h4>
            <ul className="flex flex-col gap-2.5">
              {[["Features", "#features"], ["How It Works", "#how"], ["Pricing", "#pricing"], ["Demo", "#demo"]].map(
                ([l, h]) => (
                  <li key={l}>
                    <a href={h} className="text-[0.84rem] text-slate-400 transition-colors hover:text-white">
                      {l}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[0.72rem] font-bold uppercase tracking-[1.5px] text-slate-300">Industries</h4>
            <ul className="flex flex-col gap-2.5">
              {["Clinics", "Schools", "Restaurants", "Salons & Gyms"].map((l) => (
                <li key={l}>
                  <a href="#industries" className="text-[0.84rem] text-slate-400 transition-colors hover:text-white">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[0.72rem] font-bold uppercase tracking-[1.5px] text-slate-300">Company</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a href="#contact" className="text-[0.84rem] text-slate-400 transition-colors hover:text-white">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="text-[0.84rem] text-slate-400 transition-colors hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-[0.84rem] text-slate-400 transition-colors hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#faq" className="text-[0.84rem] text-slate-400 transition-colors hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-800 pt-7">
          <p className="text-[0.78rem] text-slate-500">© 2026 Agent.Kiteum — All rights reserved</p>
          <p className="text-[0.78rem] text-slate-500">Made with ❤️ for Indian businesses</p>
        </div>
      </div>
    </footer>
  );
}