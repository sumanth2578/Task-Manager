import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { tasks, users } from "~/server/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";
import { sendEmailReminder, sendWhatsAppReminder } from "~/lib/reminders";

export async function GET(req: NextRequest) {
    // Verify cron secret (optional security)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        // Find tasks due within the next hour that haven't been reminded yet
        const dueTasks = await db
            .select({
                taskId: tasks.id,
                taskTitle: tasks.title,
                dueDate: tasks.dueDate,
                userId: tasks.userId,
            })
            .from(tasks)
            .where(
                and(
                    lte(tasks.dueDate, oneHourFromNow),
                    gte(tasks.dueDate, now),
                    eq(tasks.reminderSent, false),
                    eq(tasks.status, "pending")
                )
            );

        let emailsSent = 0;
        let whatsappSent = 0;

        for (const task of dueTasks) {
            // Get the user's contact info
            const user = await db.query.users.findFirst({
                where: eq(users.id, task.userId),
            });

            if (!user || !task.dueDate) continue;

            // Send email
            if (user.email) {
                const sent = await sendEmailReminder(user.email, task.taskTitle, task.dueDate);
                if (sent) emailsSent++;
            }

            // Send WhatsApp
            if (user.phone) {
                const sent = await sendWhatsAppReminder(user.phone, task.taskTitle, task.dueDate);
                if (sent) whatsappSent++;
            }

            // Mark reminder as sent
            await db
                .update(tasks)
                .set({ reminderSent: true })
                .where(eq(tasks.id, task.taskId));
        }

        return NextResponse.json({
            ok: true,
            checked: dueTasks.length,
            emailsSent,
            whatsappSent,
            timestamp: now.toISOString(),
        });
    } catch (error) {
        console.error("Cron reminder error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
