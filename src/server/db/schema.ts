import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/* =====================================================
   AUTH TABLES (Required for DrizzleAdapter)
===================================================== */

export const users = pgTable("user", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: varchar("image", { length: 255 }),
});

export const accounts = pgTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(
      account.provider,
      account.providerAccountId
    ),
  })
);

export const sessions = pgTable("session", {
  sessionToken: varchar("sessionToken", {
    length: 255,
  }).primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: varchar("identifier", {
      length: 255,
    }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
);

/* =====================================================
   YOUR TASKS TABLE
===================================================== */

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