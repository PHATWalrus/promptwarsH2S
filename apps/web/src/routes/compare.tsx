import { createFileRoute } from "@tanstack/react-router";
import { GitCompare, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex-shrink-0 h-16 border-b border-border bg-surface px-6 flex items-center justify-between z-10">
        <div>
          <h1 className="text-lg font-medium text-text">Compare Contracts</h1>
          <p className="text-xs text-muted">Select two to five documents for key-term comparison</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="flex items-center gap-2"
          disabled={selected.length < 2 || isComparing}
          onClick={runCompare}
        >
          <GitCompare className="w-4 h-4" /> Run Analysis
        </Button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] overflow-hidden">
        <aside className="border-r border-border bg-surface p-4 overflow-y-auto">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input placeholder="Select contracts..." className="pl-9 w-full" readOnly />
          </div>
          {isLoading ? (
            <p className="text-sm text-muted">Loading contracts...</p>
          ) : contracts.length === 0 ? (
            <p className="text-sm text-muted">Upload or import contracts before comparing.</p>
          ) : (
            <div className="space-y-2">
              {contracts.map((contract) => (
                <button
                  key={contract.id}
                  type="button"
                  onClick={() => toggleContract(contract.id)}
                  className={`w-full rounded-[8px] border p-3 text-left transition-colors ${
                    selected.includes(contract.id)
                      ? "border-primary bg-primary/10 text-text"
                      : "border-border bg-surface-1 text-muted hover:text-text"
                  }`}
                >
                  <p className="text-sm font-medium truncate">{contract.title}</p>
                  <p className="text-xs capitalize">{contract.status}</p>
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="overflow-y-auto bg-surface-1 p-6">
          {error && (
            <div className="mb-4 rounded-md border border-risk-critical/30 bg-risk-critical/10 px-3 py-2 text-sm text-risk-critical">
              {error}
            </div>
          )}
          {!matrix ? (
            <div className="h-full min-h-[420px] flex items-center justify-center rounded-xl border border-border bg-surface text-muted">
              Select contracts and run comparison to build a side-by-side matrix.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-surface-2 text-muted">
                  <tr>
                    <th className="text-left p-4 font-medium">Key Term</th>
                    {matrix.contractIds.map((id) => (
                      <th key={id} className="text-left p-4 font-medium">
                        {contracts.find((contract) => contract.id === id)?.title ?? id}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.matrix.map((row) => (
                    <tr key={row.term} className="border-t border-border align-top">
                      <td className="p-4 font-medium text-text capitalize">
                        {row.term.replaceAll("_", " ")}
                      </td>
                      {row.contracts.map((contract) => (
                        <td key={contract.contractId} className="p-4 text-muted">
                          {contract.clauses.length === 0 ? (
                            <span className="text-faint">No matching clause</span>
                          ) : (
                            <div className="space-y-2">
                              {contract.clauses.map((clause) => (
                                <div key={clause.clauseId} className="rounded-md bg-surface-2 p-3">
                                  <p className="text-xs uppercase text-faint">
                                    {clause.riskLevel} · {clause.riskScore}
                                  </p>
                                  <p>{clause.summary}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
