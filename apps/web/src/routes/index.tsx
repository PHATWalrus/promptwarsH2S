import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 max-w-4xl w-full px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-sm text-primary mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Introducing Lexguard 2.0
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-5xl md:text-7xl font-medium tracking-tight mb-6"
        >
          Contract intelligence,
          <br />
          <span className="text-muted">without the noise.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg md:text-xl text-muted max-w-2xl mb-10"
        >
          Lexguard analyzes, compares, and extracts key clauses from legal documents in seconds.
          Built for teams that demand precision and speed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4"
        >
          <Link to="/login">
            <Button variant="primary" size="lg" className="w-40">
              Get Started
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="w-40">
              Sign In
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Decorative UI elements mimicking a contract */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 w-full max-w-5xl translate-y-1/3"
      >
        <div className="w-full aspect-[2/1] rounded-t-[32px] bg-surface-1 border border-border border-b-0 p-8 flex shadow-2xl">
          <div className="w-1/3 border-r border-border pr-8 space-y-4">
            <div className="h-4 bg-surface-2 rounded-md w-3/4" />
            <div className="h-4 bg-surface-2 rounded-md w-1/2" />
            <div className="h-4 bg-surface-2 rounded-md w-full" />
          </div>
          <div className="flex-1 pl-8 space-y-6">
            <div className="h-8 bg-surface-2 rounded-md w-1/3" />
            <div className="space-y-2">
              <div className="h-4 bg-surface-2 rounded-md w-full" />
              <div className="h-4 bg-surface-2 rounded-md w-full" />
              <div className="h-4 bg-surface-2 rounded-md w-4/5" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
