import { type NextRequest, NextResponse } from "next/server";
import { lucia } from "~/lib/lucia";

export async function POST(req: NextRequest) {
    const sessionId = req.cookies.get(lucia.sessionCookieName)?.value;
    if (!sessionId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await lucia.invalidateSession(sessionId);

    const sessionCookie = lucia.createBlankSessionCookie();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return response;
}
