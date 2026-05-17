import { HTTPException } from "hono/http-exception";
import { env } from "../env";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export function detectFileSignature(bytes: Uint8Array) {
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return "application/pdf";
  }
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (
    bytes.length > 0 &&
    bytes.every((byte) => byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126))
  ) {
    return "text/plain";
  }
  return null;
}

export async function validateUploadFile(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new HTTPException(413, { message: "File exceeds 10 MB upload limit" });
  }
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const detected = detectFileSignature(bytes);
  if (!detected || !ALLOWED_MIME_TYPES.has(detected) || detected !== file.type) {
    throw new HTTPException(415, { message: "Unsupported or spoofed contract file type" });
  }
  await virusScanHook(file);
  return detected;
}

export function resolveUploadScanner(source: {
  NODE_ENV: string;
  UPLOAD_SCANNER_MODE?: "disabled" | "http";
  UPLOAD_SCANNER_URL?: string;
}) {
  const mode = source.UPLOAD_SCANNER_MODE ?? "disabled";
  if (source.NODE_ENV === "production" && mode === "disabled") {
    throw new Error("UPLOAD_SCANNER_MODE cannot be disabled in production");
  }
  if (mode === "http" && !source.UPLOAD_SCANNER_URL) {
    throw new Error("UPLOAD_SCANNER_URL is required when UPLOAD_SCANNER_MODE=http");
  }
  return { mode, url: source.UPLOAD_SCANNER_URL };
}

export async function virusScanHook(file: File) {
  const scanner = resolveUploadScanner(env);
  if (scanner.mode === "disabled") {
    return { clean: true, engine: "disabled-local" } as const;
  }
  if (!scanner.url) {
    throw new Error("UPLOAD_SCANNER_URL is required when UPLOAD_SCANNER_MODE=http");
  }

  const response = await fetch(scanner.url, {
    method: "POST",
    headers: {
      "content-type": file.type || "application/octet-stream",
      "x-file-name": encodeURIComponent(file.name || "contract"),
    },
    body: await file.arrayBuffer(),
  });

  if (!response.ok) {
    throw new HTTPException(422, { message: "Upload scanner rejected the file" });
  }
  const result = (await response.json().catch(() => ({ clean: true }))) as { clean?: boolean };
  if (result.clean === false) {
    throw new HTTPException(422, { message: "Upload scanner detected unsafe content" });
  }
  return { clean: true, engine: "http-scanner" } as const;
}
