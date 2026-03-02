import { Resend } from "resend";
import twilio from "twilio";

// ===== EMAIL via Resend =====
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailReminder(
    to: string,
    taskTitle: string,
    dueDate: Date
) {
    try {
        const formattedDate = dueDate.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });

        await resend.emails.send({
            from: "Task Manager <onboarding@resend.dev>",
            to,
            subject: `⏰ Reminder: "${taskTitle}" is due soon!`,
            html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 24px; background: #1a1a40; color: #e2e8f0; border-radius: 12px;">
          <h2 style="color: #a78bfa; margin: 0 0 8px;">🔔 Task Reminder</h2>
          <p style="margin: 0 0 16px; color: #94a3b8;">Your task is coming up soon!</p>
          <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px;">
            <h3 style="margin: 0 0 8px; color: #f1f5f9;">${taskTitle}</h3>
            <p style="margin: 0; color: #fbbf24;">📅 Due: ${formattedDate}</p>
          </div>
          <p style="margin: 16px 0 0; color: #64748b; font-size: 12px;">— Task Manager</p>
        </div>
      `,
        });
        console.log(`✅ Email reminder sent to ${to} for "${taskTitle}"`);
        return true;
    } catch (error) {
        console.error("❌ Email send failed:", error);
        return false;
    }
}

// ===== WHATSAPP via Twilio =====
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsAppReminder(
    to: string,
    taskTitle: string,
    dueDate: Date
) {
    try {
        const formattedDate = dueDate.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });

        const fromNumber = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+15014642258";

        await twilioClient.messages.create({
            from: fromNumber,
            to: `whatsapp:${to}`,
            body: `🔔 *Task Reminder*\n\n📌 *${taskTitle}*\n📅 Due: ${formattedDate}\n\n— Task Manager`,
        });
        console.log(`✅ WhatsApp reminder sent to ${to} for "${taskTitle}"`);
        return true;
    } catch (error) {
        console.error("❌ WhatsApp send failed:", error);
        return false;
    }
}
