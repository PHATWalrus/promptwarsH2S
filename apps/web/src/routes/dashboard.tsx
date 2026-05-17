import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, FileText } from "lucide-react";
import type React from "react";
import { Button } from "../components/ui/Button";
import { useContracts } from "../hooks/useContracts";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

function DashboardPage() {
  const { data: contracts = [], isLoading } = useContracts();
  const processingCount = contracts.filter(
    (contract) => contract.status === "processing" || contract.status === "uploaded",
  ).length;
  const completedCount = contracts.filter((contract) => contract.status === "completed").length;
  const failedCount = contracts.filter((contract) => contract.status === "failed").length;
  const recentContracts = contracts.slice(0, 4);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-text mb-1">Overview</h1>
          <p className="text-muted">
            Welcome back. Here&apos;s what&apos;s happening with your contracts.
          </p>
        </div>
        <Link to="/contracts/upload">
          <Button variant="primary" className="w-full md:w-auto">
            Upload Contract
          </Button>
        </Link>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Total Contracts"
          value={contracts.length}
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Needs Attention"
          value={failedCount}
          accent="text-risk-critical"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Completed"
          value={completedCount}
          accent="text-risk-low"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Processing"
          value={processingCount}
          accent="text-risk-medium"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-surface border border-border rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-text mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted">Loading recent contracts...</p>
            ) : recentContracts.length === 0 ? (
              <p className="text-sm text-muted">
                No contracts yet. Upload a file or import a legal URL to begin.
              </p>
            ) : (
              recentContracts.map((contract) => (
                <Link
                  key={contract.id}
                  to="/contracts/$id"
                  params={{ id: contract.id }}
                  className="flex items-center justify-between p-3 hover:bg-surface-2 rounded-lg transition-colors group cursor-pointer border border-transparent hover:border-border"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center text-muted">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text truncate">{contract.title}</p>
                      <p className="text-xs text-muted capitalize">{contract.status}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-surface border border-border rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-text mb-4">Pipeline Health</h3>
          <div className="space-y-4">
            <Progress
              label="Completed"
              value={contracts.length ? Math.round((completedCount / contracts.length) * 100) : 0}
              className="bg-risk-low"
            />
            <Progress
              label="Processing"
              value={contracts.length ? Math.round((processingCount / contracts.length) * 100) : 0}
              className="bg-risk-medium"
            />
            <Progress
              label="Failed"
              value={contracts.length ? Math.round((failedCount / contracts.length) * 100) : 0}
              className="bg-risk-critical"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent = "text-primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <motion.div
      variants={item}
      className="bg-surface border border-border rounded-xl p-5 shadow-sm hover:border-border-hover transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center ${accent}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-sm text-muted mb-1">{label}</p>
      <h2 className="text-3xl font-medium text-text">{value}</h2>
    </motion.div>
  );
}

function Progress({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="text-text font-medium">{value}%</span>
      </div>
      <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
        <div className={`h-full ${className}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
