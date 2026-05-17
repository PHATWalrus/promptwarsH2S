import { createHash, randomUUID } from "node:crypto";
import {
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../env";

export class StorageService {
  private readonly client = new S3Client({
    region: env.STORAGE_REGION,
    endpoint: env.STORAGE_ENDPOINT,
    forcePathStyle: env.STORAGE_FORCE_PATH_STYLE,
    credentials: {
      accessKeyId: env.STORAGE_ACCESS_KEY,
      secretAccessKey: env.STORAGE_SECRET_KEY,
    },
  });

  async storeContract(file: File, userId: string) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const checksum = createHash("sha256").update(bytes).digest("hex");
    const storageKey = `${userId}/${randomUUID()}-${sanitizeFileName(file.name || "contract")}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: env.STORAGE_BUCKET,
        Key: storageKey,
        Body: bytes,
        ContentType: file.type,
        Metadata: { sanitized: "true", sha256: checksum },
      }),
    );
    return { storageKey, checksum, fileSizeBytes: bytes.byteLength };
  }

  async storeTextContract(text: string, userId: string, title: string) {
    const bytes = new TextEncoder().encode(text);
    const checksum = createHash("sha256").update(bytes).digest("hex");
    const storageKey = `${userId}/${randomUUID()}-${sanitizeFileName(title)}.txt`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: env.STORAGE_BUCKET,
        Key: storageKey,
        Body: bytes,
        ContentType: "text/plain",
        Metadata: { sanitized: "true", sha256: checksum },
      }),
    );
    return { storageKey, checksum, fileSizeBytes: bytes.byteLength };
  }

  async getText(storageKey: string) {
    const result = await this.client.send(
      new GetObjectCommand({ Bucket: env.STORAGE_BUCKET, Key: storageKey }),
    );
    return result.Body?.transformToString() ?? "";
  }

  async healthCheck() {
    await this.client.send(new HeadBucketCommand({ Bucket: env.STORAGE_BUCKET }));
    return "ok" as const;
  }
}

export function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 160);
}

export const storageService = new StorageService();
