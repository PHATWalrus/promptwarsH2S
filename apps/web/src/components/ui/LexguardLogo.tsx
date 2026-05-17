import { cn } from "../../lib/utils";

interface LexguardLogoProps {
  className?: string;
  mark?: boolean;
}

export function LexguardLogo({ className, mark = false }: LexguardLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {mark && (
        <span
          aria-hidden="true"
          className="grid size-8 place-items-center rounded-[6px] border border-border bg-surface-2 text-primary"
        >
          <span className="h-4 w-2 rounded-full bg-primary shadow-[6px_0_0_#57f1db,-6px_0_0_#57f1db]" />
        </span>
      )}
      <span className="lexguard-wordmark text-[24px] leading-none">LEXGUARD</span>
    </span>
  );
}
