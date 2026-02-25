import { z } from "zod";
import { desc } from "drizzle-orm";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

import { tasks } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ title: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const newPost = await ctx.db
        .insert(tasks)
        .values({
          title: input.title,
        })
        .returning();

      return newPost;
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const task = await ctx.db.query.tasks.findFirst({
      orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
    });

    return task ?? null;
  }),
});