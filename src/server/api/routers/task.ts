import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { tasks } from "../../db/schema";
import { eq } from "drizzle-orm";

export const taskRouter = createTRPCRouter({

  createTask: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(tasks).values({
        title: input.title,
        description: input.description,
        priority: input.priority,
      });
    }),
  getTasks: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.select().from(tasks);
    }),


  updateTask: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["pending", "in-progress", "completed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(tasks)
        .set({ status: input.status })
        .where(eq(tasks.id, input.id));
    }),


  editTask: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(tasks)
        .set({
          title: input.title,
          description: input.description,
          priority: input.priority,
        })
        .where(eq(tasks.id, input.id));
    }),

  deleteTask: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(tasks)
        .where(eq(tasks.id, input.id));
    }),
});