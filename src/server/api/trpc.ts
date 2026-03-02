import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { lucia } from "../../lib/lucia";
import { cookies } from "next/headers";
import { db } from "../db";

type Context = {
  db: typeof db;
  user: {
    id: string;
    username: string;
    role: string;
  } | null;
};

export const createTRPCContext = async (): Promise<Context> => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("auth_session")?.value ?? null;

  let user: Context["user"] = null;

  if (sessionId) {
    const { user: luciaUser, session } = await lucia.validateSession(sessionId);
    if (!session) {
      // Clean up invalid session cookie
      lucia.createBlankSessionCookie();
      // We can't easily mutate context cookies here, so we skip it.
      // But the context user is null.
    }
    user = luciaUser as Context["user"];
  }


  return {
    db,
    user,
  };
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;