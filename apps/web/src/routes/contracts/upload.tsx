import type { ContractType } from "@lexguard/types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { UploadZone } from "../../components/ui/UploadZone";
import { useImportUrl, useUploadContract } from "../../hooks/useContracts";

export const Route = createFileRoute("/contracts/upload")({
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [contractType, setContractType] = useState<ContractType>("other");
  const [jurisdiction, setJurisdiction] = useState("");
  const [error, setError] = useState<string | null>(null);
  const uploadContract = useUploadContract();
  const importUrl = useImportUrl();
  const isUploading = uploadContract.isPending || importUrl.isPending;

  const handleUpload = async () => {
    if (!file) return;
    setError(null);
    try {
      const result = await uploadContract.mutateAsync({
        file,
        title: title || file.name,
        contractType,
        jurisdiction: jurisdiction || undefined,
      });
      navigate({ to: "/contracts/$id", params: { id: result.contractId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }
  };

  const handleImport = async () => {
    if (!url) return;
    setError(null);
    try {
      const result = await importUrl.mutateAsync({
        url,
        title: title || undefined,
        contractType: contractType === "other" ? "tos" : contractType,
      });
      navigate({ to: "/contracts/$id", params: { id: result.contractId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "URL import failed. Please try again.");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col">
      <button
        type="button"
        onClick={() => navigate({ to: "/dashboard" })}
        className="flex items-center gap-2 text-sm text-muted hover:text-text transition-colors mb-8 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-serif text-text mb-2">Upload Contract</h1>
        <p className="text-muted">
          Upload a legal document to instantly extract clauses, assess risks, and verify compliance.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1"
      >
        <div className="bg-surface border border-border rounded-2xl p-1 shadow-sm mb-6">
          <div className="bg-surface-1 rounded-xl p-6 md:p-12 border border-border/50">
            <UploadZone onFile={setFile} className="bg-surface" />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Title, optional"
              />
              <select
                className="h-10 rounded-[8px] border border-border bg-surface px-3 text-sm text-text"
                value={contractType}
                onChange={(event) => setContractType(event.target.value as ContractType)}
              >
                <option value="other">Other</option>
                <option value="employment">Employment</option>
                <option value="nda">NDA</option>
                <option value="saas">SaaS</option>
                <option value="msa">MSA</option>
                <option value="dpa">DPA</option>
                <option value="tos">Terms of Service</option>
                <option value="privacy_policy">Privacy Policy</option>
                <option value="lease">Lease</option>
                <option value="insurance">Insurance</option>
              </select>
              <Input
                value={jurisdiction}
                onChange={(event) => setJurisdiction(event.target.value)}
                placeholder="Jurisdiction, e.g. US-CA"
              />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="Import terms or privacy URL"
              />
              <Button
                variant="secondary"
                disabled={!url || isUploading}
                onClick={handleImport}
                className="w-full sm:w-auto"
              >
                Import URL
              </Button>
            </div>
            {error && (
              <p className="mt-4 rounded-md border border-risk-critical/30 bg-risk-critical/10 px-3 py-2 text-sm text-risk-critical">
                {error}
              </p>
            )}

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-muted">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>Documents are encrypted end-to-end and stored securely.</span>
              </div>
              <Button
                variant="primary"
                size="lg"
                disabled={!file || isUploading}
                onClick={handleUpload}
                className="w-full sm:w-auto"
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  "Analyze Contract"
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl border border-border bg-surface flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-primary mb-2">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-medium text-text">Auto-Extraction</h3>
            <p className="text-sm text-muted">
              We automatically pull out key dates, entities, and obligations.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-surface flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-primary mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-medium text-text">Risk Detection</h3>
            <p className="text-sm text-muted">
              Identify indemnification, liability, and termination risks instantly.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-surface flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-primary mb-2">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-medium text-text">Format Agnostic</h3>
            <p className="text-sm text-muted">
              Upload scanned PDFs or Word documents. Our OCR handles the rest.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
