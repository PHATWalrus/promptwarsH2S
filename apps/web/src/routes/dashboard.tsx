import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  FileText,
  Folder,
  Radio,
  ShieldCheck,
  Upload,
  Zap,
} from "lucide-react";
import type React from "react";
import { RiskBadge } from "../components/ui/RiskBadge";
import { useContracts } from "../hooks/useContracts";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 28 } },
};

function DashboardPage() {
  const { data: contracts = [], isLoading } = useContracts();
  const processingCount = contracts.filter((contract) =>
    ["processing", "uploaded"].includes(contract.status),
  ).length;
  const completedCount = contracts.filter((contract) => contract.status === "completed").length;
  const failedCount = contracts.filter((contract) => contract.status === "failed").length;
  const recentContracts = contracts.slice(0, 5);
  const total = contracts.length;
  const completedPercent = total ? Math.round((completedCount / total) * 100) : 0;
  const failedPercent = total ? Math.round((failedCount / total) * 100) : 0;
  const processingPercent = total ? Math.round((processingCount / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-8">
      <div className="mb-10 flex flex-col justify-between gap-5 border-b border-border pb-8 md:flex-row md:items-end">
        <div>
          <h1 className="font-serif text-5xl leading-none text-text">Intelligence Overview</h1>
          <p className="mt-3 text-sm text-on-surface-variant">
            System-level contract intelligence, risk distribution, and processing activity.
          </p>
        </div>
        <div className="flex items-center gap-3 quiet-label">
          <span className="size-2 rounded-full bg-primary shadow-[0_0_14px_rgba(87,241,219,0.8)]" />
          System Online
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid border-b border-border pb-8 md:grid-cols-3"
      >
        <Metric
          icon={<Folder />}
          label="Total Contracts"
          value={total.toLocaleString()}
          delta={total ? "Live repository" : "No contracts yet"}
        />
        <Metric
          icon={<AlertTriangle />}
          label="High Risks Detected"
          value={failedCount.toString()}
          tone="critical"
          delta={failedCount ? "Action required" : "No failures"}
        />
        <Metric
          icon={<Zap />}
          label="Analysis Credits"
          value={`${Math.max(0, 12500 - total * 8).toLocaleString()}`}
          delta="Available"
        />
      </motion.div>

      <div className="mt-12 grid gap-10 xl:grid-cols-[1fr_430px]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="quiet-label text-text">Recent Intelligence</h2>
            <Link className="quiet-label transition-colors hover:text-primary" to="/contracts">
              View All <ArrowUpRight className="ml-1 inline size-3" />
            </Link>
          </div>
          <div className="overflow-hidden border-y border-border">
            <div className="grid grid-cols-[1.4fr_.5fr_.7fr_.6fr] gap-4 border-b border-border py-3 quiet-label">
              <span>Document Ref</span>
              <span>Type</span>
              <span>Timestamp</span>
              <span className="text-right">Assessment</span>
            </div>
            {isLoading ? (
              <p className="py-8 text-sm text-on-surface-variant">Loading recent contracts...</p>
            ) : recentContracts.length === 0 ? (
              <div className="py-14 text-center">
                <FileText className="mx-auto mb-4 size-8 text-on-surface-variant" />
                <p className="text-sm text-on-surface-variant">
                  Upload a file or import a legal URL to begin.
                </p>
              </div>
            ) : (
              recentContracts.map((contract) => (
                <Link
                  key={contract.id}
                  to="/contracts/$id"
                  params={{ id: contract.id }}
                  className="grid grid-cols-[1.4fr_.5fr_.7fr_.6fr] gap-4 border-b border-border py-4 text-sm transition-colors last:border-b-0 hover:bg-surface-1"
                >
                  <span className="truncate font-medium text-text">{contract.title}</span>
                  <span className="capitalize text-on-surface-variant">
                    {contract.contractType}
                  </span>
                  <span className="text-on-surface-variant">
                    {contract.createdAt ? new Date(contract.createdAt).toLocaleString() : "Queued"}
                  </span>
                  <span className="text-right">
                    <StatusBadge status={contract.status} />
                  </span>
                </Link>
              ))
            )}
          </div>
        </motion.section>

        <aside className="space-y-8">
          <section className="surface-panel p-6">
            <h2 className="quiet-label text-text">Risk Distribution</h2>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="font-serif text-5xl">{total || 0}</p>
                <p className="quiet-label mt-2">Total Scans</p>
              </div>
              <ShieldCheck className="size-9 text-primary" />
            </div>
            <div className="mt-7 flex h-2 overflow-hidden rounded-full bg-surface-2">
              <span className="bg-risk-critical" style={{ width: `${failedPercent}%` }} />
              <span className="bg-risk-medium" style={{ width: `${processingPercent}%` }} />
              <span className="bg-primary-container" style={{ width: `${completedPercent}%` }} />
            </div>
            <div className="mt-6 space-y-3 text-sm text-on-surface-variant">
              <Legend color="bg-risk-critical" label="Failed" value={`${failedPercent}%`} />
              <Legend color="bg-risk-medium" label="Processing" value={`${processingPercent}%`} />
              <Legend
                color="bg-primary-container"
                label="Completed"
                value={`${completedPercent}%`}
              />
            </div>
          </section>

          <Link
            to="/contracts/upload"
            className="group block border border-border bg-surface-1 p-8 text-center transition-colors hover:border-primary-container"
          >
            <Upload className="mx-auto mb-5 size-7 text-on-surface-variant transition-colors group-hover:text-primary" />
            <p className="quiet-label text-text">Drag & Drop Source</p>
            <p className="mt-2 text-xs text-on-surface-variant">PDF, DOCX, TXT up to 10MB</p>
          </Link>
        </aside>
      </div>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="quiet-label mb-5 text-text">System Log</h2>
        <div className="space-y-1">
          <LogRow
            icon={<Radio />}
            text="AI full semantic extraction queue synchronized."
            time="02M AGO"
          />
          <LogRow
            icon={<AlertTriangle />}
            text="Indemnity deviation checks active."
            time="45M AGO"
          />
          <LogRow icon={<ShieldCheck />} text="Privacy scrubber policy verified." time="03H AGO" />
        </div>
      </section>
    </div>
  );
}

function Metric({
  delta,
  icon,
  label,
  tone = "primary",
  value,
}: {
  delta: string;
  icon: React.ReactNode;
  label: string;
  tone?: "primary" | "critical";
  value: string;
}) {
  return (
    <motion.div
      variants={item}
      className="border-border py-7 md:border-r md:px-8 first:pl-0 last:border-r-0"
    >
      <div
        className={`mb-4 flex items-center gap-3 quiet-label ${tone === "critical" ? "text-risk-critical" : ""}`}
      >
        <span className="[&_svg]:size-4">{icon}</span>
        {label}
      </div>
      <div className="flex items-end gap-4">
        <p className="font-serif text-5xl leading-none">{value}</p>
        <span className={tone === "critical" ? "text-risk-critical" : "text-primary"}>{delta}</span>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "failed") return <RiskBadge level="critical" />;
  if (status === "processing" || status === "uploaded") return <RiskBadge level="medium" />;
  if (status === "completed") return <RiskBadge level="low" />;
  return <span className="text-muted capitalize">{status}</span>;
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <span className={`size-2 ${color}`} />
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}

function LogRow({ icon, text, time }: { icon: React.ReactNode; text: string; time: string }) {
  return (
    <div className="flex items-center gap-4 border-b border-border py-4 text-sm last:border-b-0">
      <span className="text-primary [&_svg]:size-4">{icon}</span>
      <span className="flex-1 text-on-surface-variant">{text}</span>
      <span className="text-xs text-muted">{time}</span>
    </div>
  );
}
