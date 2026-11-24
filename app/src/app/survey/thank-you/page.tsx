"use client";

import Link from "next/link";
import { useState } from "react";

export default function ThankYouPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen plaster-draft-grid text-[#18191C] flex items-center justify-center px-5 py-14">
      <section className="w-full max-w-xl rounded-[6px] border border-[#18191C] bg-[#FFFFFF] overflow-hidden shadow-[0_20px_45px_-28px_rgba(24,25,28,0.35)]">
        <div className="bg-[#18191C] px-6 sm:px-8 py-4 flex items-center justify-between text-[#F5F4F0]">
          <span className="font-mono text-xs uppercase tracking-wider text-[#34D399]">
            ● Response recorded
          </span>
          <span className="font-mono text-[11px] text-[#9B9FA8]">0 IPs logged</span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2.5">
            <h1
              className="text-3xl font-semibold tracking-tight text-[#18191C]"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              Thank you for sharing your workflow.
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-[#555963]">
              Your responses directly inform research into better presentation and portfolio
              tools for architects, engineers, interior designers, contractors, consultants,
              and agencies.
            </p>
          </div>

          <div className="border-t border-[#D9D6CE] pt-5 space-y-3">
            <p className="text-xs text-[#555963]">
              Know a colleague or studio partner who regularly pitches clients? Sharing the
              survey helps keep results balanced across disciplines.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="rounded-[4px] bg-[#C44114] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#18191C] transition-colors cursor-pointer"
              >
                {copied ? "Survey link copied" : "Copy survey link"}
              </button>
              <Link
                href="/"
                className="rounded-[4px] border border-[#18191C] px-4 py-2.5 text-sm font-medium text-[#18191C] hover:bg-[#18191C] hover:text-[#F5F4F0] transition-colors"
              >
                Back to overview
              </Link>
            </div>
          </div>

          <p className="text-xs text-[#555963] pt-1">
            Review our{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 text-[#18191C] hover:text-[#C44114]"
            >
              Privacy Notice (RA 10173)
            </Link>{" "}
            for retention and deletion details.
          </p>
        </div>
      </section>
    </main>
  );
}
