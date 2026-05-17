import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FileText, Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { RiskBadge } from "../../components/ui/RiskBadge";
import { useContracts } from "../../hooks/useContracts";

export const Route = createFileRoute("/contracts/")({
  component: ContractsPage,
});

function ContractsPage() {
  const [search, setSearch] = useState("");
  const { data: contracts = [], isLoading, isError } = useContracts();

  const filteredContracts = contracts.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-8">
      <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <h1 className="font-serif text-5xl leading-none">Contract Repository</h1>
          <p className="mt-3 text-on-surface-variant">
            Manage and analyze your active legal agreements.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary">
            <Download className="size-4" />
            Export
          </Button>
          <Link to="/contracts/upload">
            <Button className="w-full sm:w-auto">
              <Plus className="size-4" />
              New Contract
            </Button>
          </Link>
        </div>
      </div>

      <section className="surface-panel overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-border p-5 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
            <span className="inline-flex size-5 rounded-[4px] border border-border" />
            <span>0 Selected</span>
            <span className="h-6 w-px bg-border" />
            <span className="inline-flex items-center gap-2">
              <Filter className="size-4" />
              Filters
            </span>
            <span className="rounded-[6px] border border-border bg-surface-2 px-3 py-1 text-text">
              Risk: High ×
            </span>
          </div>
          <div className="flex gap-3">
            <div className="relative w-full min-w-0 sm:w-80">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
              <Input
                aria-label="Search this contracts view"
                placeholder="Search this view..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button aria-label="Filter view" variant="secondary" className="px-3">
              <SlidersHorizontal className="size-4" />
            </Button>
          </div>
        </div>

        <div className="hidden grid-cols-[44px_1.6fr_1fr_1fr_1fr_120px] gap-4 border-b border-border px-5 py-4 quiet-label md:grid">
          <span />
          <span>Contract Title / Party</span>
          <span>Category</span>
          <span>Risk Level</span>
          <span>Effective Date</span>
          <span className="text-right">Actions</span>
        </div>

        <div>
          <AnimatePresence initial={false}>
            {filteredContracts.map((contract) => (
              <motion.div
                key={contract.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="grid gap-4 border-b border-border px-5 py-5 text-sm transition-colors last:border-b-0 hover:bg-surface-2/60 md:grid-cols-[44px_1.6fr_1fr_1fr_1fr_120px] md:items-center"
              >
                <span className="hidden size-5 rounded-[4px] border border-border md:block" />
                <div className="min-w-0">
                  <Link
                    to="/contracts/$id"
                    params={{ id: contract.id }}
                    className="font-medium text-text transition-colors hover:text-primary"
                  >
                    {contract.title}
                  </Link>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    ID: {contract.id.slice(0, 12)}
                  </p>
                </div>
                <span className="capitalize text-on-surface-variant">
                  {contract.contractType.replace("_", " ")}
                </span>
                <span>
                  <StatusBadge status={contract.status} />
                </span>
                <span className="text-on-surface-variant">
                  {contract.createdAt
                    ? new Date(contract.createdAt).toLocaleDateString()
                    : "Unknown"}
                </span>
                <div className="flex justify-start md:justify-end">
                  <Link
                    to="/contracts/$id"
                    params={{ id: contract.id }}
                    className="quiet-label rounded-[6px] border border-border px-3 py-2 transition-colors hover:border-primary hover:text-primary"
                  >
                    Open
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="p-12 text-center text-on-surface-variant">Loading contracts...</div>
          )}
          {isError && (
            <div className="p-12 text-center text-risk-critical">
              Unable to load contracts. Check your session and API connection.
            </div>
          )}
          {!isLoading && !isError && filteredContracts.length === 0 && (
            <div className="p-16 text-center">
              <FileText className="mx-auto mb-4 size-9 text-on-surface-variant" />
              <p className="text-on-surface-variant">No contracts found matching your search.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4 text-sm text-on-surface-variant">
          <span>
            Showing {filteredContracts.length ? 1 : 0}-{filteredContracts.length} of{" "}
            {contracts.length}
          </span>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((page) => (
              <button
                className={`grid size-9 place-items-center rounded-[6px] ${page === 1 ? "bg-surface-2 text-text" : "hover:bg-surface-2"}`}
                key={page}
                type="button"
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "failed") return <RiskBadge level="critical" />;
  if (status === "processing" || status === "uploaded") return <RiskBadge level="medium" />;
  if (status === "completed") return <RiskBadge level="low" />;
  return <span className="text-muted capitalize">{status}</span>;
}
