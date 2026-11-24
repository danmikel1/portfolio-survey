import crypto from "node:crypto";

interface BucketEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, BucketEntry>();
const EPHEMERAL_SALT = crypto.randomBytes(16).toString("hex");

/**
 * Privacy-preserving in-memory rate limiter.
 * Hashes the transient request source with an ephemeral per-process salt so no raw IP is ever stored.
 */
export function checkRateLimit(
  rawKey: string,
  options: { namespace: string; maxRequests: number; windowMs: number }
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const hashedKey = crypto
    .createHash("sha256")
    .update(`${options.namespace}:${EPHEMERAL_SALT}:${rawKey}`)
    .digest("hex");

  // Periodic cleanup to keep memory bounded
  if (buckets.size > 2000) {
    for (const [k, entry] of buckets.entries()) {
      if (entry.resetAt <= now) {
        buckets.delete(k);
      }
    }
  }

  const existing = buckets.get(hashedKey);
  if (!existing || existing.resetAt <= now) {
    buckets.set(hashedKey, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= options.maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getTransientClientKey(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "anonymous-local";
}
