import { type NextRequest, NextResponse } from "next/server";
import { lucia } from "~/lib/lucia";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as Record<string, unknown>;
        const username = typeof body.username === "string" ? body.username : "";
        const password = typeof body.password === "string" ? body.password : "";

        if (!username || !password || username.length < 3 || password.length < 6) {
            return NextResponse.json(
                { error: "Invalid credentials. Username must be at least 3 characters and password at least 6." },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.username, username),
        });
        if (existingUser) {
            return NextResponse.json({ error: "Username already taken" }, { status: 409 });
        }

        const userId = nanoid();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        await db.insert(users).values({
            id: userId,
            username,
            password: hashedPassword,
        });

        // Create session
        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        const response = NextResponse.json({ ok: true });
        response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        return response;
    } catch (err) {
        console.error("Register error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
