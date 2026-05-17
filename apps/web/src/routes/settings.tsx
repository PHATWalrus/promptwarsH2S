import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store/auth.store";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-text mb-1">Settings</h1>
        <p className="text-muted">Account and security status for your LEXGUARD workspace.</p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-medium text-text">{user?.name ?? "LEXGUARD User"}</h2>
            <p className="text-sm text-muted">{user?.email ?? "No user loaded"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-[8px] bg-surface-1 border border-border p-4">
            <p className="text-muted">Role</p>
            <p className="text-text capitalize">{user?.role ?? "user"}</p>
          </div>
          <div className="rounded-[8px] bg-surface-1 border border-border p-4">
            <p className="text-muted">Organization</p>
            <p className="text-text">{user?.orgId ?? "Pending"}</p>
          </div>
        </div>

        <Button variant="secondary" onClick={() => logout()}>
          Sign out
        </Button>
      </section>
    </div>
  );
}
