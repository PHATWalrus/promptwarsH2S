import type { ContractType } from "@lexguard/types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ClipboardList,
  FileText,
  ShieldCheck,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { LexguardLogo } from "../../components/ui/LexguardLogo";
import { UploadZone } from "../../components/ui/UploadZone";
import { useImportUrl, useUploadContract } from "../../hooks/useContracts";

export const Route = createFileRoute("/contracts/upload")({
  component: UploadPage,
});

const contractOptions: Array<{
  type: ContractType;
  label: string;
  desc: string;
  icon: React.ReactNode;
}> = [
  { type: "nda", label: "NDA", desc: "Non-Disclosure", icon: <ShieldCheck /> },
  { type: "msa", label: "MSA", desc: "Master Services", icon: <ClipboardList /> },
  { type: "dpa", label: "DPA", desc: "Data Processing", icon: <Building2 /> },
];

function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [contractType, setContractType] = useState<ContractType>("nda");
  const [jurisdiction, setJurisdiction] = useState("US-DE");
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
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="flex h-20 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-4">
          <LexguardLogo className="[&_.lexguard-wordmark]:text-[18px]" />
          <span className="h-8 w-px bg-border" />
          <span className="text-lg text-on-surface-variant">Upload Contract</span>
        </div>
        <button
          aria-label="Close upload"
          className="grid size-10 place-items-center rounded-[8px] text-on-surface-variant hover:bg-surface-2 hover:text-text"
          onClick={() => navigate({ to: "/dashboard" })}
          type="button"
        >
          <X className="size-6" />
        </button>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12">
        <div className="mb-12 grid grid-cols-3 items-center gap-3 text-center text-xl text-on-surface-variant">
          {["1. Upload", "2. Configure", "3. Confirm"].map((step, index) => (
            <div key={step}>
              <span className={index === 0 ? "text-primary" : ""}>{step}</span>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-surface-2">
                <motion.div
                  animate={{ width: index === 0 ? "100%" : "0%" }}
                  className="h-full bg-primary"
                  initial={false}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h1 className="font-serif text-5xl">Document Ingestion</h1>
          <p className="mt-3 text-on-surface-variant">
            Upload your legal document for AI-driven analysis. Supported formats: PDF, DOCX, TXT.
          </p>
        </div>

        <UploadZone onFile={setFile} className="min-h-[340px] bg-surface-1" />

        {file && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center justify-between rounded-[8px] border border-border bg-surface-1 p-5"
          >
            <div className="flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-[6px] bg-surface-2 text-on-surface-variant">
                <FileText className="size-6" />
              </span>
              <div>
                <p className="font-semibold">{file.name}</p>
                <p className="text-sm text-on-surface-variant">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
                </p>
              </div>
            </div>
            <div className="h-1 w-40 overflow-hidden rounded-full bg-surface-2">
              <span className="block h-full w-full bg-primary" />
            </div>
          </motion.div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {contractOptions.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => setContractType(option.type)}
              className={`relative rounded-[8px] border p-5 text-left transition-colors ${
                contractType === option.type
                  ? "border-primary bg-surface-2"
                  : "border-border bg-surface-1 hover:border-border-hover"
              }`}
            >
              <span className="mb-5 block text-on-surface-variant [&_svg]:size-6">
                {option.icon}
              </span>
              <span className="block text-lg font-semibold">{option.label}</span>
              <span className="text-sm text-on-surface-variant">{option.desc}</span>
              <span className="absolute right-5 top-5 size-5 rounded-full border border-border">
                {contractType === option.type && (
                  <span className="m-1 block size-3 rounded-full bg-primary" />
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Input
            label="Document Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="MSA_TechCorp_v2.pdf"
          />
          <Input
            label="Governing Law / Jurisdiction"
            value={jurisdiction}
            onChange={(event) => setJurisdiction(event.target.value)}
            placeholder="United States - Delaware"
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Input
            label="Import URL"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/terms"
          />
          <Button
            variant="secondary"
            disabled={!url || isUploading}
            onClick={handleImport}
            className="mt-auto w-full sm:w-auto"
          >
            Import URL
          </Button>
        </div>

        {error && (
          <p className="mt-4 rounded-[8px] border border-risk-critical/30 bg-risk-critical/10 px-3 py-2 text-sm text-risk-critical">
            {error}
          </p>
        )}

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-7 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="quiet-label flex items-center gap-2 text-on-surface-variant hover:text-text"
          >
            <ArrowLeft className="size-4" />
            Cancel
          </button>
          <Button size="lg" disabled={!file || isUploading} onClick={handleUpload}>
            {isUploading ? "Analyzing..." : "Proceed to Analysis"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
