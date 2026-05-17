import type { Clause } from "@lexguard/types";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Flag, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { useContractStore } from "../../store/contract.store";
import { RiskBadge } from "./RiskBadge";

interface ClauseCardProps {
  clause: Clause;
  onFeedback?: (clauseId: string, type: "helpful" | "other") => void;
}

export function ClauseCard({ clause, onFeedback }: ClauseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { highlightedClauseId, setHighlight } = useContractStore();
  const isActive = highlightedClauseId === clause.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-surface-1 border rounded-[8px] overflow-hidden transition-all duration-300",
        isActive
          ? "bg-surface-2 border-primary shadow-[0_0_15px_rgba(45,212,191,0.1)]"
          : "border-border hover:bg-surface-2 hover:border-border-hover",
      )}
    >
      <button
        type="button"
        className="p-4 cursor-pointer flex flex-col gap-3 w-full text-left"
        onClick={() => {
          setHighlight(clause.id);
          setExpanded(!expanded);
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <RiskBadge level={clause.riskLevel} />
            <span className="rounded-[4px] bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted capitalize">
              {clause.category.replace("_", " ")}
            </span>
          </div>
          <span className="text-muted hover:text-text transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>

        <p className="text-sm text-text leading-relaxed">
          {clause.plainExplanation || "No plain explanation available."}
        </p>

        <div className="line-clamp-2 rounded-[4px] bg-bg p-2 font-mono text-xs text-faint">
          "{clause.rawText.substring(0, 120)}
          {clause.rawText.length > 120 ? "..." : ""}"
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border bg-bg/45"
          >
            <div className="p-4 flex flex-col gap-4 text-sm">
              {clause.riskRationale && (
                <div>
                  <h4 className="font-semibold text-text mb-1">Risk Rationale</h4>
                  <p className="text-muted leading-relaxed">{clause.riskRationale}</p>
                </div>
              )}

              {clause.scenarioIllustration && (
                <div>
                  <h4 className="font-semibold text-text mb-1">Scenario Example</h4>
                  <p className="text-muted leading-relaxed">{clause.scenarioIllustration}</p>
                </div>
              )}

              {clause.negotiationTips && clause.negotiationTips.length > 0 && (
                <div>
                  <h4 className="font-semibold text-text mb-1">Negotiation Tips</h4>
                  <ul className="list-disc list-inside text-muted space-y-1">
                    {clause.negotiationTips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between mt-2 pt-4 border-t border-border">
                <span className="text-xs text-faint">
                  Confidence:{" "}
                  {clause.confidenceScore ? Math.round(clause.confidenceScore * 100) : "--"}%
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFeedback?.(clause.id, "helpful");
                    }}
                    className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors"
                    title="Helpful"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFeedback?.(clause.id, "other");
                    }}
                    className="p-1.5 text-muted hover:text-risk-critical hover:bg-risk-critical/10 rounded transition-colors"
                    title="Flag issue"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
