import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { env } from "./env";

const storage = new S3Client({
  region: env.STORAGE_REGION,
  endpoint: env.STORAGE_ENDPOINT,
  forcePathStyle: env.STORAGE_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: env.STORAGE_ACCESS_KEY,
    secretAccessKey: env.STORAGE_SECRET_KEY,
  },
});

export interface LoadedContractDocument {
  text: string;
  ocrNeeded: boolean;
  ocrUsed: boolean;
  textDensity: "empty" | "sparse" | "readable";
  file?: {
    data: Uint8Array;
    mimeType: string;
  };
}

export async function loadContractDocument(input: {
  storageKey: string;
  mimeType: string | null;
}): Promise<LoadedContractDocument> {
  const result = await storage.send(
    new GetObjectCommand({ Bucket: env.STORAGE_BUCKET, Key: input.storageKey }),
  );
  const body = await result.Body?.transformToByteArray();
  if (!body) {
    throw new Error(`Storage object ${input.storageKey} was empty or unreadable`);
  }
  const bytes = new Uint8Array(body);
  if (
    input.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const extracted = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    return {
      text: extracted.value.trim(),
      ocrNeeded: false,
      ocrUsed: false,
      textDensity: textDensity(extracted.value),
    } satisfies LoadedContractDocument;
  }
  if (input.mimeType === "application/pdf") {
    const parser = new PDFParse({ data: bytes });
    try {
      const extracted = await parser.getText();
      const text = extracted.text.trim();
      if (text.length > 0) {
        return {
          text,
          ocrNeeded: false,
          ocrUsed: false,
          textDensity: textDensity(text),
          file: { data: bytes, mimeType: "application/pdf" },
        } satisfies LoadedContractDocument;
      }
      if (!env.OCR_SERVICE_URL) {
        return {
          text,
          ocrNeeded: true,
          ocrUsed: false,
          textDensity: "empty",
          file: { data: bytes, mimeType: "application/pdf" },
        } satisfies LoadedContractDocument;
      }
      return {
        text: await requestOcrText(bytes),
        ocrNeeded: true,
        ocrUsed: true,
        textDensity: "readable",
        file: { data: bytes, mimeType: "application/pdf" },
      } satisfies LoadedContractDocument;
    } finally {
      await parser.destroy();
    }
  }
  const text = new TextDecoder().decode(bytes).trim();
  return { text, ocrNeeded: false, ocrUsed: false, textDensity: textDensity(text) };
}

export async function loadContractText(input: { storageKey: string; mimeType: string | null }) {
  return (await loadContractDocument(input)).text;
}

async function requestOcrText(bytes: Uint8Array) {
  if (!env.OCR_SERVICE_URL) {
    throw new Error("OCR_SERVICE_URL is required for OCR extraction");
  }
  const response = await fetch(env.OCR_SERVICE_URL, {
    method: "POST",
    headers: { "content-type": "application/pdf" },
    body: Buffer.from(bytes),
  });
  if (!response.ok) {
    throw new Error(`OCR service failed with ${response.status}`);
  }
  const payload = (await response.json()) as { text?: string };
  if (!payload.text?.trim()) {
    throw new Error("OCR service returned no text");
  }
  return payload.text.trim();
}

function textDensity(text: string) {
  const length = text.trim().length;
  if (length === 0) return "empty";
  if (length < 24) return "sparse";
  return "readable";
}
