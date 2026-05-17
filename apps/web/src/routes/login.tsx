import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, User } from "lucide-react";
import type React from "react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { LexguardLogo } from "../components/ui/LexguardLogo";
import { useAuthStore } from "../store/auth.store";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return <AuthPage initialMode="login" />;
}

export function AuthPage({ initialMode = "login" }: { initialMode?: "login" | "register" }) {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 12) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

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
    <div className="relative min-h-screen overflow-hidden bg-bg px-5 py-10 text-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(45,212,191,0.12),transparent_30%),radial-gradient(circle_at_80%_72%,rgba(87,241,219,0.08),transparent_28%)]" />
      <Link to="/" className="relative z-10 inline-block">
        <LexguardLogo />
      </Link>
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-120px)] max-w-6xl items-center gap-8 py-10 lg:grid-cols-2">
        <AuthPanel
          active={mode === "login"}
          description="Sign in to access your intelligence dashboard"
          icon={<ShieldCheck className="size-5" />}
          title="Welcome Back"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <FieldIcon icon={<Mail className="size-5" />}>
              <Input
                label="Work Email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={mode === "login"}
              />
            </FieldIcon>
            <FieldIcon icon={<Lock className="size-5" />}>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={mode === "login"}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-[34px] text-on-surface-variant hover:text-text"
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </FieldIcon>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-on-surface-variant">
                <input
                  checked={remember}
                  className="size-4 rounded border-border bg-surface-1 accent-primary-container"
                  onChange={(event) => setRemember(event.target.checked)}
                  type="checkbox"
                />
                Remember me
              </label>
              <button className="text-primary hover:underline" type="button">
                Forgot password?
              </button>
            </div>
            {mode === "login" && error && <ErrorMessage>{error}</ErrorMessage>}
            <Button className="mt-28 w-full" disabled={isLoading || mode !== "login"} type="submit">
              {isLoading && mode === "login" ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          <PanelSwitch>
            New to Lexguard?{" "}
            <button
              className="text-primary hover:underline"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              type="button"
            >
              Request access
            </button>
          </PanelSwitch>
        </AuthPanel>

        <AuthPanel
          active={mode === "register"}
          description="Join the secure intelligence network"
          icon={<ShieldCheck className="size-5" />}
          title="Create Account"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <FieldIcon icon={<User className="size-5" />}>
              <Input
                label="Full Name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={mode === "register"}
              />
            </FieldIcon>
            <Input
              label="Organization"
              type="text"
              placeholder="Acme Legal Ops"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
            <FieldIcon icon={<Mail className="size-5" />}>
              <Input
                label="Work Email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={mode === "register"}
              />
            </FieldIcon>
            <FieldIcon icon={<Lock className="size-5" />}>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={mode === "register"}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-[34px] text-on-surface-variant hover:text-text"
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </FieldIcon>
            <div className="grid grid-cols-4 gap-1">
              {[0, 1, 2, 3].map((index) => (
                <span
                  className={`h-1 rounded-full ${index <= strength ? "bg-primary-container" : "bg-surface-2"}`}
                  key={index}
                />
              ))}
            </div>
            <p className="text-xs text-on-surface-variant">
              Must be at least 12 characters, include a number & symbol.
            </p>
            {mode === "register" && error && <ErrorMessage>{error}</ErrorMessage>}
            <Button
              className="w-full"
              disabled={isLoading || mode !== "register"}
              type="submit"
              variant={mode === "register" ? "primary" : "secondary"}
            >
              {isLoading && mode === "register" ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          <PanelSwitch>
            Already have an account?{" "}
            <button
              className="text-primary hover:underline"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              type="button"
            >
              Sign in
            </button>
          </PanelSwitch>
        </AuthPanel>
      </div>
    </div>
  );
}

function AuthPanel({
  active,
  children,
  description,
  icon,
  title,
}: {
  active: boolean;
  children: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <motion.section
      animate={{ opacity: active ? 1 : 0.78, y: active ? 0 : 10 }}
      className="surface-panel p-8 shadow-[0_32px_100px_rgba(0,0,0,0.35)] md:p-12"
      transition={{ duration: 0.24 }}
    >
      <div className="mb-10 text-center">
        <div className="mx-auto mb-6 grid size-12 place-items-center rounded-[8px] border border-border bg-surface-2 text-primary">
          {icon}
        </div>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="mt-4 text-sm text-on-surface-variant">{description}</p>
      </div>
      {children}
    </motion.section>
  );
}

function FieldIcon({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-[34px] z-10 text-on-surface-variant">
        {icon}
      </span>
      <div className="[&_input]:pl-11">{children}</div>
    </div>
  );
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[8px] border border-risk-critical/30 bg-risk-critical/10 px-3 py-2 text-sm text-risk-critical">
      {children}
    </p>
  );
}

function PanelSwitch({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 border-t border-border pt-6 text-center text-sm text-on-surface-variant">
      {children}
    </div>
  );
}
