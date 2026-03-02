import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "../server/db";
import { users, sessions } from "../server/db/schema";

const adapter = new DrizzlePostgreSQLAdapter(
  db,
  sessions,
  users
);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
  },
  getUserAttributes: (attributes: unknown) => {
    const attrs = attributes as { id: string; username: string; role: string };
    return {
      id: attrs.id,
      username: attrs.username,
      role: attrs.role,
    };
  },
});