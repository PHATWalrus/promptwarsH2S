import type { Clause } from "@lexguard/types";
import type React from "react";
import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { useContractStore } from "../../store/contract.store";
import { buildContractTextSegments } from "./contractTextSegments";

interface ContractViewerProps {
  text: string;
  clauses: Clause[];
  className?: string;
}

export function ContractViewer({ text, clauses, className }: ContractViewerProps) {
  const { highlightedClauseId, setHighlight } = useContractStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to wrap spans of text with highlight styles
  const renderHighlightedText = () => {
    if (!clauses || clauses.length === 0)
      return (
        <p className="whitespace-pre-wrap font-sans text-[18px] leading-[1.7] text-[#1a1c22]">
          {text}
        </p>
      );

    const segments = buildContractTextSegments(text, clauses, highlightedClauseId);
    const elements: React.ReactNode[] = segments.map((segment) => {
      if (segment.kind === "text") {
        return (
          <span key={segment.key} className="text-[#1a1c22]">
            {segment.text}
          </span>
        );
      }

      return (
        <button
          type="button"
          key={segment.key}
          id={`clause-${segment.clause.id}`}
          className={cn(
            "cursor-pointer relative px-0.5 rounded-sm transition-colors bg-transparent border-0 text-left font-inherit",
            `highlight-${segment.clause.riskLevel}`,
            segment.active && "active ring-2 ring-primary/50 z-10 bg-opacity-30",
          )}
          onClick={() => setHighlight(segment.clause.id)}
        >
          {segment.text}
        </button>
      );
    });

    return (
      <div className="whitespace-pre-wrap font-sans text-[18px] leading-[1.7] break-words text-[#1a1c22]">
        {elements.length > 0 ? elements : <span>{text}</span>}
      </div>
    );
  };

  // Scroll to highlighted clause when it changes
  useEffect(() => {
    if (highlightedClauseId && containerRef.current) {
      const el = containerRef.current.querySelector(`#clause-${highlightedClauseId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightedClauseId]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-[#f9fafb] p-10 md:p-16 text-[#1a1c22] border border-black/10 shadow-[0_1px_12px_rgba(0,0,0,0.08)] overflow-y-auto paper-scrollbar",
        className,
      )}
    >
      {renderHighlightedText()}
    </div>
  );
}
