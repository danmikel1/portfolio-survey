import type { Metadata } from "next";
import Link from "next/link";
import { PRIVACY_NOTICE_VERSION } from "@/lib/survey-config";

export const metadata: Metadata = {
  title: "Privacy Notice (RA 10173) — Portfolio Workflow Study",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F5F4F0] text-[#18191C] py-10 sm:py-16 px-5 sm:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between text-xs text-[#555963]">
          <Link
            href="/"
            className="font-medium text-[#18191C] underline underline-offset-4 hover:text-[#C44114]"
          >
            Back to field study overview
          </Link>
          <span className="font-mono tabular-nums">Notice {PRIVACY_NOTICE_VERSION}</span>
        </div>

        <article className="rounded-[6px] border border-[#18191C] bg-[#FFFFFF] overflow-hidden">
          <div className="bg-[#18191C] text-[#F5F4F0] px-6 sm:px-10 py-7 space-y-1.5">
            <div className="font-mono text-xs uppercase tracking-wider text-[#F47B4F]">
              Republic Act No. 10173
            </div>
            <h1
              className="text-2xl sm:text-3xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              Privacy Notice &amp; Data Retention Policy
            </h1>
          </div>

          <div className="p-6 sm:p-10 space-y-6 text-sm leading-relaxed text-[#555963]">
            <div>
              <h2 className="font-semibold text-[#18191C] mb-1">
                01 · Purpose of collection
              </h2>
              <p>
                Information submitted through this survey is used strictly for market
                research to evaluate presentation workflows, pain points, feature priorities,
                and pricing expectations for service professionals.
              </p>
            </div>

            <div className="border-t border-[#D9D6CE] pt-5">
              <h2 className="font-semibold text-[#18191C] mb-1">
                02 · What we collect (and what we do not collect)
              </h2>
              <p>
                Survey answers are stored anonymously in structured JSONB format alongside
                the questionnaire version and optional completion duration. We do{" "}
                <strong className="text-[#18191C]">not</strong> log or store respondent IP
                addresses, browser fingerprints, or tracking cookies.
              </p>
            </div>

            <div className="border-t border-[#D9D6CE] pt-5">
              <h2 className="font-semibold text-[#18191C] mb-1">
                03 · Optional follow-up contact separation
              </h2>
              <p>
                If you indicate &ldquo;Yes&rdquo; or &ldquo;Maybe&rdquo; to a follow-up
                interview or early product test and choose to provide your name or preferred
                contact handle, that information is saved in a separate database table with
                no link to your anonymous survey responses, and only after you check the
                explicit consent box.
              </p>
            </div>

            <div className="border-t border-[#D9D6CE] pt-5">
              <h2 className="font-semibold text-[#18191C] mb-1">
                04 · Retention, security &amp; deletion rights
              </h2>
              <p>
                Data is hosted on a private server behind encrypted HTTPS transport and
                access-controlled administration. Optional contact details are retained only
                for the duration of the research and early prototype testing period (up to 6
                months) and permanently deleted afterward or earlier upon request.
              </p>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
