import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { tasks, users } from "../../db/schema";
import { db } from "../../db";
import { desc, eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { sendEmailReminder, sendWhatsAppReminder } from "../../../lib/reminders";

export const taskRouter = createTRPCRouter({

  // ================= CREATE =================
  createTask: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]),
        dueDate: z.string().optional(),
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
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
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

  // ================= SEND REMINDER (manual) =================
  sendReminder: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Get the task
      const task = await db.query.tasks.findFirst({
        where: and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)),
      });

      if (!task) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      // Get user's contact info
      const user = await db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const results = { email: false, whatsapp: false };
      const dueDate = task.dueDate ?? new Date();

      // Send email if user has email
      if (user.email) {
        results.email = await sendEmailReminder(user.email, task.title, dueDate);
      }

      // Send WhatsApp if user has phone
      if (user.phone) {
        results.whatsapp = await sendWhatsAppReminder(user.phone, task.title, dueDate);
      }

      if (!user.email && !user.phone) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No email or phone number set. Update your profile to receive reminders.",
        });
      }

      return results;
    }),
});