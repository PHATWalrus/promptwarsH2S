import { analysisJobs, contracts, tenantContractFilter } from "@lexguard/db";
import type { ContractUploadInput, ImportUrlInput } from "@lexguard/types";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../lib/db";
import { getAnalysisQueue } from "../lib/queue";
import type { AuthUser } from "../middleware/auth";
import { crawlerService } from "./crawler.service";
import { storageService } from "./storage.service";

export class ContractService {
  async upload(file: File, input: ContractUploadInput, user: AuthUser) {
    const stored = await storageService.storeContract(file, user.id);
    const [contract] = await db
      .insert(contracts)
      .values({
        userId: user.id,
        orgId: user.orgId,
        title: input.title ?? file.name,
        contractType: input.contractType,
        jurisdiction: input.jurisdiction,
        storageKey: stored.storageKey,
        fileSizeBytes: stored.fileSizeBytes,
        mimeType: file.type,
        checksum: stored.checksum,
        status: "processing",
      })
      .returning();
    if (!contract) {
      throw new Error("Unable to create contract");
    }
    const [analysis] = await db
      .insert(analysisJobs)
      .values({ contractId: contract.id, status: "queued" })
      .returning();
    if (!analysis) {
      throw new Error("Unable to create analysis job");
    }
    const job = await getAnalysisQueue().add("ingest", {
      contractId: contract.id,
      analysisJobId: analysis.id,
    });
    await db
      .update(analysisJobs)
      .set({ bullJobId: job.id })
      .where(eq(analysisJobs.id, analysis.id));
    return { contractId: contract.id, status: "processing" as const };
  }

  async importUrl(input: ImportUrlInput, user: AuthUser) {
    const crawl = await crawlerService.crawlLegalPage(input.url);
    const title = input.title ?? crawl.title;
    const stored = await storageService.storeTextContract(crawl.markdown, user.id, title);
    const [contract] = await db
      .insert(contracts)
      .values({
        userId: user.id,
        orgId: user.orgId,
        title,
        contractType: input.contractType,
        jurisdiction: input.jurisdiction,
        storageKey: stored.storageKey,
        fileSizeBytes: stored.fileSizeBytes,
        mimeType: "text/plain",
        checksum: stored.checksum,
        status: "processing",
        sourceUrl: input.url,
        crawlProvider: crawl.provider,
        crawlMetadata: JSON.stringify(crawl.metadata),
      })
      .returning();
    if (!contract) {
      throw new Error("Unable to create imported contract");
    }
    const [analysis] = await db
      .insert(analysisJobs)
      .values({ contractId: contract.id, status: "queued" })
      .returning();
    if (!analysis) {
      throw new Error("Unable to create imported analysis job");
    }
    const job = await getAnalysisQueue().add("ingest", {
      contractId: contract.id,
      analysisJobId: analysis.id,
    });
    await db
      .update(analysisJobs)
      .set({ bullJobId: job.id })
      .where(eq(analysisJobs.id, analysis.id));
    return {
      contractId: contract.id,
      status: "processing" as const,
      crawlProvider: crawl.provider,
    };
  }

  async list(
    user: AuthUser,
    filters: { page: number; pageSize: number; type?: string; status?: string },
  ) {
    const base = [tenantContractFilter({ userId: user.id, orgId: user.orgId, role: user.role })];
    if (filters.type) base.push(eq(contracts.contractType, filters.type as never));
    if (filters.status) base.push(eq(contracts.status, filters.status as never));
    return db
      .select()
      .from(contracts)
      .where(and(...base))
      .orderBy(desc(contracts.createdAt))
      .limit(filters.pageSize)
      .offset((filters.page - 1) * filters.pageSize);
  }

  async get(id: string, user: AuthUser) {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(tenantContractFilter({ userId: user.id, orgId: user.orgId, role: user.role }, id))
      .limit(1);
    return contract;
  }

  async softDelete(id: string, user: AuthUser) {
    const [contract] = await db
      .update(contracts)
      .set({ status: "deleted", deletedAt: new Date(), updatedAt: new Date() })
      .where(tenantContractFilter({ userId: user.id, orgId: user.orgId, role: user.role }, id))
      .returning();
    return contract;
  }
}

export const contractService = new ContractService();
