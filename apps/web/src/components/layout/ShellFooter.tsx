export function ShellFooter() {
  return (
    <footer className="flex flex-col gap-4 border-t border-border px-6 py-4 text-xs text-on-surface-variant md:flex-row md:items-center md:justify-between">
      <span>© 2024 LEXGUARD AI. For professional legal use only.</span>
      <div className="flex flex-wrap gap-6">
        <a className="transition-colors hover:text-text" href="/privacy">
          Privacy Policy
        </a>
        <a className="transition-colors hover:text-text" href="/terms">
          Terms of Service
        </a>
        <a className="transition-colors hover:text-text" href="/security">
          Security Compliance
        </a>
      </div>
    </footer>
  );
}
