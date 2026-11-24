"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Banner } from "@astryxdesign/core/Banner";
import { Card } from "@astryxdesign/core/Card";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Table, pixel, proportional } from "@astryxdesign/core/Table";
import type { TableColumn } from "@astryxdesign/core/Table";
import { Heading, Text } from "@astryxdesign/core/Text";
import { Theme } from "@astryxdesign/core/theme";
import { defaultThemeSlug, themes } from "@/astryx-themes";
import type {
  CountDatum,
  CrossSegmentRow,
  SurveyAnalyticsSummary,
} from "@/lib/analytics";
import { Q01_PROFESSION_OPTIONS, Q02_WORK_SETUP_OPTIONS } from "@/lib/survey-config";

interface ContactItem extends Record<string, unknown> {
  id: string;
  surveyVersion: string;
  availability: string;
  name: string | null;
  contact: string;
  consentGiven: boolean;
  consentTimestamp: string;
  privacyNoticeVersion: string;
  createdAt: string;
}

interface AnalyticsApiResponse {
  demoMode?: boolean;
  summary: SurveyAnalyticsSummary;
  contactsCount: number;
  contacts: ContactItem[];
}

type AdminSection = "overview" | "cross-tab" | "contacts";

interface BreakdownRow extends Record<string, unknown> {
  id: string;
  label: string;
  count: number;
  percentage: number;
}

