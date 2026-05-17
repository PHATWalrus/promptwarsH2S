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

export async function loadContractText(input: { storageKey: string; mimeType: string | null }) {
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
    return extracted.value.trim();
  }
  if (input.mimeType === "application/pdf") {
    const parser = new PDFParse({ data: bytes });
    try {
      const extracted = await parser.getText();
      return extracted.text.trim();
    } finally {
      await parser.destroy();
    }
  }
  return new TextDecoder().decode(bytes).trim();
}
