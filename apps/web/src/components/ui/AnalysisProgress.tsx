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
    { id: "queued", label: "Step 1: Parsing", detail: "Document structure mapped." },
    {
      id: "extracting",
      label: "Step 2: Extracting",
      detail: "Key clauses and defined terms identified.",
    },
    {
      id: "scoring",
      label: "Step 3: Scoring Risk",
      detail: "Evaluating liability and indemnity positions.",
    },
    {
      id: "explaining",
      label: "Step 4: Privacy Check",
      detail: "Scrubbing and classifying sensitive content.",
    },
    { id: "done", label: "Step 5: Explaining", detail: "Generating human-readable summaries." },
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
    <div className={cn("bg-surface-1 border border-border rounded-[8px] p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-2xl text-text">Intelligence Pipeline</h3>
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
      <div className="space-y-0">
        {stages.map((stage, index) => {
          const isComplete = index < currentStageIndex || status === "done";
          const isCurrent = index === currentStageIndex && status !== "done";
          const isPending = index > currentStageIndex;

          return (
            <div
              key={stage.id}
              className={cn(
                "relative flex gap-4 pb-7 transition-opacity duration-300 last:pb-0",
                isPending ? "opacity-40" : "opacity-100",
              )}
            >
              {index < stages.length - 1 && (
                <span className="absolute left-[9px] top-6 h-[calc(100%-24px)] w-px bg-border" />
              )}
              {isComplete ? (
                <CheckCircle className="relative z-10 w-5 h-5 text-primary bg-surface-1" />
              ) : isCurrent ? (
                <Loader2 className="relative z-10 w-5 h-5 text-primary animate-spin bg-surface-1" />
              ) : (
                <CircleDashed className="relative z-10 w-5 h-5 text-muted bg-surface-1" />
              )}
              <div className="min-w-0">
                <div
                  className={cn(
                    "quiet-label",
                    isCurrent ? "text-primary" : isComplete ? "text-text" : "text-muted",
                  )}
                >
                  {stage.label}
                  {isCurrent && currentStage && (
                    <span className="ml-2 rounded-[4px] border border-primary/30 px-2 py-0.5 text-[10px] text-primary">
                      Processing
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{stage.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
