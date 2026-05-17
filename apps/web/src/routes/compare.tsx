import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, Filter, GitCompare, Lock, Search } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { RiskBadge } from "../components/ui/RiskBadge";
import { useContracts } from "../hooks/useContracts";
import { api } from "../lib/api";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
});

interface CompareMatrix {
  contractIds: string[];
  matrix: Array<{
    term: string;
    contracts: Array<{
      contractId: string;
      clauses: Array<{
        clauseId: string;
        riskLevel: string;
        riskScore: number;
        summary: string;
      }>;
    }>;
  }>;
}

function ComparePage() {
  const { data: contracts = [], isLoading } = useContracts();
  const [selected, setSelected] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<CompareMatrix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const runCompare = async () => {
    if (selected.length < 2) return;
    setError(null);
    setIsComparing(true);
    try {
      const { data } = await api.post<CompareMatrix>("/compare", { contractIds: selected });
      setMatrix(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compare failed. Select analyzed contracts.");
    } finally {
      setIsComparing(false);
    }
  };

  const toggleContract = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      return current.length >= 5 ? current : [...current, id];
    });
  };

  const comparisonRows = matrix?.matrix.length
    ? matrix.matrix
    : [
        {
          term: "limitation_of_liability",
          contracts: selected.map((contractId) => ({
            contractId,
            clauses: [],
          })),
        },
        {
          term: "governing_law",
          contracts: selected.map((contractId) => ({
            contractId,
            clauses: [],
          })),
        },
      ];

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-8 md:px-8">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="font-serif text-2xl">Master Services Agreement Comparison</p>
          <h1 className="mt-2 text-2xl text-on-surface-variant">
            Comparing base template against selected vendor revisions.
          </h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary">
            <Filter className="size-4" />
            Filter Differences
          </Button>
          <Button disabled={selected.length < 2 || isComparing} onClick={runCompare}>
            <GitCompare className="size-4" />
            {isComparing ? "Running..." : "Run Analysis"}
          </Button>
          <Button variant="secondary">
            <Download className="size-4" />
            Export Report
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-[8px] border border-risk-critical/30 bg-risk-critical/10 px-3 py-2 text-sm text-risk-critical">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="surface-panel p-5">
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
            <Input placeholder="Search clauses, terms..." className="pl-9" readOnly />
          </div>
          <p className="quiet-label mb-4 text-text">Select Contracts</p>
          {isLoading ? (
            <p className="text-sm text-on-surface-variant">Loading contracts...</p>
          ) : contracts.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Upload contracts before comparing.</p>
          ) : (
            <div className="space-y-2">
              {contracts.map((contract) => (
                <button
                  key={contract.id}
                  type="button"
                  onClick={() => toggleContract(contract.id)}
                  className={`w-full rounded-[8px] border p-3 text-left transition-colors ${
                    selected.includes(contract.id)
                      ? "border-primary bg-surface-2 text-text"
                      : "border-border bg-bg text-on-surface-variant hover:border-border-hover"
                  }`}
                >
                  <p className="truncate text-sm font-medium">{contract.title}</p>
                  <p className="text-xs capitalize">{contract.contractType}</p>
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="overflow-hidden rounded-[8px] border border-border bg-surface-1">
          <div className="grid min-w-[900px] grid-cols-4 border-b border-border">
            <HeaderCell>Clause Category</HeaderCell>
            {selected.slice(0, 3).map((contractId, index) => {
              const contract = contracts.find((item) => item.id === contractId);
              return (
                <HeaderCell key={contractId} active={index === 0}>
                  <div className="flex items-center justify-between gap-3">
                    <span>{contract?.title ?? `Contract ${index + 1}`}</span>
                    {index === 0 && <Lock className="size-4 text-on-surface-variant" />}
                  </div>
                  <p className="mt-3 text-sm font-normal normal-case tracking-normal text-on-surface-variant">
                    {index === 0 ? "Internal Standard" : "Vendor Draft"}
                  </p>
                </HeaderCell>
              );
            })}
            {selected.length === 0 && (
              <>
                <HeaderCell active>Base Template v2</HeaderCell>
                <HeaderCell>Vendor A Draft</HeaderCell>
                <HeaderCell>Vendor B Draft</HeaderCell>
              </>
            )}
          </div>

          <div className="overflow-x-auto">
            {comparisonRows.map((row) => (
              <motion.div
                key={row.term}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid min-w-[900px] grid-cols-4 border-b border-border last:border-b-0"
              >
                <div className="bg-surface-1 p-6">
                  <p className="font-serif text-2xl capitalize">{row.term.replaceAll("_", " ")}</p>
                  <p className="mt-3 text-sm text-on-surface-variant">
                    Review deviations from internal standard.
                  </p>
                </div>
                {(selected.length ? selected.slice(0, 3) : ["base", "vendor-a", "vendor-b"]).map(
                  (contractId, index) => {
                    const contractMatch = row.contracts.find(
                      (entry) => entry.contractId === contractId,
                    );
                    const clause = contractMatch?.clauses[0];
                    return (
                      <div
                        className="min-h-56 border-l border-border bg-[#f9fafb] p-6 text-[#1a1c22]"
                        key={`${row.term}-${contractId}`}
                      >
                        {clause ? (
                          <>
                            <RiskBadge level={riskLevel(clause.riskLevel)} className="mb-4" />
                            <p className="text-lg leading-8">{clause.summary}</p>
                          </>
                        ) : (
                          <p className="text-lg italic leading-8 text-[#7b8682]">
                            {index === 0
                              ? '"Internal baseline clause available after analysis."'
                              : "No deviation found."}
                          </p>
                        )}
                      </div>
                    );
                  },
                )}
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function HeaderCell({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <div className="border-l border-border p-6 first:border-l-0">
      <div
        className={`quiet-label text-lg normal-case tracking-normal ${active ? "text-primary" : "text-text"}`}
      >
        {children}
      </div>
    </div>
  );
}

function riskLevel(level: string): "critical" | "high" | "medium" | "low" {
  if (level === "critical" || level === "high" || level === "medium" || level === "low") {
    return level;
  }
  return "medium";
}
