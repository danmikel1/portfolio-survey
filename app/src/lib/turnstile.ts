export const TURNSTILE_EXPECTED_ACTION = "survey_submit";

interface TurnstileVerifyResult {
  ok: boolean;
  reason?: string;
}

/**
 * Canonical server-side Cloudflare Turnstile siteverify check.
 * Fails closed in production when misconfigured or unreachable.
 * Allows local development bypass only when NODE_ENV !== "production" and TURNSTILE_SECRET_KEY is unset.
 */
export async function verifyTurnstileToken(token: string): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim() ?? "";
  const isProd = process.env.NODE_ENV === "production";

  if (!secret) {
    if (!isProd) {
      return { ok: true, reason: "dev_bypass_unconfigured" };
    }
    return { ok: false, reason: "turnstile_secret_missing" };
  }

  const expectedHostnames = new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean)
  );

  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return { ok: false, reason: "invalid_token" };
  }

  if (isProd && expectedHostnames.size === 0) {
    return { ok: false, reason: "expected_hostnames_missing" };
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    });

    if (!response.ok) {
      return { ok: false, reason: `siteverify_http_${response.status}` };
    }

    const result = (await response.json()) as {
      success?: boolean;
      action?: string;
      hostname?: string;
    };

    if (!result.success) {
      return { ok: false, reason: "verification_failed" };
    }

    if (result.action && result.action !== TURNSTILE_EXPECTED_ACTION) {
      return { ok: false, reason: "action_mismatch" };
    }

    if (
      expectedHostnames.size > 0 &&
      (!result.hostname || !expectedHostnames.has(result.hostname.toLowerCase()))
    ) {
      return { ok: false, reason: "hostname_mismatch" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "siteverify_unreachable" };
  }
}
