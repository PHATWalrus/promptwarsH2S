import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../store/auth.store";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (mode === "register") {
        await register({
          email,
          password,
          name: name || undefined,
          orgName: orgName || undefined,
        });
      } else {
        await login({ email, password });
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-primary mb-2">LEXGUARD</h1>
          <p className="text-muted">
            {mode === "login" ? "Sign in to your account" : "Create your secure workspace"}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle top highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="space-y-1">
                  <Input
                    label="Name"
                    type="text"
                    placeholder="Avery Stone"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    label="Organization"
                    type="text"
                    placeholder="Acme Legal Ops"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="space-y-1">
              <Input
                label="Email"
                type="email"
                placeholder="operator@lexguard.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text">Password</span>
                {mode === "login" && (
                  <span className="text-xs text-muted">15 minute access sessions</span>
                )}
              </div>
              <Input
                aria-label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="rounded-md border border-risk-critical/30 bg-risk-critical/10 px-3 py-2 text-sm text-risk-critical">
                {error}
              </p>
            )}

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            {mode === "login" ? "Don't have an account?" : "Already have access?"}{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
