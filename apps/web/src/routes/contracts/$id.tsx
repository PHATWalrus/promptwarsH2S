import type { AnalysisStatus, Clause, RiskLevel } from "@lexguard/types";
import { createFileRoute } from "@tanstack/react-router";
import { Download, MessageSquare, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AnalysisProgress } from "../../components/ui/AnalysisProgress";
import { Button } from "../../components/ui/Button";
import { ClauseCard } from "../../components/ui/ClauseCard";
import { ContractViewer } from "../../components/ui/ContractViewer";
import { Input } from "../../components/ui/Input";
import { RiskGauge } from "../../components/ui/RiskGauge";
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

  const handleReport = async (accept: "application/json" | "application/pdf") => {
    const response = await api.get(`/reports/${id}`, {
      headers: { Accept: accept },
      responseType: accept === "application/pdf" ? "blob" : "json",
    });
    if (accept === "application/pdf") {
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${contract.data?.title ?? "lexguard-report"}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${contract.data?.title ?? "lexguard-report"}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleChat = async () => {
    if (!message.trim()) return;
    const result = await sendMessage.mutateAsync(message.trim());
    setChatAnswer(result.answer);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex-shrink-0 h-16 border-b border-border bg-surface px-6 flex items-center justify-between z-10">
        <div className="min-w-0">
          <h1 className="text-lg font-medium text-text truncate">
            {contract.data?.title ?? "Contract"}
          </h1>
          <p className="text-xs text-muted">Contract ID: {id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => handleReport("application/pdf")}
          >
            <Download className="w-4 h-4" /> PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="hidden sm:flex items-center gap-2"
            onClick={() => handleReport("application/json")}
          >
            JSON
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 lg:w-[58%] border-r border-border bg-surface-1 overflow-y-auto p-6">
          <ContractViewer
            text={documentText}
            clauses={displayedClauses}
            className="min-h-[720px]"
          />
        </div>

        <div className="w-full md:w-1/2 lg:w-[42%] bg-surface flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-border bg-surface-1/50">
            <div className="flex items-center gap-5">
              <RiskGauge score={risk.score} level={risk.level} size={96} />
              <div className="min-w-0">
                <h2 className="text-xl font-serif text-text mb-1">Analysis Results</h2>
                <p className="text-sm text-muted leading-relaxed">{risk.summary}</p>
              </div>
            </div>
            <AnalysisProgress
              className="mt-5"
              status={(status.data?.status ?? "queued") as AnalysisStatus}
              progress={status.data?.progress ?? 0}
              currentStage={status.data?.currentStage ?? "queued"}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
            {contract.isLoading || clauses.isLoading ? (
              <div className="p-6 rounded-xl border border-border bg-surface-1 text-muted">
                Loading contract intelligence...
              </div>
            ) : displayedClauses.length === 0 ? (
              <div className="p-6 rounded-xl border border-border bg-surface-1 text-muted">
                No clauses have been extracted yet. Trigger or wait for analysis to complete.
              </div>
            ) : (
              displayedClauses.map((clause) => <ClauseCard key={clause.id} clause={clause} />)
            )}

            <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-3">
              <div className="flex items-center gap-2 text-text font-medium">
                <MessageSquare className="w-4 h-4 text-primary" />
                Scenario Q&A
              </div>
              <div className="max-h-36 overflow-y-auto space-y-2 text-sm text-muted">
                {chatHistory.data?.slice(-3).map((entry) => (
                  <p key={extractChatContent(entry)}>{extractChatContent(entry)}</p>
                ))}
                {chatAnswer && <p className="text-text">{chatAnswer}</p>}
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
                <Button disabled={sendMessage.isPending || !message.trim()} onClick={handleChat}>
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
