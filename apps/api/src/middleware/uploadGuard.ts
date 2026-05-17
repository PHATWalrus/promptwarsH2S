import { HTTPException } from "hono/http-exception";

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

export async function virusScanHook(_file: File) {
  return { clean: true, engine: "clamav-stub" } as const;
}
