import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { clauses } from "./clauses";
import { feedbackTypeEnum } from "./enums";
import { users } from "./users";

export const clauseFeedback = pgTable("clause_feedback", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clauseId: uuid("clause_id")
    .notNull()
    .references(() => clauses.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  feedbackType: feedbackTypeEnum("feedback_type").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
