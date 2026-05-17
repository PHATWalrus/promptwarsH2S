import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface UploadZoneProps {
  onFile: (file: File) => void;
  className?: string;
}

export function UploadZone({ onFile, className }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = "contract-upload-input";

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    if (
      file.type === "application/pdf" ||
      file.type === "text/plain" ||
      file.name.endsWith(".docx")
    ) {
      setSelectedFile(file);
      onFile(file);
    } else {
      alert("Only PDF, DOCX, and plain text files are supported.");
    }
  };

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "relative w-full min-h-64 rounded-[8px] border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-6 text-center cursor-pointer overflow-hidden",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-border-hover hover:bg-surface-2",
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        id={inputId}
        type="file"
        ref={inputRef}
        className="hidden"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={handleChange}
      />

      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4"
          >
            <div
              className={cn(
                "p-5 rounded-full transition-colors",
                isDragging ? "bg-primary/20 text-primary" : "bg-bg text-primary",
              )}
            >
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="font-serif text-3xl text-text">Drag & Drop Document Here</p>
              <p className="mt-3 max-w-md text-sm text-on-surface-variant">
                Ensure documents are clearly legible and contain standard contractual language for
                optimal parsing.
              </p>
            </div>
            <span className="mt-2 inline-flex items-center justify-center rounded-[8px] border border-border bg-transparent px-4 py-2 text-base text-text transition-colors hover:bg-surface-2">
              Browse Files
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="selected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="p-4 rounded-full bg-risk-low/20 text-risk-low">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-medium text-text">{selectedFile.name}</p>
              <p className="text-sm text-faint mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                {selectedFile.type.includes("pdf")
                  ? "PDF Document"
                  : selectedFile.type === "text/plain"
                    ? "Text Document"
                    : "Word Document"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </label>
  );
}
