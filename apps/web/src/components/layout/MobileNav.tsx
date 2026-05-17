import { Link } from "@tanstack/react-router";
import { FileText, Grid2X2, Settings, Shuffle } from "lucide-react";

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-border bg-surface-1/95 p-3 backdrop-blur md:hidden">
      <Link
        to="/dashboard"
        className="flex flex-col items-center gap-1 text-muted transition-colors [&.active]:text-primary"
      >
        <Grid2X2 className="w-6 h-6" />
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
        className="flex flex-col items-center gap-1 text-muted transition-colors [&.active]:text-primary"
      >
        <Shuffle className="w-6 h-6" />
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
