import { Bell, CircleHelp, LogOut, Search } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";

export function AppTopBar() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-4 border-b border-border bg-bg/95 px-5 backdrop-blur md:px-8">
      <div className="relative hidden w-full max-w-[520px] md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
        <input
          aria-label="Search contracts, clauses, parties"
          className="h-11 w-full rounded-[8px] border border-border bg-surface-1 pl-10 pr-4 text-sm text-text placeholder:text-muted transition-colors focus:border-primary-container focus:outline-none"
          placeholder="Search contracts, clauses, parties..."
          type="search"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="grid size-10 place-items-center rounded-[8px] text-on-surface-variant transition-colors hover:bg-surface-2 hover:text-text"
          type="button"
        >
          <Bell className="size-5" />
        </button>
        <button
          aria-label="Help"
          className="grid size-10 place-items-center rounded-[8px] text-on-surface-variant transition-colors hover:bg-surface-2 hover:text-text"
          type="button"
        >
          <CircleHelp className="size-5" />
        </button>
        <button
          aria-label="Sign out"
          className="grid size-10 place-items-center rounded-[8px] text-on-surface-variant transition-colors hover:bg-surface-2 hover:text-risk-critical"
          onClick={() => logout()}
          type="button"
        >
          <LogOut className="size-5" />
        </button>
      </div>
    </header>
  );
}
