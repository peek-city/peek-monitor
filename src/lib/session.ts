import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  userId: string;
  username: string;
  avatar: string | null;
  exp?: number;
}

function getSecret(): Uint8Array {
  const secret = process.env.DASHBOARD_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "Variable de entorno DASHBOARD_SESSION_SECRET no configurada"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(
  payload: Omit<SessionPayload, "exp">
): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());
  return token;
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      avatar: (payload.avatar as string | null) ?? null,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function getSessionCookie() {
  return {
    name: "session",
    options: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 86400,
    },
  };
}
