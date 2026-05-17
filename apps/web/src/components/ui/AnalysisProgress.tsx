import type { AnalysisStatus } from "@lexguard/types";
import { motion } from "framer-motion";
import { CheckCircle, CircleDashed, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface AnalysisProgressProps {
  status: AnalysisStatus;
  progress: number;
  currentStage: string;
  className?: string;
}

export function AnalysisProgress({
  status,
  progress,
  currentStage,
  className,
}: AnalysisProgressProps) {
  const stages = [
    { id: "queued", label: "Queued" },
    { id: "extracting", label: "Extracting Clauses" },
    { id: "scoring", label: "Scoring Risk" },
    { id: "explaining", label: "Generating Explanations" },
    { id: "done", label: "Complete" },
  ];

  const currentStageIndex = stages.findIndex((s) => s.id === status);

  // If failed, show failure state
  if (status === "failed") {
    return (
      <div
        className={cn(
          "bg-risk-critical/10 border border-risk-critical/30 rounded-xl p-6 text-center",
          className,
        )}
      >
        <p className="text-risk-critical font-medium mb-2">Analysis Failed</p>
        <p className="text-sm text-risk-critical/80">
          There was an error processing this contract.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("bg-surface border border-border rounded-xl p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-text">Analysis Progress</h3>
        <span className="text-sm font-medium text-primary">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Stages List */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const isComplete = index < currentStageIndex || status === "done";
          const isCurrent = index === currentStageIndex && status !== "done";
          const isPending = index > currentStageIndex;

          return (
            <div
              key={stage.id}
              className={cn(
                "flex items-center gap-3 transition-opacity duration-300",
                isPending ? "opacity-40" : "opacity-100",
              )}
            >
              {isComplete ? (
                <CheckCircle className="w-5 h-5 text-primary" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <CircleDashed className="w-5 h-5 text-muted" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  isCurrent ? "text-primary" : isComplete ? "text-text" : "text-muted",
                )}
              >
                {stage.label}
              </span>
              {isCurrent && currentStage && (
                <span className="text-xs text-faint ml-auto animate-pulse">{currentStage}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
