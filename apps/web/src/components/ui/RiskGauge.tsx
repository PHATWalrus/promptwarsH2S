import type { RiskLevel } from "@lexguard/types";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface RiskGaugeProps {
  score: number; // 0-100
  level: RiskLevel;
  className?: string;
  size?: number;
}

export function RiskGauge({ score, level, className, size = 120 }: RiskGaugeProps) {
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Arc goes 75% of the circle (270 degrees)
  const arcLength = circumference * 0.75;
  const offset = arcLength - (score / 100) * arcLength;

  const colors: Record<RiskLevel, string> = {
    critical: "text-risk-critical",
    high: "text-risk-high",
    medium: "text-risk-medium",
    low: "text-risk-low",
  };

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-135"
      >
        <title>{`${level} risk score ${score}`}</title>
        {/* Background Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          className="text-surface-2"
        />
        {/* Value Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={arcLength} // initial state
          strokeLinecap="round"
          className={colors[level]}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: circumference - arcLength + offset }}
          transition={{ type: "spring", bounce: 0.25, duration: 2 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-serif text-text">{score}</span>
        <span className="text-[10px] text-muted uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
}
