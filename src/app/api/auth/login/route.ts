import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/discord";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = crypto.randomUUID();
  const url = getAuthorizationUrl(state);

  const response = NextResponse.redirect(url);
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 300, // 5 minutes
  });

  return response;
}
