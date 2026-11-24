import {
  Q01_PROFESSION_OPTIONS,
  Q02_WORK_SETUP_OPTIONS,
  Q10_PREP_TIME_OPTIONS,
  Q11_DIFFICULTIES_OPTIONS,
  Q15_IMPACT_OPTIONS,
  Q17_CAPABILITIES_OPTIONS,
  Q18_BARRIERS_OPTIONS,
  Q19_WTP_OPTIONS,
  optionLabelMap,
} from "./survey-config";
import type { SurveyAnswers } from "./validation";

export interface RawResponseRecord {
  id: string;
  surveyVersion: string;
  submittedAt: Date;
  completionSeconds: number | null;
  answers: unknown;
}

export interface CountDatum {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

export interface CrossSegmentRow {
  professionKey: string;
  professionLabel: string;
  responses: number;
  highPainPct: number;
  wtp200PlusPct: number;
  wtp400PlusPct: number;
  lostOrDelayedPct: number;
}

export interface DailyVelocityPoint {
  date: string;
  responses: number;
}

export interface SurveyAnalyticsSummary {
  totalResponses: number;
  availableVersions: string[];
  medianCompletionSeconds: number | null;
  highPainRatePct: number;
  highUsefulnessRatePct: number;
  wtp200PlusPct: number;
  wtp400PlusPct: number;
  lostOrDelayedPct: number;
  interviewOptInCount: number;
  professions: CountDatum[];
  workSetups: CountDatum[];
  prepTimes: CountDatum[];
  topBottlenecks: CountDatum[];
  topCapabilities: CountDatum[];
  adoptionBarriers: CountDatum[];
  willingnessToPay: CountDatum[];
  businessImpact: CountDatum[];
  crossSegments: CrossSegmentRow[];
  dailyVelocity: DailyVelocityPoint[];
}

const PAID_200_PLUS = new Set(["php_200_399", "php_400_699", "php_700_999", "php_1000_plus"]);
const PAID_400_PLUS = new Set(["php_400_699", "php_700_999", "php_1000_plus"]);
const LOST_OR_DELAYED = new Set(["yes_multiple", "yes_once"]);

function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

function buildOrderedCounts(
  counts: Map<string, number>,
  options: { value: string; label: string }[],
  total: number,
  sortDescending = false
): CountDatum[] {
  const rows = options.map((o) => {
    const count = counts.get(o.value) ?? 0;
    return {
      key: o.value,
      label: o.label,
      count,
      percentage: pct(count, total),
    };
  });
  return sortDescending ? rows.sort((a, b) => b.count - a.count) : rows;
}

export function computeAnalytics(
  records: RawResponseRecord[],
  filters: { version?: string; profession?: string; workSetup?: string } = {}
): SurveyAnalyticsSummary {
  const availableVersions = Array.from(new Set(records.map((r) => r.surveyVersion))).sort().reverse();

  const filtered = records.filter((r) => {
    const ans = r.answers as Partial<SurveyAnswers>;
    if (filters.version && filters.version !== "all" && r.surveyVersion !== filters.version) {
      return false;
    }
    if (
      filters.profession &&
      filters.profession !== "all" &&
      !ans.q01_profession?.includes(filters.profession)
    ) {
      return false;
    }
    if (
      filters.workSetup &&
      filters.workSetup !== "all" &&
      ans.q02_work_setup !== filters.workSetup
    ) {
      return false;
    }
    return true;
  });

  const total = filtered.length;
  const completionTimes: number[] = [];
  let highPainCount = 0;
  let highUsefulnessCount = 0;
  let wtp200PlusCount = 0;
  let wtp400PlusCount = 0;
  let lostOrDelayedCount = 0;
  let interviewOptInCount = 0;

  const professionCounts = new Map<string, number>();
  const workSetupCounts = new Map<string, number>();
  const prepTimeCounts = new Map<string, number>();
  const bottleneckCounts = new Map<string, number>();
  const capabilityCounts = new Map<string, number>();
  const barrierCounts = new Map<string, number>();
  const wtpCounts = new Map<string, number>();
  const impactCounts = new Map<string, number>();
  const dailyMap = new Map<string, number>();

  const q11Labels = optionLabelMap(Q11_DIFFICULTIES_OPTIONS);

  for (const row of filtered) {
    const ans = row.answers as Partial<SurveyAnswers>;

    if (typeof row.completionSeconds === "number" && row.completionSeconds > 0) {
      completionTimes.push(row.completionSeconds);
    }

    const dayKey = row.submittedAt.toISOString().slice(0, 10);
    dailyMap.set(dayKey, (dailyMap.get(dayKey) ?? 0) + 1);

    for (const p of ans.q01_profession ?? []) {
      professionCounts.set(p, (professionCounts.get(p) ?? 0) + 1);
    }
    if (ans.q02_work_setup) {
      workSetupCounts.set(ans.q02_work_setup, (workSetupCounts.get(ans.q02_work_setup) ?? 0) + 1);
    }
    if (ans.q10_prep_time) {
      prepTimeCounts.set(ans.q10_prep_time, (prepTimeCounts.get(ans.q10_prep_time) ?? 0) + 1);
    }

    const bottleneckKey =
      ans.q12_biggest_bottleneck_choice && ans.q12_biggest_bottleneck_choice !== "__custom__"
        ? ans.q12_biggest_bottleneck_choice
        : ans.q12_biggest_bottleneck_text?.trim()
          ? "custom_other"
          : "";
    if (bottleneckKey) {
      bottleneckCounts.set(bottleneckKey, (bottleneckCounts.get(bottleneckKey) ?? 0) + 1);
    }

    if ((ans.q13_problem_significance ?? 0) >= 4) highPainCount += 1;
    if ((ans.q16_concept_usefulness ?? 0) >= 4) highUsefulnessCount += 1;

    if (ans.q15_business_impact) {
      impactCounts.set(ans.q15_business_impact, (impactCounts.get(ans.q15_business_impact) ?? 0) + 1);
      if (LOST_OR_DELAYED.has(ans.q15_business_impact)) lostOrDelayedCount += 1;
    }

    for (const cap of ans.q17_top_capabilities ?? []) {
      capabilityCounts.set(cap, (capabilityCounts.get(cap) ?? 0) + 1);
    }
    for (const bar of ans.q18_adoption_barriers ?? []) {
      barrierCounts.set(bar, (barrierCounts.get(bar) ?? 0) + 1);
    }

    if (ans.q19_willingness_to_pay) {
      wtpCounts.set(
        ans.q19_willingness_to_pay,
        (wtpCounts.get(ans.q19_willingness_to_pay) ?? 0) + 1
      );
      if (PAID_200_PLUS.has(ans.q19_willingness_to_pay)) wtp200PlusCount += 1;
      if (PAID_400_PLUS.has(ans.q19_willingness_to_pay)) wtp400PlusCount += 1;
    }

    if (ans.q20_followup_opt_in === "yes" || ans.q20_followup_opt_in === "maybe") {
      interviewOptInCount += 1;
    }
  }

  const bottleneckRows: CountDatum[] = Array.from(bottleneckCounts.entries())
    .map(([key, count]) => ({
      key,
      label: key === "custom_other" ? "Custom / Other bottleneck" : q11Labels[key] ?? key,
      count,
      percentage: pct(count, total),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Cross-segment comparison by profession
  const crossSegments: CrossSegmentRow[] = Q01_PROFESSION_OPTIONS.map((prof) => {
    const subset = filtered.filter((r) =>
      (r.answers as Partial<SurveyAnswers>).q01_profession?.includes(prof.value)
    );
    const n = subset.length;
    const highPain = subset.filter(
      (r) => ((r.answers as Partial<SurveyAnswers>).q13_problem_significance ?? 0) >= 4
    ).length;
    const wtp200 = subset.filter((r) =>
      PAID_200_PLUS.has((r.answers as Partial<SurveyAnswers>).q19_willingness_to_pay ?? "")
    ).length;
    const wtp400 = subset.filter((r) =>
      PAID_400_PLUS.has((r.answers as Partial<SurveyAnswers>).q19_willingness_to_pay ?? "")
    ).length;
    const lost = subset.filter((r) =>
      LOST_OR_DELAYED.has((r.answers as Partial<SurveyAnswers>).q15_business_impact ?? "")
    ).length;

    return {
      professionKey: prof.value,
      professionLabel: prof.label,
      responses: n,
      highPainPct: pct(highPain, n),
      wtp200PlusPct: pct(wtp200, n),
      wtp400PlusPct: pct(wtp400, n),
      lostOrDelayedPct: pct(lost, n),
    };
  }).filter((row) => row.responses > 0);

  const dailyVelocity: DailyVelocityPoint[] = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, responses]) => ({ date, responses }));

  return {
    totalResponses: total,
    availableVersions,
    medianCompletionSeconds: median(completionTimes),
    highPainRatePct: pct(highPainCount, total),
    highUsefulnessRatePct: pct(highUsefulnessCount, total),
    wtp200PlusPct: pct(wtp200PlusCount, total),
    wtp400PlusPct: pct(wtp400PlusCount, total),
    lostOrDelayedPct: pct(lostOrDelayedCount, total),
    interviewOptInCount,
    professions: buildOrderedCounts(professionCounts, Q01_PROFESSION_OPTIONS, total, true),
    workSetups: buildOrderedCounts(workSetupCounts, Q02_WORK_SETUP_OPTIONS, total),
    prepTimes: buildOrderedCounts(prepTimeCounts, Q10_PREP_TIME_OPTIONS, total),
    topBottlenecks: bottleneckRows,
    topCapabilities: buildOrderedCounts(capabilityCounts, Q17_CAPABILITIES_OPTIONS, total, true),
    adoptionBarriers: buildOrderedCounts(barrierCounts, Q18_BARRIERS_OPTIONS, total, true),
    willingnessToPay: buildOrderedCounts(wtpCounts, Q19_WTP_OPTIONS, total),
    businessImpact: buildOrderedCounts(impactCounts, Q15_IMPACT_OPTIONS, total),
    crossSegments,
    dailyVelocity,
  };
}
