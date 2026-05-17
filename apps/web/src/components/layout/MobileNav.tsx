import { Link } from "@tanstack/react-router";
import { FileText, Home, LayoutDashboard, Settings } from "lucide-react";

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40 flex justify-around p-3 pb-safe">
      <Link
        to="/dashboard"
        className="flex flex-col items-center gap-1 text-muted [&.active]:text-primary"
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px]">Home</span>
      </Link>
      <Link
        to="/contracts"
        className="flex flex-col items-center gap-1 text-muted [&.active]:text-primary"
      >
        <FileText className="w-6 h-6" />
        <span className="text-[10px]">Contracts</span>
      </Link>
      <Link
        to="/compare"
        className="flex flex-col items-center gap-1 text-muted [&.active]:text-primary"
      >
        <LayoutDashboard className="w-6 h-6" />
        <span className="text-[10px]">Compare</span>
      </Link>
      <Link
        to="/settings"
        className="flex flex-col items-center gap-1 text-muted [&.active]:text-primary"
      >
        <Settings className="w-6 h-6" />
        <span className="text-[10px]">Settings</span>
      </Link>
    </nav>
  );
}
