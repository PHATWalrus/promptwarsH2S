import type { Clause } from "@lexguard/types";

export type ContractTextSegment =
  | { kind: "text"; key: string; text: string }
  | { kind: "clause"; key: string; text: string; clause: Clause; active: boolean };

export function buildContractTextSegments(
  text: string,
  clauses: Clause[],
  highlightedClauseId?: string | null,
): ContractTextSegment[] {
  if (!clauses || clauses.length === 0) {
    return [{ kind: "text", key: "text-0", text }];
  }

  const sortedClauses = [...clauses].sort((a, b) => (a.spanStart || 0) - (b.spanStart || 0));
  const segments: ContractTextSegment[] = [];
  let currentIndex = 0;

  sortedClauses.forEach((clause) => {
    if (
      clause.spanStart !== undefined &&
      clause.spanStart !== null &&
      clause.spanEnd !== undefined &&
      clause.spanEnd !== null &&
      clause.spanStart >= currentIndex
    ) {
      segments.push({
        kind: "text",
        key: `text-${currentIndex}`,
        text: text.slice(currentIndex, clause.spanStart),
      });
      segments.push({
        kind: "clause",
        key: `clause-${clause.id}`,
        text: text.slice(clause.spanStart, clause.spanEnd),
        clause,
        active: highlightedClauseId === clause.id,
      });
      currentIndex = clause.spanEnd;
    }
  });

  if (currentIndex < text.length) {
    segments.push({ kind: "text", key: `text-${currentIndex}`, text: text.slice(currentIndex) });
  }

  return segments.length > 0 ? segments : [{ kind: "text", key: "text-0", text }];
}
