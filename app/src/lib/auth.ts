import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "ps_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

interface SessionPayload {
  sub: string;
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return secret;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET must be set to at least 32 characters in production.");
  }
  return "dev_only_fallback_secret_do_not_use_in_production_0123456789";
}

function signPayload(payloadB64: string): string {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payloadB64)
    .digest("base64url");
}

export function createAdminSessionToken(username: string): string {
  const payload: SessionPayload = {
    sub: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = signPayload(payloadB64);
  return `${payloadB64}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sig] = parts;
  const expectedSig = signPayload(payloadB64);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as SessionPayload;
    if (!parsed.sub || typeof parsed.exp !== "number") return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function resolveBcryptHash(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (/^\$2[aby]\$\d{2}\$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const decoded = Buffer.from(trimmed, "base64").toString("utf8").trim();
    if (/^\$2[aby]\$\d{2}\$/.test(decoded)) {
      return decoded;
    }
  } catch {
    // Ignore invalid base64
  }
  return null;
}

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME ?? "admin";
  const passwordHash = resolveBcryptHash(process.env.ADMIN_PASSWORD_HASH);

  if (!passwordHash) {
    return false;
  }

  const userBuf = Buffer.from(username);
  const expectedUserBuf = Buffer.from(expectedUser);
  const userMatches =
    userBuf.length === expectedUserBuf.length && crypto.timingSafeEqual(userBuf, expectedUserBuf);

  // Always run bcrypt.compare to mitigate timing side-channels
  const passwordMatches = await bcrypt.compare(password, passwordHash);
  return userMatches && passwordMatches;
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function setAdminSessionCookie(username: string): Promise<void> {
  const cookieStore = await cookies();
  const token = createAdminSessionToken(username);
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
