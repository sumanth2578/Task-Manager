import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/* =====================
   USERS TABLE
===================== */

export const users = pgTable("user", {
  id: varchar("id", { length: 255 }).primaryKey(),

  username: varchar("username", { length: 255 })
    .notNull()
    .unique(),

  password: varchar("password", { length: 255 })
    .notNull(),

  role: varchar("role", { length: 50 })
    .default("user")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
  
});

/* =====================
   SESSIONS TABLE (Lucia)
===================== */

export const sessions = pgTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(),

  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),

  expiresAt: timestamp("expires_at")
    .notNull(),
});

/* =====================
   TASKS TABLE
===================== */

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

  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});