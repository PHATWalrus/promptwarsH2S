import { createFileRoute, Link } from "@tanstack/react-router";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { Ban, Copyright, FileText, Gavel, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import type React from "react";
import { Button } from "../components/ui/Button";
import { LexguardLogo } from "../components/ui/LexguardLogo";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.52, ease: "easeOut" } },
};

function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface antialiased">
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-bg/90 px-5 backdrop-blur md:px-8">
        <LexguardLogo className="[&_.lexguard-wordmark]:text-[16px]" />
        <nav className="hidden items-center gap-10 text-[11px] font-semibold md:flex">
          <a className="transition-colors hover:text-primary" href="#features">
            Features
          </a>
          <a className="transition-colors hover:text-primary" href="#how-it-works">
            How it Works
          </a>
          <a className="transition-colors hover:text-primary" href="#security">
            Security
          </a>
        </nav>
        <Link to="/login">
          <Button size="sm" variant="secondary" className="normal-case tracking-normal">
            Sign In
          </Button>
        </Link>
      </header>

      <main className="pt-16">
        <section className="relative overflow-hidden border-b border-border px-5 pb-24 pt-24 text-center md:px-8 md:pb-32 md:pt-32">
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:56px_56px]" />
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            className="relative z-10 mx-auto max-w-6xl"
          >
            <motion.div
              variants={reveal}
              className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant"
            >
              <Sparkles className="size-3" />
              AI Powered Legal Intelligence
            </motion.div>
            <motion.h1
              variants={reveal}
              className="mx-auto max-w-3xl text-balance font-serif text-[64px] leading-[0.9] text-on-surface md:text-[108px]"
            >
              Know What You&apos;re Signing.
            </motion.h1>
            <motion.p
              variants={reveal}
              className="mx-auto mt-8 max-w-2xl text-sm leading-7 text-on-surface-variant md:text-base"
            >
              Lexguard translates complex legal jargon into plain English. Instantly flag hidden
              risks, unfair clauses, and aggressive terms before you put pen to paper.
            </motion.p>
            <motion.div
              variants={reveal}
              className="mt-12 flex flex-col justify-center gap-4 sm:flex-row"
            >
              <Link to="/contracts/upload">
                <Button size="lg" className="w-full min-w-64 sm:w-auto">
                  Analyze a Contract
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="secondary" className="w-full min-w-64 sm:w-auto">
                  See How It Works
                </Button>
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mx-auto mt-20 max-w-6xl border border-border bg-bg p-3"
          >
            <div className="grid min-h-[420px] gap-2 md:grid-cols-[1fr_300px]">
              <div className="bg-surface-container p-6 text-left">
                <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3 font-serif text-2xl">
                    <FileText className="size-4 text-on-surface-variant" />
                    Independent Contractor Agreement
                  </div>
                  <span className="border border-border px-2 py-1 text-[10px] text-on-surface-variant">
                    Page 1 of 12
                  </span>
                </div>
                <div className="mx-auto max-w-3xl space-y-6 text-center text-sm leading-7 text-on-surface-variant">
                  <p>
                    3.1 The Parties agree that the Contractor shall act as an independent contractor
                    in the performance of duties under this Agreement.
                  </p>
                  <p>
                    3.2 The Contractor agrees that all intellectual property rights in any work
                    produced under this Agreement shall immediately vest in the Company.
                  </p>
                  <p>
                    <span className="border border-white/20 bg-surface-container-highest px-2 py-1 text-on-surface">
                      The Contractor hereby waives any moral rights in the work.
                    </span>
                  </p>
                  <p>
                    4.1{" "}
                    <span className="border border-white/20 bg-surface-container-highest px-2 py-1 text-on-surface">
                      For a period of 24 months following termination
                    </span>
                    , the Contractor shall not provide services to any competitor within a 500-mile
                    radius.
                  </p>
                </div>
              </div>
              <div className="bg-surface-container-low p-5 text-left">
                <div className="mb-5 flex items-center gap-2 border-b border-border pb-4 quiet-label text-on-surface">
                  <Sparkles className="size-4" />
                  Analysis Active
                </div>
                {[
                  ["IP Rights Waiver", "Clause 3.2 contains a broad waiver of moral rights."],
                  ["Broad Non-Compete", "Clause 4.1 sets a 500-mile radius for 24 months."],
                  ["Net-60 Terms", "Clause 5.1 specifies 60-day payment terms."],
                ].map(([title, body], index) => (
                  <div
                    className={`mb-3 border border-border bg-surface-container p-4 ${index === 2 ? "opacity-50" : ""}`}
                    key={title}
                  >
                    <p className="quiet-label text-on-surface">{title}</p>
                    <p className="mt-2 text-xs leading-5 text-on-surface-variant">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section
          id="features"
          className="border-b border-border bg-surface px-5 py-24 md:px-8 md:py-32"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 max-w-3xl">
              <h2 className="font-serif text-5xl leading-none md:text-7xl">
                We catch what you miss.
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-on-surface-variant md:text-base">
                Our AI is trained on thousands of predatory contracts to instantly highlight the
                clauses designed to trap you, presented clearly and immediately.
              </p>
            </div>
            <div className="grid border border-border bg-border md:grid-cols-12">
              <FeatureCard
                className="md:col-span-8"
                icon={<Ban />}
                title="Non-Compete Clauses"
                body="Identifies overly broad restrictions that could prevent you from working in your industry for years."
              />
              <FeatureCard
                className="md:col-span-4"
                icon={<Copyright />}
                title="IP Assignment"
                body="Flags terms that aggressively claim ownership of your past work, side projects, or unrelated inventions."
              />
              <FeatureCard
                className="md:col-span-5"
                icon={<RefreshCw />}
                title="Predatory Auto-Renewals"
                body="Finds hidden clauses that lock you into long-term payments without clear cancellation windows."
              />
              <FeatureCard
                className="md:col-span-7"
                icon={<Gavel />}
                title="Forced Arbitration"
                body="Detects waivers of your right to a jury trial or class action participation, restricting legal recourse."
              />
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-b border-border bg-bg px-5 py-24 text-center md:px-8 md:py-32"
        >
          <ShieldCheck className="mx-auto mb-8 size-10 text-on-surface-variant" />
          <h2 className="mx-auto max-w-3xl text-balance font-serif text-5xl leading-none md:text-7xl">
            Not a replacement for a lawyer. A first line of defense.
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-7 text-on-surface-variant md:text-base">
            Lexguard provides rapid intelligence and risk assessment. It is designed to arm you with
            the knowledge to push back, ask better questions, or know exactly when you need human
            counsel.
          </p>
        </section>
      </main>

      <footer
        id="security"
        className="flex flex-col gap-4 px-5 py-8 text-[11px] uppercase tracking-[0.12em] text-on-surface-variant md:flex-row md:items-center md:justify-between md:px-8"
      >
        <span>© 2024 LEXGUARD AI. For professional legal use only.</span>
        <div className="flex flex-wrap gap-6">
          <a className="hover:text-on-surface" href="/privacy">
            Privacy Policy
          </a>
          <a className="hover:text-on-surface" href="/terms">
            Terms of Service
          </a>
          <a className="hover:text-on-surface" href="/security">
            Security Compliance
          </a>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ backgroundColor: "#1b1b1f" }}
      className={`min-h-72 bg-surface p-8 md:p-12 ${className ?? ""}`}
    >
      <div className="mb-20 size-8 text-on-surface-variant [&_svg]:size-8">{icon}</div>
      <h3 className="font-serif text-3xl">{title}</h3>
      <p className="mt-4 max-w-md text-sm leading-6 text-on-surface-variant">{body}</p>
    </motion.div>
  );
}
