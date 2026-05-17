import { Link } from "@tanstack/react-router";
import { FileText, HelpCircle, Home, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useUiStore } from "../../store/ui.store";

export function Sidebar() {
  const { logout, user } = useAuthStore();
  const { sidebarOpen } = useUiStore();

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen flex flex-col fixed md:relative z-40 hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-serif text-primary">LEXGUARD</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-3 py-2 text-muted hover:text-text hover:bg-surface-2 rounded-md transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
        >
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/contracts"
          className="flex items-center gap-3 px-3 py-2 text-muted hover:text-text hover:bg-surface-2 rounded-md transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
        >
          <FileText className="w-5 h-5" />
          <span>Contracts</span>
        </Link>
        <Link
          to="/compare"
          className="flex items-center gap-3 px-3 py-2 text-muted hover:text-text hover:bg-surface-2 rounded-md transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Compare</span>
        </Link>
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 text-muted hover:text-text hover:bg-surface-2 rounded-md transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-border">
        <button
          type="button"
          className="flex items-center gap-3 px-3 py-2 text-muted hover:text-text w-full rounded-md transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
          <span>Help & Shortcuts</span>
        </button>
        <div className="mt-4 flex items-center justify-between px-3 py-2 bg-surface-2 rounded-md">
          <div className="flex flex-col truncate pr-2">
            <span className="text-sm font-medium text-text truncate">{user?.name || "User"}</span>
            <span className="text-xs text-muted truncate">{user?.email || "user@example.com"}</span>
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
