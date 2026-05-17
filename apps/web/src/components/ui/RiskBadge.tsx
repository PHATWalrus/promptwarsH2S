import { cn } from "../../lib/utils";

interface RiskBadgeProps {
  level: "critical" | "high" | "medium" | "low";
  className?: string;
  showText?: boolean;
}

export function RiskBadge({ level, className, showText = true }: RiskBadgeProps) {
  const styles = {
    critical: "bg-risk-critical/10 text-risk-critical border-risk-critical/20",
    high: "bg-risk-high/10 text-risk-high border-risk-high/20",
    medium: "bg-risk-medium/10 text-risk-medium border-risk-medium/20",
    low: "bg-risk-low/10 text-risk-low border-risk-low/20",
  };

  const dotStyles = {
    critical: "bg-risk-critical",
    high: "bg-risk-high",
    medium: "bg-risk-medium",
    low: "bg-risk-low",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-[4px] text-xs font-medium border capitalize",
        styles[level],
        className,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotStyles[level])} aria-hidden="true" />
      {showText && <span className="capitalize">{level}</span>}
    </span>
  );
}
