"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Banner } from "@astryxdesign/core/Banner";
import { Text } from "@astryxdesign/core/Text";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Sign-in failed.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error while signing in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen plaster-draft-grid text-[#18191C] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-[6px] border border-[#18191C] bg-[#FFFFFF] overflow-hidden shadow-[0_20px_50px_-28px_rgba(24,25,28,0.4)]">
        <div className="carbon-draft-grid px-6 py-5 text-[#F5F4F0] border-b border-[#2D3038]">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#F47B4F]">
            Field Study 01 · Private Console
          </div>
          <h1
            className="text-xl font-semibold tracking-tight mt-1"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Admin Analytics Sign In
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error ? (
            <Banner status="error" title="Authentication error" collapsible={false}>
              <Text type="supporting">{error}</Text>
            </Banner>
          ) : null}

          <div className="space-y-3.5">
            <div className="space-y-1">
              <label
                htmlFor="admin-username"
                className="block font-mono text-[11px] uppercase tracking-wider text-[#555963]"
              >
                Username
              </label>
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-[4px] border border-[#A8A49B] bg-[#F5F4F0] px-3.5 py-2.5 text-sm text-[#18191C] focus:border-[#18191C] focus:bg-[#FFFFFF] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="admin-password"
                className="block font-mono text-[11px] uppercase tracking-wider text-[#555963]"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[4px] border border-[#A8A49B] bg-[#F5F4F0] px-3.5 py-2.5 text-sm text-[#18191C] focus:border-[#18191C] focus:bg-[#FFFFFF] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-[4px] bg-[#C44114] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#18191C] transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Sign in to console"}
          </button>

          <div className="pt-2 border-t border-[#D9D6CE] flex items-center justify-between text-xs text-[#555963]">
            <span>Protected session cookie</span>
            <Link href="/" className="underline hover:text-[#18191C]">
              Public survey
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
