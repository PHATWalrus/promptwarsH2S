import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="bg-surface-container-lowest text-on-surface font-body-md min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {/* TopAppBar */}
      <header className="bg-surface-container-lowest/90 text-on-surface full-width top-0 border-b border-white/5 flex justify-between items-center w-full px-lg py-md fixed z-50">
        <div className="flex items-center gap-md">
          <span className="font-headline-sm text-on-surface tracking-tight italic">LEXGUARD</span>
        </div>
        <nav className="hidden md:flex items-center gap-xl">
          <a
            className="text-on-surface-variant hover:text-on-surface transition-colors duration-200 font-label-md text-label-md"
            href="#features"
          >
            Features
          </a>
          <a
            className="text-on-surface-variant hover:text-on-surface transition-colors duration-200 font-label-md text-label-md"
            href="#how-it-works"
          >
            How it Works
          </a>
          <a
            className="text-on-surface-variant hover:text-on-surface transition-colors duration-200 font-label-md text-label-md"
            href="#pricing"
          >
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-md">
          <button
            className="text-on-surface-variant hover:text-on-surface transition-colors duration-200"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>
          <button
            className="bg-surface-container border border-white/10 text-on-surface px-lg py-sm rounded-sm font-label-md text-label-md hover:bg-surface-container-high transition-colors"
            type="button"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-grow pt-[72px]">
        {/* Hero Section */}
        <section className="min-h-[921px] flex flex-col items-center justify-start text-center px-container-margin pt-4xl pb-3xl relative overflow-hidden bg-surface-container-lowest">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-[0.15] pointer-events-none mix-blend-screen grayscale"></div>

          <div className="max-w-4xl mx-auto z-10 mt-xl">
            <div className="inline-flex items-center gap-sm border border-white/10 rounded-full px-md py-xs mb-xl">
              <span className="material-symbols-outlined text-on-surface-variant text-[14px]">
                verified
              </span>
              <span className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-widest">
                AI-Powered Legal Intelligence
              </span>
            </div>

            <h1 className="font-display-lg text-[72px] md:text-[112px] leading-[0.9] tracking-[-0.03em] text-on-surface mb-xl">
              Know What You’re Signing.
            </h1>

            <p className="font-body-lg text-[22px] text-on-surface-variant max-w-2xl mx-auto mb-2xl font-light">
              Lexguard translates complex legal jargon into plain English. Instantly flag hidden
              risks, unfair clauses, and aggressive terms before you put pen to paper.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-lg">
              <button
                className="bg-on-surface text-surface-container-lowest font-label-md text-label-md px-2xl py-md rounded-sm hover:bg-on-surface-variant transition-colors w-full sm:w-auto tracking-widest uppercase"
                type="button"
              >
                Analyze a Contract
              </button>
              <button
                className="border border-white/20 bg-transparent text-on-surface font-label-md text-label-md px-2xl py-md rounded-sm hover:bg-white/5 transition-colors w-full sm:w-auto flex items-center justify-center gap-sm tracking-widest uppercase"
                type="button"
              >
                See How It Works
              </button>
            </div>
          </div>

          {/* Stylized Mockup */}
          <div className="w-full max-w-6xl mt-3xl relative z-10 px-md">
            <div className="bg-surface-container-lowest border border-white/10 p-md relative overflow-hidden group">
              <div className="flex flex-col md:flex-row gap-sm h-[600px]">
                {/* Contract Viewer */}
                <div className="bg-surface-container border border-white/5 p-xl text-on-surface font-body-sm relative overflow-hidden flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-xl border-b border-white/10 pb-md">
                    <div className="flex items-center gap-md">
                      <span className="material-symbols-outlined text-on-surface-variant text-lg">
                        description
                      </span>
                      <div className="font-headline-sm text-[24px] text-on-surface">
                        Independent Contractor Agreement
                      </div>
                    </div>
                    <span className="text-on-surface-variant px-sm py-xs text-[11px] font-mono border border-white/10">
                      Page 1 of 12
                    </span>
                  </div>

                  <div className="overflow-y-auto pr-md custom-scrollbar space-y-xl text-on-surface-variant/80 text-[15px] leading-relaxed max-w-3xl mx-auto w-full">
                    <p>
                      3.1 The Parties agree that the Contractor shall act as an independent
                      contractor in the performance of duties under this Agreement. Nothing
                      contained in this Agreement shall be construed to create a partnership, joint
                      venture, or employer-employee relationship.
                    </p>
                    <p className="relative">
                      3.2 The Contractor agrees that all intellectual property rights in any work
                      produced under this Agreement shall immediately vest in the Company.
                      <span className="bg-surface-container-highest text-on-surface px-sm py-xs border border-white/20 relative inline-block cursor-pointer hover:bg-white/10 transition-colors group/highlight mt-1 mx-1">
                        The Contractor hereby waives any moral rights in the work.
                        {/* Tooltip */}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-sm w-72 bg-surface text-on-surface p-lg shadow-2xl text-xs opacity-0 group-hover/highlight:opacity-100 transition-opacity border border-white/20 z-20 font-body-sm pointer-events-none">
                          <span className="block text-on-surface font-bold mb-sm uppercase tracking-wider text-[10px] border-b border-white/10 pb-xs">
                            Critical Risk
                          </span>
                          You are signing away fundamental rights to be credited for your work and
                          the right to object to derogatory treatment of your work.
                        </span>
                      </span>
                      Furthermore, the Contractor agrees to assist the Company in registering such
                      rights globally at the Contractor's own expense.
                    </p>
                    <p>
                      4.1
                      <span className="bg-surface-container-highest text-on-surface px-sm py-xs border border-white/20 cursor-pointer hover:bg-white/10 transition-colors inline-block mx-1">
                        For a period of 24 months following termination
                      </span>
                      , the Contractor shall not provide services to any competitor within a
                      500-mile radius. This provision shall survive the termination of this
                      Agreement regardless of the cause of termination.
                    </p>
                    <p>
                      5.1 The Company shall compensate the Contractor according to the schedule set
                      forth in Exhibit A. Payment shall be made within 60 days of receipt of an
                      undisputed invoice.
                    </p>
                  </div>
                </div>

                {/* Sidebar Analysis */}
                <div className="w-full md:w-80 bg-surface-container-low border border-white/5 p-lg flex flex-col gap-lg">
                  <div className="flex items-center gap-sm pb-md border-b border-white/10">
                    <span className="material-symbols-outlined text-on-surface">auto_awesome</span>
                    <span className="font-label-md text-on-surface tracking-widest uppercase">
                      Analysis Active
                    </span>
                  </div>

                  <div className="space-y-md">
                    <div className="bg-surface-container border border-white/10 p-md cursor-pointer hover:bg-surface-container-high transition-colors">
                      <div className="flex items-start justify-between mb-sm">
                        <span className="font-label-md text-on-surface text-[11px] uppercase tracking-wide">
                          IP Rights Waiver
                        </span>
                        <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
                          warning
                        </span>
                      </div>
                      <p className="text-[13px] text-on-surface-variant leading-snug">
                        Clause 3.2 contains a broad waiver of moral rights.
                      </p>
                    </div>

                    <div className="bg-surface-container border border-white/10 p-md cursor-pointer hover:bg-surface-container-high transition-colors">
                      <div className="flex items-start justify-between mb-sm">
                        <span className="font-label-md text-on-surface text-[11px] uppercase tracking-wide">
                          Broad Non-Compete
                        </span>
                        <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
                          info
                        </span>
                      </div>
                      <p className="text-[13px] text-on-surface-variant leading-snug">
                        Clause 4.1 sets a 500-mile radius for 24 months.
                      </p>
                    </div>

                    <div className="bg-surface-container border border-white/5 p-md cursor-pointer hover:bg-surface-container-high transition-colors opacity-50">
                      <div className="flex items-start justify-between mb-sm">
                        <span className="font-label-md text-on-surface-variant text-[11px] uppercase tracking-wide">
                          Net-60 Terms
                        </span>
                        <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
                          schedule
                        </span>
                      </div>
                      <p className="text-[13px] text-on-surface-variant leading-snug">
                        Clause 5.1 specifies 60-day payment terms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Risk Categories (Editorial Layout) */}
        <section
          className="py-4xl px-container-margin bg-surface border-t border-white/5 relative"
          id="features"
        >
          <div className="max-w-6xl mx-auto">
            <div className="mb-3xl md:w-3/4">
              <h2 className="font-display-lg text-[48px] md:text-[72px] leading-[1] text-on-surface mb-lg tracking-tight">
                We catch what you miss.
              </h2>
              <p className="font-body-lg text-xl text-on-surface-variant max-w-2xl font-light leading-relaxed">
                Our AI is trained on thousands of predatory contracts to instantly highlight the
                clauses designed to trap you, presented clearly and immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-white/5 border border-white/5">
              {/* Non-compete */}
              <div className="md:col-span-8 bg-surface p-3xl flex flex-col group">
                <span className="material-symbols-outlined text-on-surface-variant text-[32px] mb-2xl">
                  block
                </span>
                <div className="mt-auto max-w-lg">
                  <h3 className="font-headline-md text-[32px] text-on-surface mb-md">
                    Non-Compete Clauses
                  </h3>
                  <p className="font-body-md text-on-surface-variant text-[16px] leading-relaxed">
                    Identifies overly broad restrictions that could prevent you from working in your
                    industry for years, often hidden deep within standard boilerplate text.
                  </p>
                </div>
              </div>

              {/* IP Assignment */}
              <div className="md:col-span-4 bg-surface p-2xl flex flex-col">
                <span className="material-symbols-outlined text-on-surface-variant text-[32px] mb-2xl">
                  copyright
                </span>
                <div className="mt-auto">
                  <h3 className="font-headline-sm text-[24px] text-on-surface mb-sm">
                    IP Assignment
                  </h3>
                  <p className="font-body-md text-on-surface-variant text-[15px] leading-relaxed">
                    Flags terms that aggressively claim ownership of your past work, side projects,
                    or unrelated inventions.
                  </p>
                </div>
              </div>

              {/* Auto-renewal */}
              <div className="md:col-span-5 bg-surface p-2xl flex flex-col">
                <span className="material-symbols-outlined text-on-surface-variant text-[32px] mb-2xl">
                  autorenew
                </span>
                <div className="mt-auto">
                  <h3 className="font-headline-sm text-[24px] text-on-surface mb-sm">
                    Predatory Auto-Renewals
                  </h3>
                  <p className="font-body-md text-on-surface-variant text-[15px] leading-relaxed">
                    Finds hidden clauses that lock you into long-term payments without clear
                    cancellation windows.
                  </p>
                </div>
              </div>

              {/* Forced Arbitration & Indemnity combo */}
              <div className="md:col-span-7 bg-surface p-2xl flex flex-col md:flex-row gap-2xl">
                <div className="flex-1 flex flex-col">
                  <span className="material-symbols-outlined text-on-surface-variant text-[32px] mb-2xl">
                    gavel
                  </span>
                  <div className="mt-auto">
                    <h3 className="font-headline-sm text-[24px] text-on-surface mb-sm">
                      Forced Arbitration
                    </h3>
                    <p className="font-body-md text-on-surface-variant text-[15px] leading-relaxed">
                      Detects waivers of your right to a jury trial or class action participation,
                      restricting your legal recourse.
                    </p>
                  </div>
                </div>
                <div className="w-px bg-white/5 hidden md:block"></div>
                <div className="flex-1 flex flex-col border-t border-white/5 md:border-t-0 pt-2xl md:pt-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-[32px] mb-2xl">
                    shield_person
                  </span>
                  <div className="mt-auto">
                    <h3 className="font-headline-sm text-[24px] text-on-surface mb-sm">
                      Unfair Indemnity
                    </h3>
                    <p className="font-body-md text-on-surface-variant text-[15px] leading-relaxed">
                      Warns you if you are accepting total financial liability for third-party
                      errors or issues beyond your control.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section
          className="py-4xl px-container-margin bg-surface-container-lowest text-center relative border-t border-white/5"
          id="how-it-works"
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <span className="material-symbols-outlined text-on-surface-variant text-[40px] mb-xl">
              policy
            </span>
            <h2 className="font-display-lg text-[48px] md:text-[64px] leading-[1] tracking-tight text-on-surface mb-lg">
              Not a replacement for a lawyer.
              <br />A first line of defense.
            </h2>
            <p className="font-body-lg text-on-surface-variant text-xl font-light leading-relaxed max-w-2xl mt-md">
              Lexguard provides rapid intelligence and risk assessment. It is designed to arm you
              with the knowledge to push back, ask better questions, or know exactly when you need
              to hire expensive human counsel.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="bg-surface-container-lowest full-width bottom-0 border-t border-white/5 flex flex-col md:flex-row justify-between items-center px-container-margin py-xl gap-md z-40 relative"
        id="pricing"
      >
        <div className="text-on-surface-variant font-code-sm text-[11px] tracking-widest uppercase">
          © 2024 LEXGUARD AI. For professional legal use only.
        </div>
        <div className="flex gap-xl">
          <a
            className="text-on-surface-variant hover:text-on-surface transition-colors duration-150 font-code-sm text-[11px] tracking-widest uppercase"
            href="/privacy"
          >
            Privacy Policy
          </a>
          <a
            className="text-on-surface-variant hover:text-on-surface transition-colors duration-150 font-code-sm text-[11px] tracking-widest uppercase"
            href="/terms"
          >
            Terms of Service
          </a>
          <a
            className="text-on-surface-variant hover:text-on-surface transition-colors duration-150 font-code-sm text-[11px] tracking-widest uppercase"
            href="/security"
          >
            Security Compliance
          </a>
        </div>
      </footer>
    </div>
  );
}
