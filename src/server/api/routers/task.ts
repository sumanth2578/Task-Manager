import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { tasks } from "../../db/schema";
import { db } from "../../db";
import { desc } from "drizzle-orm";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const taskRouter = createTRPCRouter({

  // ================= CREATE =================
  createTask: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.insert(tasks).values({
        title: input.title,
        description: input.description,
        priority: input.priority,
        userId: ctx.user.id,
      });
    }),

  // ================= GET =================
  getTasks: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return await db.query.tasks.findMany({
      where: eq(tasks.userId, ctx.user.id),
      orderBy: [desc(tasks.createdAt)],
    });
  }),

  updateTask: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["pending", "in-progress", "completed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db
        .update(tasks)
        .set({ status: input.status })
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)));
    }),

  // ================= EDIT =================
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
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db
        .update(tasks)
        .set({
          title: input.title,
          description: input.description,
          priority: input.priority,
        })
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)));
    }),

  // ================= DELETE =================
  deleteTask: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db
        .delete(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)));
    }),
}); 