interface CrossSegmentTableRow extends Record<string, unknown> {
  id: string;
  professionLabel: string;
  responses: number;
  highPainPct: string;
  wtp200PlusPct: string;
  wtp400PlusPct: string;
  lostOrDelayedPct: string;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function BreakdownTable({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: CountDatum[];
}) {
  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const rows: BreakdownRow[] = data.map((d) => ({
    id: d.key,
    label: d.label,
    count: d.count,
    percentage: d.percentage,
  }));

  const columns: TableColumn<BreakdownRow>[] = useMemo(
    () => [
      { key: "label", header: "Category", width: proportional(1.5) },
      {
        key: "count",
        header: "Share",
        width: proportional(1.2),
        renderCell: (item: BreakdownRow) => (
          <VStack gap={1}>
            <ProgressBar
              value={item.count}
              max={maxCount}
              label={`${item.label} (${item.percentage}%)`}
              isLabelHidden
            />
            <Text type="supporting" color="secondary">
              {item.count} ({item.percentage}%)
            </Text>
          </VStack>
        ),
      },
    ],
    [maxCount]
  );

  return (
    <Card padding={5}>
      <VStack gap={3}>
        <VStack gap={0.5}>
          <Heading level={4}>{title}</Heading>
          <Text type="supporting" color="secondary">
            {subtitle}
          </Text>
        </VStack>
        {rows.length === 0 ? (
          <Text type="supporting" color="secondary">
            No responses match the current filters yet.
          </Text>
        ) : (
          <Table data={rows} columns={columns} idKey="id" hasHover />
        )}
      </VStack>
    </Card>
  );
}

export function AdminDashboardClient({ username }: { username: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [section, setSection] = useState<AdminSection>("overview");
  const [versionFilter, setVersionFilter] = useState("all");
  const [professionFilter, setProfessionFilter] = useState("all");
  const [workSetupFilter, setWorkSetupFilter] = useState("all");
  const [data, setData] = useState<AnalyticsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        version: versionFilter,
        profession: professionFilter,
        workSetup: workSetupFilter,
      });
      const res = await fetch(`/api/admin/analytics?${params.toString()}`, {
        cache: "no-store",
      });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = (await res.json()) as AnalyticsApiResponse;
      setData(json);
    } catch {
      setError(
        "Unable to load analytics from PostgreSQL. Verify DATABASE_URL is running and migrations have been applied."
      );
    } finally {
      setLoading(false);
    }
  }, [professionFilter, router, versionFilter, workSetupFilter]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const handleSignOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const summary = data?.summary;
  const contacts = data?.contacts ?? [];

  const crossSegmentRows: CrossSegmentTableRow[] = useMemo(
    () =>
      (summary?.crossSegments ?? []).map((row: CrossSegmentRow) => ({
        id: row.professionKey,
        professionLabel: row.professionLabel,
        responses: row.responses,
        highPainPct: `${row.highPainPct}%`,
        wtp200PlusPct: `${row.wtp200PlusPct}%`,
        wtp400PlusPct: `${row.wtp400PlusPct}%`,
        lostOrDelayedPct: `${row.lostOrDelayedPct}%`,
      })),
    [summary]
  );

  const crossSegmentColumns: TableColumn<CrossSegmentTableRow>[] = useMemo(
    () => [
      { key: "professionLabel", header: "Discipline", width: proportional(1.6) },
      { key: "responses", header: "n", width: pixel(70) },
      { key: "highPainPct", header: "High pain (≥4)", width: pixel(120) },
      { key: "wtp200PlusPct", header: "WTP ≥ ₱200", width: pixel(115) },
      { key: "wtp400PlusPct", header: "WTP ≥ ₱400", width: pixel(115) },
      { key: "lostOrDelayedPct", header: "Lost/Delayed", width: pixel(120) },
    ],
    []
  );

  const contactColumns: TableColumn<ContactItem>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        width: proportional(1),
        renderCell: (item: ContactItem) => item.name ?? "—",
      },
      { key: "contact", header: "Preferred Contact", width: proportional(1.4) },
      { key: "availability", header: "Openness", width: pixel(95) },
      {
        key: "consentTimestamp",
        header: "RA 10173 Consent",
        width: pixel(175),
        renderCell: (item: ContactItem) =>
          `${item.consentTimestamp.slice(0, 10)} (${item.privacyNoticeVersion})`,
      },
    ],
    []
  );

  const exportQuery =
    versionFilter !== "all" ? `&version=${encodeURIComponent(versionFilter)}` : "";

  const isDark = mode === "dark";
  const contentShell = isDark
    ? "bg-[#121316] text-[#F5F4F0] [color-scheme:dark]"
    : "bg-[#F5F4F0] text-[#18191C] [color-scheme:light]";
  const kpiCardClass = isDark
    ? "rounded-[4px] border border-[#2D3038] bg-[#1B1D22] p-4 border-t-2"
    : "rounded-[4px] border border-[#D9D6CE] bg-[#FFFFFF] p-4 border-t-2";
  const tooltipStyle = {
    backgroundColor: isDark ? "#1B1D22" : "#18191C",
    border: "1px solid #32353D",
    borderRadius: "4px",
    color: "#F5F4F0",
    fontSize: "12px",
  };

  return (
    <Theme theme={themes[defaultThemeSlug]} mode={mode}>
      <div className={`min-h-screen transition-colors ${contentShell}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
          {/* Persistent Structural Carbon Sidebar */}
          <aside className="lg:col-span-3 carbon-draft-grid text-[#F5F4F0] border-b lg:border-b-0 lg:border-r border-[#2D3038] p-5 flex flex-col justify-between gap-6">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-2 pb-4 border-b border-[#2D3038]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-[2px] bg-[#D94E1F] text-white inline-flex items-center justify-center font-mono text-[11px] font-semibold">
                      F
                    </span>
                    <span
                      className="text-sm font-semibold tracking-tight"
                      style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                    >
                      Research Console
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[#9B9FA8] mt-1">
                    {username} · {data?.demoMode ? "demo" : "live pg"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMode((m) => (m === "light" ? "dark" : "light"))}
                  className="rounded-[3px] border border-[#4B4F5B] bg-[#23252C] px-2.5 py-1 font-mono text-[11px] text-[#F5F4F0] hover:border-[#F47B4F] transition-colors cursor-pointer"
                >
                  {isDark ? "Light" : "Dark"}
                </button>
              </div>

              <nav className="space-y-1" aria-label="Admin sections">
                {(
                  [
                    ["overview", "01", "Overview & Pricing"],
                    ["cross-tab", "02", "Cross-Segment Matrix"],
                    ["contacts", "03", `Contacts (${contacts.length})`],
                  ] as const
                ).map(([id, num, label]) => {
                  const active = section === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSection(id)}
                      className={`w-full text-left px-3 py-2.5 rounded-[4px] border text-sm font-medium transition-all cursor-pointer flex items-center gap-2.5 ${
                        active
                          ? "bg-[#23252C] border-[#D94E1F] text-[#F5F4F0] shadow-[inset_3px_0_0_#D94E1F]"
                          : "border-transparent text-[#9B9FA8] hover:bg-[#23252C]/60 hover:text-[#F5F4F0]"
                      }`}
                    >
                      <span
                        className={`font-mono text-[11px] ${
                          active ? "text-[#F47B4F]" : "text-[#6D717C]"
                        }`}
                      >
                        {num}
                      </span>
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-[#2D3038] space-y-3">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#9B9FA8]">
                  Segment Filters
                </div>

                <div className="space-y-1">
                  <label htmlFor="filter-version" className="block text-[11px] text-[#9B9FA8]">
                    Survey version
                  </label>
                  <select
                    id="filter-version"
                    value={versionFilter}
                    onChange={(e) => setVersionFilter(e.target.value)}
                    className="w-full rounded-[4px] border border-[#3C404B] bg-[#121316] px-2.5 py-2 text-xs text-[#F5F4F0]"
                  >
                    <option value="all">All versions</option>
                    {(summary?.availableVersions ?? []).map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="filter-profession"
                    className="block text-[11px] text-[#9B9FA8]"
                  >
                    Discipline
                  </label>
                  <select
                    id="filter-profession"
                    value={professionFilter}
                    onChange={(e) => setProfessionFilter(e.target.value)}
                    className="w-full rounded-[4px] border border-[#3C404B] bg-[#121316] px-2.5 py-2 text-xs text-[#F5F4F0]"
                  >
                    <option value="all">All disciplines</option>
                    {Q01_PROFESSION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="filter-setup" className="block text-[11px] text-[#9B9FA8]">
                    Work setup
                  </label>
                  <select
                    id="filter-setup"
                    value={workSetupFilter}
                    onChange={(e) => setWorkSetupFilter(e.target.value)}
                    className="w-full rounded-[4px] border border-[#3C404B] bg-[#121316] px-2.5 py-2 text-xs text-[#F5F4F0]"
                  >
                    <option value="all">All setups</option>
                    {Q02_WORK_SETUP_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#2D3038]">
              <a
                href={`/api/admin/export?type=responses${exportQuery}`}
                className="block w-full text-center rounded-[4px] bg-[#C44114] px-3 py-2 text-xs font-medium text-white hover:bg-[#D94E1F] transition-colors"
              >
                Export Responses CSV (PII-free)
              </a>
              <a
                href={`/api/admin/export?type=contacts${exportQuery}`}
                className="block w-full text-center rounded-[4px] border border-[#4B4F5B] bg-[#23252C] px-3 py-2 text-xs font-medium text-[#F5F4F0] hover:border-[#F47B4F] transition-colors"
              >
                Export Contacts CSV (Separate)
              </a>
              <div className="pt-2 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => void loadAnalytics()}
                  className="text-[#9B9FA8] hover:text-[#F5F4F0] cursor-pointer"
                >
                  Refresh
                </button>
                <Link href="/survey" className="text-[#9B9FA8] hover:text-[#F5F4F0]">
                  View survey
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-[#F47B4F] hover:text-white cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 p-5 sm:p-8 lg:p-10 space-y-6">
            {error ? (
              <Banner status="error" title="Database connection notice" collapsible={false}>
                <Text type="supporting">{error}</Text>
              </Banner>
            ) : null}

            {data?.demoMode ? (
              <div
                className={`rounded-[4px] border px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-2 ${
                  isDark
                    ? "border-[#D94E1F]/50 bg-[#D94E1F]/10 text-[#F5F4F0]"
                    : "border-[#D94E1F] bg-[#FDEEE8] text-[#18191C]"
                }`}
              >
                <span>
                  <strong className="font-mono text-[#C44114] dark:text-[#F47B4F]">
                    DEV DEMO MODE:
                  </strong>{" "}
                  PostgreSQL isn&apos;t running locally, so 78 simulated responses &amp; 12
                  isolated contacts are shown. New submissions from /survey append live in
                  memory.
                </span>
              </div>
            ) : null}

            {loading && !summary ? (
              <Card padding={6}>
                <Text type="supporting" color="secondary">
                  Loading survey analytics...
                </Text>
              </Card>
            ) : null}

            {summary && section === "overview" ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-3 pb-4 border-b border-current/15">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-[#C44114]">
                      Section 01 · Market Signal
                    </div>
                    <h1
                      className="text-2xl sm:text-3xl font-semibold tracking-tight mt-0.5"
                      style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                    >
                      Research overview
                    </h1>
                  </div>
                  <div className="font-mono text-xs opacity-75 tabular-nums">
                    Median duration: {formatDuration(summary.medianCompletionSeconds)} ·
                    PII-free JSONB
                  </div>
                </div>

                {/* KPI Strip */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
                  <div className={`${kpiCardClass} border-t-[#18191C]`}>
                    <div className="font-mono text-[11px] uppercase tracking-wider opacity-70">
                      Usable responses
                    </div>
                    <div
                      className="text-3xl font-semibold tabular-nums mt-1.5"
                      style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                    >
                      {summary.totalResponses}
                    </div>
                    <div className="text-xs opacity-70 mt-1">Target: ~75 usable</div>
                  </div>

                  <div className={`${kpiCardClass} border-t-[#D94E1F]`}>
                    <div className="font-mono text-[11px] uppercase tracking-wider opacity-70">
                      High pain (Q13 ≥ 4)
                    </div>
                    <div
                      className="text-3xl font-semibold tabular-nums mt-1.5 text-[#D94E1F]"
                      style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                    >
                      {summary.highPainRatePct}%
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      Lost/delayed: {summary.lostOrDelayedPct}%
                    </div>
                  </div>

                  <div className={`${kpiCardClass} border-t-[#16654B]`}>
                    <div className="font-mono text-[11px] uppercase tracking-wider opacity-70">
                      WTP ≥ ₱400 / mo
                    </div>
                    <div
                      className="text-3xl font-semibold tabular-nums mt-1.5 text-[#16654B] dark:text-[#34D399]"
                      style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                    >
                      {summary.wtp400PlusPct}%
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      ≥ ₱200 / mo: {summary.wtp200PlusPct}%
                    </div>
                  </div>

                  <div className={`${kpiCardClass} border-t-[#555963]`}>
                    <div className="font-mono text-[11px] uppercase tracking-wider opacity-70">
                      Interview opt-ins
                    </div>
                    <div
                      className="text-3xl font-semibold tabular-nums mt-1.5"
                      style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                    >
                      {summary.interviewOptInCount}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      Consented contacts: {contacts.length}
                    </div>
                  </div>
                </div>

                {/* Recharts: Willingness to Pay (₱) + Daily Velocity */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <Card padding={5}>
                    <VStack gap={3}>
                      <HStack hAlign="between" vAlign="center">
                        <Heading level={4}>Willingness to pay (PHP / month)</Heading>
                        <Text type="supporting" color="secondary">
                          Pro ₱399 · Studio ₱999
                        </Text>
                      </HStack>
                      <div className="h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={summary.willingnessToPay}
                            margin={{ top: 8, right: 12, left: -12, bottom: 20 }}
                          >
                            <CartesianGrid
                              vertical={false}
                              stroke="var(--color-border, #d9d6ce)"
                            />
                            <XAxis
                              dataKey="label"
                              tick={{
                                fontSize: 11,
                                fill: "var(--color-text-secondary, #555963)",
                              }}
                              interval={0}
                              angle={-18}
                              textAnchor="end"
                              height={50}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{
                                fontSize: 11,
                                fill: "var(--color-text-secondary, #555963)",
                              }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar
                              dataKey="count"
                              name="Responses"
                              fill="var(--color-data-categorical-blue, #D94E1F)"
                              radius={[2, 2, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </VStack>
                  </Card>

                  <Card padding={5}>
                    <VStack gap={3}>
                      <HStack hAlign="between" vAlign="center">
                        <Heading level={4}>Daily submission velocity</Heading>
                        <Text type="supporting" color="secondary">
                          2–3 week campaign pacing
                        </Text>
                      </HStack>
                      <div className="h-[260px] w-full">
                        {summary.dailyVelocity.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-xs opacity-70">
                            Submissions over time will chart here once responses arrive.
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={summary.dailyVelocity}
                              margin={{ top: 8, right: 12, left: -12, bottom: 8 }}
                            >
                              <CartesianGrid
                                vertical={false}
                                stroke="var(--color-border, #d9d6ce)"
                              />
                              <XAxis
                                dataKey="date"
                                tick={{
                                  fontSize: 11,
                                  fill: "var(--color-text-secondary, #555963)",
                                }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                allowDecimals={false}
                                tick={{
                                  fontSize: 11,
                                  fill: "var(--color-text-secondary, #555963)",
                                }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip contentStyle={tooltipStyle} />
                              <Line
                                type="monotone"
                                dataKey="responses"
                                name="Submissions"
                                stroke={isDark ? "#F06434" : "#18191C"}
                                strokeWidth={2.2}
                                dot={{ r: 3, fill: "#D94E1F", strokeWidth: 0 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </VStack>
                  </Card>
                </div>

                {/* Breakdown Tables */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <BreakdownTable
                    title="Profession / discipline breakdown"
                    subtitle="Multi-select respondents across service niches (Q1)"
                    data={summary.professions}
                  />
                  <BreakdownTable
                    title="Presentation preparation time"
                    subtitle="Typical effort to customize one client presentation (Q10)"
                    data={summary.prepTimes}
                  />
                  <BreakdownTable
                    title="Top presentation bottlenecks"
                    subtitle="Single biggest time/effort cost (Q12)"
                    data={summary.topBottlenecks}
                  />
                  <BreakdownTable
                    title="Most valuable capabilities"
                    subtitle="Top-3 feature priorities (Q17)"
                    data={summary.topCapabilities}
                  />
                </div>
              </div>
            ) : null}

            {summary && section === "cross-tab" ? (
              <div className="space-y-5">
                <div className="pb-4 border-b border-current/15">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[#C44114]">
                    Section 02 · Segment Comparison
                  </div>
                  <h1
                    className="text-2xl sm:text-3xl font-semibold tracking-tight mt-0.5"
                    style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                  >
                    Cross-segment comparison
                  </h1>
                </div>

                <Card padding={5}>
                  {crossSegmentRows.length === 0 ? (
                    <Text type="supporting" color="secondary">
                      No segment data available yet.
                    </Text>
                  ) : (
                    <Table
                      data={crossSegmentRows}
                      columns={crossSegmentColumns}
                      idKey="id"
                      hasHover
                    />
                  )}
                </Card>

                <BreakdownTable
                  title="Adoption barriers"
                  subtitle="What would prevent respondents from adopting a new tool (Q18)"
                  data={summary.adoptionBarriers}
                />
              </div>
            ) : null}

            {section === "contacts" ? (
              <div className="space-y-5">
                <div className="pb-4 border-b border-current/15">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[#C44114]">
                    Section 03 · Isolated PII Table (RA 10173)
                  </div>
                  <h1
                    className="text-2xl sm:text-3xl font-semibold tracking-tight mt-0.5"
                    style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                  >
                    Follow-up contacts
                  </h1>
                  <p className="text-xs opacity-75 mt-1">
                    Stored independently in <code className="font-mono">follow_up_contacts</code>{" "}
                    with explicit consent timestamps—never linked to raw survey responses.
                  </p>
                </div>

                <Card padding={5}>
                  {contacts.length === 0 ? (
                    <Text type="supporting" color="secondary">
                      No consented follow-up contacts recorded yet.
                    </Text>
                  ) : (
                    <Table
                      data={contacts}
                      columns={contactColumns}
                      idKey="id"
                      hasHover
                    />
                  )}
                </Card>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </Theme>
  );
}
