import { createFileRoute } from "@tanstack/react-router";
import { Check, KeyRound, Plus, ShieldCheck } from "lucide-react";
import type React from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../store/auth.store";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-8">
      <h1 className="mb-8 border-b border-border pb-8 font-serif text-4xl">
        Settings Configuration
      </h1>

      <div className="grid gap-8 xl:grid-cols-[1fr_430px]">
        <main className="space-y-8">
          <section className="surface-panel overflow-hidden">
            <div className="border-b border-border p-8">
              <h2 className="font-serif text-4xl">Professional Profile</h2>
              <p className="mt-2 text-on-surface-variant">
                Manage your identity and authentication credentials.
              </p>
            </div>
            <div className="p-8">
              <div className="mb-8 flex flex-wrap items-center gap-8">
                <div className="grid size-24 place-items-center rounded-full border border-border bg-surface-2 font-serif text-3xl text-primary">
                  {(user?.name ?? user?.email ?? "L").slice(0, 1).toUpperCase()}
                </div>
                <Button variant="secondary">Change Avatar</Button>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Input label="Full Legal Name" value={user?.name ?? "Lexguard User"} readOnly />
                <Input label="Account Role" value={user?.role ?? "user"} readOnly />
                <div className="md:col-span-2">
                  <Input
                    label="Corporate Email Address"
                    value={user?.email ?? "user@lexguard.ai"}
                    readOnly
                  />
                  <p className="mt-3 text-sm text-on-surface-variant">
                    Contact IT to change your primary corporate email.
                  </p>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </div>
          </section>

          <section className="surface-panel overflow-hidden">
            <div className="border-b border-border p-8">
              <h2 className="font-serif text-4xl">Organization Details</h2>
              <p className="mt-2 text-on-surface-variant">
                Billing and structural information for your entity.
              </p>
            </div>
            <div className="grid gap-5 p-8 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input label="Organization ID" value={user?.orgId ?? "Not configured"} readOnly />
              </div>
              <Input label="Data Jurisdiction" value="Configured by deployment" readOnly />
              <Input label="Storage Region" value="Configured by deployment" readOnly />
            </div>
          </section>
        </main>

        <aside className="space-y-8">
          <section className="surface-panel overflow-hidden">
            <div className="flex items-center gap-4 border-b border-border p-8">
              <ShieldCheck className="size-6 text-primary" />
              <h2 className="font-serif text-4xl">Privacy Controls</h2>
            </div>
            <div className="space-y-6 p-8">
              <Control label="Strict Data Anonymization" enabled>
                Automatically scrub PII from all uploaded contracts before LLM processing.
              </Control>
              <Control label="Immutable Audit Logging" enabled>
                Record every read/write action on sensitive documents to a tamper-proof ledger.
              </Control>
              <Control label="Opt-in Model Training">
                Allow aggregated, anonymized clause data to improve base legal models.
              </Control>
            </div>
          </section>

          <section className="surface-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-8">
              <h2 className="font-serif text-4xl">API Access</h2>
              <button
                aria-label="Create API key"
                className="grid size-9 place-items-center rounded-full border border-primary text-primary"
                type="button"
              >
                <Plus className="size-5" />
              </button>
            </div>
            <div className="p-8">
              <p className="mb-6 text-on-surface-variant">
                Manage keys for external system integrations.
              </p>
              <ApiKey label="API keys" value="Managed by your administrator" />
              <Button variant="secondary" className="mt-6 w-full" onClick={() => logout()}>
                Sign Out
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Control({
  children,
  enabled = false,
  label,
}: {
  children: React.ReactNode;
  enabled?: boolean;
  label: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-5">
      <div>
        <p className="font-semibold tracking-[0.04em]">{label}</p>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">{children}</p>
      </div>
      <span
        className={`grid size-7 place-items-center rounded-full border ${
          enabled ? "border-primary bg-primary text-bg" : "border-border"
        }`}
      >
        {enabled && <Check className="size-4" />}
      </span>
    </div>
  );
}

function ApiKey({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4 rounded-[6px] bg-bg p-4">
      <div className="mb-1 flex items-center gap-2 font-semibold">
        <KeyRound className="size-4 text-on-surface-variant" />
        {label}
      </div>
      <p className="font-mono text-sm text-on-surface-variant">{value}</p>
    </div>
  );
}
