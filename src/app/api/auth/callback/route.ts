import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCode,
  getUser,
  getUserGuilds,
  isMemberOfPeekGuild,
} from "@/lib/discord";
import { createSession, getSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get("oauth_state")?.value;

  // Validate state
  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_state", request.url)
    );
  }

  try {
    // Exchange code for token
    const accessToken = await exchangeCode(code);

    // Get user info and guilds
    const [user, guilds] = await Promise.all([
      getUser(accessToken),
      getUserGuilds(accessToken),
    ]);

    // Verify guild membership
    if (!isMemberOfPeekGuild(guilds)) {
      return NextResponse.redirect(
        new URL("/login?error=not_member", request.url)
      );
    }

    // Create session
    const token = await createSession({
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
    });

    const { name, options } = getSessionCookie();
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(name, token, options);
    response.cookies.delete("oauth_state");

    return response;
  } catch (error) {
    console.error("Error en callback de Discord:", error);
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url)
    );
  }
}
