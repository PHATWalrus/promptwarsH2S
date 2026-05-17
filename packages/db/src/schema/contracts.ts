import { sql } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { contractStatusEnum, contractTypeEnum, crawlProviderEnum } from "./enums";
import { organizations } from "./organizations";
import { users } from "./users";

export const contracts = pgTable(
  "contracts",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    contractType: contractTypeEnum("contract_type").notNull().default("other"),
    jurisdiction: text("jurisdiction"),
    storageKey: text("storage_key").notNull(),
    fileSizeBytes: integer("file_size_bytes"),
    mimeType: text("mime_type"),
    checksum: text("checksum"),
    status: contractStatusEnum("status").notNull().default("uploaded"),
    sourceUrl: text("source_url"),
    crawlProvider: crawlProviderEnum("crawl_provider"),
    crawlMetadata: text("crawl_metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("contracts_org_status_created_idx").on(table.orgId, table.status, table.createdAt),
    index("contracts_user_created_idx").on(table.userId, table.createdAt),
  ],
);
