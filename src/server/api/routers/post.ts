import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { tasks } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }: { input: { text: string } }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
  .input(z.object({ title: z.string().min(1) }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.insert(tasks).values({
      title: input.title,
    });
  }),

  getLatest: publicProcedure.query(async ({ ctx }: { ctx: { db: any } }) => {
    const task = await ctx.db.query.tasks.findFirst({
      orderBy: (tasks: any, { desc }: { desc: any }) => [desc(tasks.createdAt)],
    });
    return task ?? null;
  }),
}); 