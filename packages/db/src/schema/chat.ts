import { sql } from "drizzle-orm";
import { doublePrecision, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { contracts } from "./contracts";
import { chatRoleEnum } from "./enums";
import { users } from "./users";

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => contracts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: chatRoleEnum("role").notNull(),
    content: text("content").notNull(),
    relevantClauseIds: uuid("relevant_clause_ids").array(),
    confidenceScore: doublePrecision("confidence_score"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("chat_messages_contract_created_idx").on(table.contractId, table.createdAt)],
);
