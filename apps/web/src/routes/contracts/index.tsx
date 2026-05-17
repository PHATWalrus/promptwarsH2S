import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Filter, MoreVertical, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-text mb-1">My Contracts</h1>
          <p className="text-muted">Manage and analyze your legal documents.</p>
        </div>
        <Link to="/contracts/upload">
          <Button variant="primary" className="w-full md:w-auto flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Contract
          </Button>
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-1">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              placeholder="Search contracts..."
              className="pl-9 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="ghost" className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-surface-2 text-xs font-medium text-muted uppercase tracking-wider">
          <div className="col-span-6">Document Name</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Date Added</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence initial={false}>
            {filteredContracts.map((contract) => (
              <motion.div
                key={contract.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-12 gap-4 p-4 border-b border-border hover:bg-surface-2 transition-colors items-center group cursor-pointer"
              >
                <div className="col-span-6 flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded bg-surface-1 border border-border flex items-center justify-center text-muted">
                    <FileText className="w-4 h-4" />
                  </div>
                  <Link
                    to="/contracts/$id"
                    params={{ id: contract.id }}
                    className="font-medium text-text hover:text-primary truncate transition-colors"
                  >
                    {contract.title}
                  </Link>
                </div>
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClass(contract.status)}`}
                  >
                    {contract.status}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-muted">
                  {contract.createdAt
                    ? new Date(contract.createdAt).toLocaleDateString()
                    : "Unknown"}
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    className="p-2 text-muted hover:text-text rounded-md hover:bg-surface-1 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && <div className="p-12 text-center text-muted">Loading contracts...</div>}
          {isError && (
            <div className="p-12 text-center text-risk-critical">
              Unable to load contracts. Check your session and API connection.
            </div>
          )}
          {!isLoading && !isError && filteredContracts.length === 0 && (
            <div className="p-12 text-center text-muted">
              No contracts found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function statusClass(status: string) {
  if (status === "failed") return "bg-risk-critical/10 text-risk-critical";
  if (status === "processing" || status === "uploaded") return "bg-risk-medium/10 text-risk-medium";
  if (status === "deleted") return "bg-muted/10 text-muted";
  return "bg-risk-low/10 text-risk-low";
}
