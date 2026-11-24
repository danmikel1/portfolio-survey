import { NextResponse } from "next/server";
import { z } from "zod";
import { setAdminSessionCookie, verifyAdminCredentials } from "@/lib/auth";
import { checkRateLimit, getTransientClientKey } from "@/lib/rate-limit";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  const rate = checkRateLimit(getTransientClientKey(request), {
    namespace: "admin_login",
    maxRequests: 8,
    windowMs: 15 * 60 * 1000,
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const valid = await verifyAdminCredentials(parsed.data.username, parsed.data.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  await setAdminSessionCookie(parsed.data.username);
  return NextResponse.json({ ok: true }, { status: 200 });
}
