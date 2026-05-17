import type { Clause } from "@lexguard/types";
import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { useContractStore } from "../../store/contract.store";

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
        <p className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-muted">
          {text}
        </p>
      );

    // Sort clauses by start span to process them sequentially
    // Note: overlapping spans need complex logic, assuming non-overlapping or using simple string replacement for now
    // For a robust implementation, we would build a tree of spans or use a tokenizer.
    // For this prototype, we'll assume clauses have rawText and we can highlight occurrences.

    // Sort by spanStart if available, or just fallback
    const sortedClauses = [...clauses].sort((a, b) => (a.spanStart || 0) - (b.spanStart || 0));

    // Fallback: render text normally if we don't have span indices for this MVP
    // In a real app, we'd slice the string based on spanStart and spanEnd

    const elements: React.ReactNode[] = [];
    let currentIndex = 0;

    sortedClauses.forEach((clause) => {
      if (
        clause.spanStart !== undefined &&
        clause.spanStart !== null &&
        clause.spanEnd !== undefined &&
        clause.spanEnd !== null
      ) {
        if (clause.spanStart >= currentIndex) {
          // Add unhighlighted text before the clause
          elements.push(
            <span key={`text-${currentIndex}`} className="text-muted">
              {text.slice(currentIndex, clause.spanStart)}
            </span>,
          );

          // Add highlighted clause
          const isHighlighted = highlightedClauseId === clause.id;
          elements.push(
            <button
              type="button"
              key={`clause-${clause.id}`}
              id={`clause-${clause.id}`}
              className={cn(
                "cursor-pointer relative px-0.5 rounded-sm transition-colors bg-transparent border-0 text-left font-inherit",
                `highlight-${clause.riskLevel}`,
                isHighlighted && "active ring-2 ring-primary/50 z-10 bg-opacity-30",
              )}
              onClick={() => setHighlight(clause.id)}
            >
              {text.slice(clause.spanStart, clause.spanEnd)}
            </button>,
          );

          currentIndex = clause.spanEnd;
        }
      }
    });

    // Add remaining text
    if (currentIndex < text.length) {
      elements.push(
        <span key={`text-${currentIndex}`} className="text-muted">
          {text.slice(currentIndex)}
        </span>,
      );
    }

    return (
      <div className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed break-words">
        {elements.length > 0 ? elements : <span className="text-muted">{text}</span>}
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
        "bg-surface p-6 rounded-xl border border-border shadow-sm overflow-y-auto custom-scrollbar",
        className,
      )}
    >
      {renderHighlightedText()}
    </div>
  );
}
