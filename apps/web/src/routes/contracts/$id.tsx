import type { AnalysisStatus, Clause, RiskLevel } from "@lexguard/types";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Download, Menu, MessageSquare, Minus, Plus, Share2, Wand2 } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { AnalysisProgress } from "../../components/ui/AnalysisProgress";
import { Button } from "../../components/ui/Button";
import { ContractViewer } from "../../components/ui/ContractViewer";
import { Input } from "../../components/ui/Input";
import { LexguardLogo } from "../../components/ui/LexguardLogo";
import { RiskBadge } from "../../components/ui/RiskBadge";
import { useChatHistory, useSendMessage } from "../../hooks/useChat";
import {
  useAnalysisResult,
  useAnalysisStatus,
  useClauses,
  useContract,
} from "../../hooks/useContracts";
import { api } from "../../lib/api";

export const Route = createFileRoute("/contracts/$id")({
  component: AnalysisView,
});

function AnalysisView() {
  const { id } = Route.useParams();
  const [message, setMessage] = useState("");
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "clauses" | "chat">("clauses");
  const contract = useContract(id);
  const status = useAnalysisStatus(id);
  const analysis = useAnalysisResult(id);
  const clauses = useClauses(id);
  const chatHistory = useChatHistory(id);
  const sendMessage = useSendMessage(id);

  const displayedClauses = useMemo<Clause[]>(() => {
    if (analysis.data?.clauses?.length) return analysis.data.clauses;
    return clauses.data ?? [];
  }, [analysis.data, clauses.data]);

  const documentText = useMemo(() => {
    if (displayedClauses.length === 0) {
      return contract.data
        ? `${contract.data.title}\n\nAnalysis is queued. Extracted text will appear as clauses are processed.`
        : "Loading contract metadata...";
    }
    return displayedClauses.map((clause) => clause.rawText).join("\n\n");
  }, [contract.data, displayedClauses]);

  const risk = analysis.data?.overallRisk ?? {
    score: 0,
    level: "low" as RiskLevel,
    summary: "Analysis is still running.",
  };

  const normalizedStatus = normalizeStatus(status.data?.status);

  const handleReport = async (accept: "application/json" | "application/pdf") => {
    const response = await api.get(`/reports/${id}`, {
      headers: { Accept: accept },
      responseType: accept === "application/pdf" ? "blob" : "json",
    });
    const title = contract.data?.title ?? "lexguard-report";
    const blob =
      accept === "application/pdf"
        ? response.data
        : new Blob([JSON.stringify(response.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title}.${accept === "application/pdf" ? "pdf" : "json"}`;
    anchor.rel = "noopener";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleChat = async () => {
    if (!message.trim()) return;
    const result = await sendMessage.mutateAsync(message.trim());
    setChatAnswer(result.answer);
    setMessage("");
    setTab("chat");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg text-text">
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-border px-5 md:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <LexguardLogo className="hidden md:inline-flex" />
          <span className="hidden h-8 w-px bg-border md:block" />
          <div className="min-w-0">
            <h1 className="truncate font-serif text-3xl leading-none">
              {contract.data?.title ?? "Contract"}
            </h1>
            <p className="mt-2 quiet-label truncate">
              {contract.data?.contractType?.replace("_", " ") ?? "Agreement"} • Last edited 2 hours
              ago
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton label="Notifications">
            <Bell className="size-5" />
          </IconButton>
          <IconButton label="Share">
            <Share2 className="size-5" />
          </IconButton>
          <Button
            variant="secondary"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => handleReport("application/pdf")}
          >
            <Download className="size-4" />
            PDF
          </Button>
        </div>
      </header>

      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5 md:px-8">
        <div className="flex items-center gap-4 text-on-surface-variant">
          <Menu className="size-5" />
          <span className="h-5 w-px bg-border" />
          <span className="quiet-label">Contract ID: {id.slice(0, 12)}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Minus className="size-4 text-on-surface-variant" />
          <span>100%</span>
          <Plus className="size-4 text-on-surface-variant" />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_520px]">
        <main className="min-h-0 overflow-y-auto bg-[#ededed] p-6 md:p-12">
          <ContractViewer
            text={documentText}
            clauses={displayedClauses}
            className="mx-auto min-h-[900px] max-w-[900px]"
          />
        </main>

        <aside className="flex min-h-0 flex-col border-l border-border bg-surface-1">
          <div className="grid grid-cols-3 border-b border-border">
            {[
              ["overview", "Overview"],
              ["clauses", `Clauses (${displayedClauses.length})`],
              ["chat", "Chat"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value as typeof tab)}
                className={`quiet-label border-b-2 px-4 py-5 transition-colors ${
                  tab === value
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-text"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {tab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-6"
                >
                  <div className="surface-panel p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-serif text-3xl">Risk Summary</h2>
                      <RiskBadge level={risk.level} />
                    </div>
                    <p className="text-sm leading-6 text-on-surface-variant">{risk.summary}</p>
                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-2">
                      <motion.div
                        animate={{ width: `${risk.score}%` }}
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                      />
                    </div>
                  </div>
                  <AnalysisProgress
                    status={normalizedStatus}
                    progress={status.data?.progress ?? 0}
                    currentStage={status.data?.currentStage ?? "queued"}
                  />
                </motion.div>
              )}

              {tab === "clauses" && (
                <motion.div
                  key="clauses"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-6"
                >
                  {contract.isLoading || clauses.isLoading ? (
                    <div className="surface-panel p-6 text-on-surface-variant">
                      Loading contract intelligence...
                    </div>
                  ) : displayedClauses.length === 0 ? (
                    <div className="space-y-5">
                      <AnalysisProgress
                        status={normalizedStatus}
                        progress={status.data?.progress ?? 0}
                        currentStage={status.data?.currentStage ?? "queued"}
                      />
                    </div>
                  ) : (
                    displayedClauses.map((clause) => (
                      <div key={clause.id} className="border-b border-border pb-6 last:border-b-0">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="font-serif text-2xl capitalize">
                            {clause.category.replace("_", " ")}
                          </h3>
                          <RiskBadge level={clause.riskLevel} />
                        </div>
                        <blockquote className="border-l border-border pl-4 font-serif text-xl italic leading-8 text-on-surface-variant">
                          &quot;{clause.rawText.slice(0, 180)}
                          {clause.rawText.length > 180 ? "..." : ""}&quot;
                        </blockquote>
                        <p className="mt-5 text-sm leading-6 text-text">
                          {clause.plainExplanation || "No plain explanation available."}
                        </p>
                        <div className="mt-5 flex items-center gap-4">
                          <button
                            className="quiet-label text-primary hover:underline"
                            type="button"
                          >
                            Rewrite Clause <Wand2 className="ml-1 inline size-3" />
                          </button>
                          <button
                            className="quiet-label text-on-surface-variant hover:text-text"
                            type="button"
                          >
                            Options ...
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {tab === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-5"
                >
                  <div className="surface-panel max-h-[55vh] overflow-y-auto p-5 text-sm">
                    {chatHistory.data?.slice(-6).map((entry) => (
                      <p className="mb-3 text-on-surface-variant" key={extractChatContent(entry)}>
                        {extractChatContent(entry)}
                      </p>
                    ))}
                    {chatAnswer && <p className="text-text">{chatAnswer}</p>}
                    {!chatAnswer && !chatHistory.data?.length && (
                      <p className="text-on-surface-variant">
                        Ask practical questions about this agreement and the extracted risks.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Ask what this means in practice..."
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleChat();
                      }}
                    />
                    <Button
                      disabled={sendMessage.isPending || !message.trim()}
                      onClick={handleChat}
                    >
                      <MessageSquare className="size-4" />
                      Send
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-border p-4">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => handleReport("application/json")}
            >
              Export JSON Report
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function normalizeStatus(status: string | undefined): AnalysisStatus {
  if (status === "completed") return "done";
  if (
    status === "queued" ||
    status === "extracting" ||
    status === "scoring" ||
    status === "explaining" ||
    status === "done" ||
    status === "failed"
  ) {
    return status;
  }
  return "queued";
}

function IconButton({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      aria-label={label}
      className="grid size-10 place-items-center rounded-[8px] text-on-surface-variant transition-colors hover:bg-surface-2 hover:text-text"
      type="button"
    >
      {children}
    </button>
  );
}

function extractChatContent(entry: unknown) {
  if (entry && typeof entry === "object") {
    const maybeJoined = entry as { chat_messages?: { role?: string; content?: string } };
    if (maybeJoined.chat_messages?.content) {
      return `${maybeJoined.chat_messages.role ?? "message"}: ${maybeJoined.chat_messages.content}`;
    }
    const maybeFlat = entry as { role?: string; content?: string };
    if (maybeFlat.content) return `${maybeFlat.role ?? "message"}: ${maybeFlat.content}`;
  }
  return "";
}
