import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
export const tasks = pgTable("tasks", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),

  title: text("title").notNull(),

  description: text("description"),

  status: text("status")
    .default("pending")
    .notNull(),

  priority: text("priority")
    .default("medium")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});