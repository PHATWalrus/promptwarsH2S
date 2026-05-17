import { Link } from "@tanstack/react-router";
import { FileText, Grid2X2, HelpCircle, LogOut, Settings, Shuffle, Upload } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useUiStore } from "../../store/ui.store";
import { LexguardLogo } from "../ui/LexguardLogo";

export function Sidebar() {
  const { logout, user } = useAuthStore();
  const { sidebarOpen } = useUiStore();

  if (!sidebarOpen) return null;

  return (
    <aside className="fixed z-40 hidden h-screen w-72 flex-col border-r border-border bg-surface-1 md:relative md:flex">
      <div className="p-6">
        <LexguardLogo />
        <p className="mt-2 text-sm text-on-surface-variant">AI Intelligence</p>
        <Link
          to="/contracts/upload"
          className="mt-10 flex h-12 items-center justify-center gap-2 rounded-[8px] bg-primary-container px-4 text-sm font-semibold tracking-[0.08em] text-bg transition-colors hover:bg-primary"
        >
          <Upload className="size-4" />
          Quick Upload
        </Link>
      </div>

      <nav className="flex-1 px-5 space-y-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-4 rounded-[8px] px-4 py-3 text-sm font-semibold tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-2 hover:text-text [&.active]:bg-surface-2 [&.active]:text-primary [&.active]:shadow-[inset_-2px_0_0_#57f1db]"
        >
          <Grid2X2 className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/contracts"
          className="flex items-center gap-4 rounded-[8px] px-4 py-3 text-sm font-semibold tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-2 hover:text-text [&.active]:bg-surface-2 [&.active]:text-primary [&.active]:shadow-[inset_-2px_0_0_#57f1db]"
        >
          <FileText className="w-5 h-5" />
          <span>Contracts</span>
        </Link>
        <Link
          to="/compare"
          className="flex items-center gap-4 rounded-[8px] px-4 py-3 text-sm font-semibold tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-2 hover:text-text [&.active]:bg-surface-2 [&.active]:text-primary [&.active]:shadow-[inset_-2px_0_0_#57f1db]"
        >
          <Shuffle className="w-5 h-5" />
          <span>Comparison</span>
        </Link>
        <Link
          to="/settings"
          className="flex items-center gap-4 rounded-[8px] px-4 py-3 text-sm font-semibold tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-2 hover:text-text [&.active]:bg-surface-2 [&.active]:text-primary [&.active]:shadow-[inset_-2px_0_0_#57f1db]"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </nav>

      <div className="m-5 border-t border-border pt-5">
        <button
          type="button"
          className="flex items-center gap-3 px-3 py-2 text-muted hover:text-text w-full rounded-md transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
          <span>Help & Shortcuts</span>
        </button>
        <div className="mt-4 flex items-center justify-between px-3 py-2 rounded-md">
          <div className="flex flex-col truncate pr-2">
            <span className="text-sm font-medium text-text truncate">{user?.name || "User"}</span>
            <span className="text-xs text-muted truncate">{user?.email || "Legal Counsel"}</span>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="text-muted hover:text-risk-critical transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
