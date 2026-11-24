import Link from "next/link";
import { PrivacyDialog } from "@/components/survey/PrivacyDialog";
import { SURVEY_VERSION } from "@/lib/survey-config";

const DISCIPLINE_INDEX = [
  { num: "01", label: "Architects & Firms" },
  { num: "02", label: "Civil / Structural / MEP" },
  { num: "03", label: "Interior Designers" },
  { num: "04", label: "Design-Build Contractors" },
  { num: "05", label: "Technical Consultants" },
  { num: "06", label: "Creative & IT Agencies" },
];

const STUDY_SECTIONS = [
  { num: "01", title: "Professional background", note: "Discipline, team setup, monthly pitch volume" },
  { num: "02", title: "Current workflow", note: "Materials shown, tools used, prep time" },
  { num: "03", title: "Pain points & impact", note: "Biggest time sinks and client impact" },
  { num: "04", title: "Workflow needs", note: "Priorities and practical constraints" },
  { num: "05", title: "Pricing & follow-up", note: "Optional interview opt-in (RA 10173)" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#18191C] flex flex-col">
      {/* Top Swiss Specification Header */}
      <header className="border-b border-[#D9D6CE] bg-[#F5F4F0]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="w-6 h-6 rounded-[3px] bg-[#18191C] text-[#F5F4F0] inline-flex items-center justify-center font-mono text-xs font-medium"
              aria-hidden="true"
            >
              R
            </span>
            <span
              className="text-sm font-semibold tracking-tight text-[#18191C]"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              Client Presentation &amp; Portfolio Workflow Study
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#555963]">
            <span className="hidden sm:inline font-mono tabular-nums">
              5–7 MIN · 20 QUESTIONS · {SURVEY_VERSION}
            </span>
            <Link
              href="/survey"
              className="rounded-[4px] bg-[#18191C] px-3.5 py-2 text-xs font-medium text-[#F5F4F0] hover:bg-[#C44114] transition-colors"
            >
              Start survey
            </Link>
          </div>
        </div>
      </header>

      {/* Neutral Research Cover Spread (No product pitch to avoid biasing responses) */}
      <main className="flex-1 flex flex-col justify-center">
        <section className="plaster-draft-grid border-b border-[#D9D6CE]">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Left: Neutral Research Brief (7 cols) */}
              <div className="lg:col-span-7 space-y-7 folio-enter">
                <div className="inline-flex items-center gap-2.5 border border-[#D9D6CE] bg-[#FFFFFF] px-3 py-1.5 rounded-[3px]">
                  <span className="w-2 h-2 rounded-full bg-[#D94E1F]" />
                  <span className="font-mono text-xs text-[#18191C]">
                    Independent Market Research · {SURVEY_VERSION}
                  </span>
                </div>

                <h1
                  className="text-4xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#18191C] max-w-[17ch]"
                  style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                >
                  Client Presentation &amp; Portfolio Workflow Survey
                </h1>

                <p className="text-base sm:text-lg leading-relaxed text-[#555963] max-w-[56ch]">
                  We&apos;re conducting research to understand how service professionals
                  prepare portfolios, project presentations, and proposals when pitching to
                  prospective clients. There are no right or wrong answers—we&apos;re
                  interested in your actual day-to-day workflow.
                </p>

                {/* Primary & Privacy Actions */}
                <div className="flex flex-wrap items-center gap-3.5 pt-1">
                  <Link
                    href="/survey"
                    className="inline-flex items-center gap-3 rounded-[4px] bg-[#C44114] px-6 py-3.5 text-sm font-medium text-white hover:bg-[#18191C] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94E1F]"
                  >
                    <span>Start the survey</span>
                    <span className="font-mono text-xs opacity-85" aria-hidden="true">
                      01/05
                    </span>
                  </Link>

                  <PrivacyDialog
                    triggerLabel="Privacy Notice (RA 10173)"
                    triggerClassName="px-4 py-3.5 rounded-[4px] border border-[#18191C] bg-[#FFFFFF] text-sm font-medium text-[#18191C] hover:bg-[#18191C] hover:text-[#F5F4F0] transition-colors cursor-pointer"
                  />
                </div>

                {/* Swiss Research Spec Strip */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#D9D6CE] max-w-xl">
                  <div>
                    <div
                      className="text-2xl font-semibold tabular-nums text-[#18191C]"
                      style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                    >
                      5–7m
                    </div>
                    <div className="text-xs text-[#555963] mt-0.5">
                      Estimated completion time
                    </div>
                  </div>
                  <div className="border-l border-[#D9D6CE] pl-4">
                    <div
                      className="text-2xl font-semibold tabular-nums text-[#18191C]"
                      style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                    >
                      0 IPs
                    </div>
                    <div className="text-xs text-[#555963] mt-0.5">
                      Anonymous · No IP logging
                    </div>
                  </div>
                  <div className="border-l border-[#D9D6CE] pl-4">
                    <div
                      className="text-2xl font-semibold tabular-nums text-[#C44114]"
                      style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                    >
                      5 steps
                    </div>
                    <div className="text-xs text-[#555963] mt-0.5">
                      Draft auto-saves on device
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Neutral Study Outline Card (5 cols — purely informational, zero pitch) */}
              <aside className="lg:col-span-5 carbon-draft-grid rounded-[6px] border border-[#18191C] text-[#F5F4F0] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#2D3038] bg-[#141518] flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#9B9FA8]">
                    Questionnaire Outline
                  </span>
                  <span className="font-mono text-[11px] text-[#F47B4F]">20 questions</span>
                </div>

                <div className="p-5 divide-y divide-[#2D3038]">
                  {STUDY_SECTIONS.map((s) => (
                    <div key={s.num} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3.5">
                      <span className="font-mono text-xs text-[#F47B4F] pt-0.5 tabular-nums">
                        {s.num}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-[#F5F4F0]">{s.title}</div>
                        <div className="text-xs text-[#9B9FA8] mt-0.5">{s.note}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-3.5 border-t border-[#2D3038] bg-[#141518] text-xs text-[#9B9FA8] leading-relaxed">
                  Optional contact info at the end is stored separately only if you opt in
                  and grant explicit consent under RA 10173.
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Target Disciplines Strip */}
        <section className="bg-[#FFFFFF] border-b border-[#D9D6CE]">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-7">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {DISCIPLINE_INDEX.map((item) => (
                <div
                  key={item.num}
                  className="border-l-2 border-[#D9D6CE] pl-3 py-0.5"
                >
                  <div className="font-mono text-[11px] text-[#C44114]">{item.num}</div>
                  <div className="text-xs font-medium text-[#18191C] mt-0.5">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Compact Footer */}
      <footer className="bg-[#18191C] text-[#9B9FA8]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span>
            Please answer based on your actual experience. Questions marked &ldquo;Select all
            that apply&rdquo; allow multiple answers.
          </span>
          <Link
            href="/privacy"
            className="text-[#F5F4F0] underline underline-offset-4 hover:text-[#F47B4F] transition-colors"
          >
            Privacy &amp; Retention Policy (RA 10173)
          </Link>
        </div>
      </footer>
    </div>
  );
}
