import type { SurveyAnswers } from "./validation";

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

/**
 * Neutralizes spreadsheet formula injection (CSV injection) and escapes per RFC 4180.
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let str = Array.isArray(value) ? value.join("; ") : String(value);
  str = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  if (FORMULA_PREFIX.test(str)) {
    str = `'${str}`;
  }

  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(escapeCsvCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCsvCell).join(","));
  }
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

export function buildResponsesCsv(
  records: Array<{
    id: string;
    surveyVersion: string;
    submittedAt: Date;
    completionSeconds: number | null;
    answers: unknown;
  }>
): string {
  const headers = [
    "id",
    "survey_version",
    "submitted_at",
    "completion_seconds",
    "q01_profession",
    "q01_profession_other",
    "q02_work_setup",
    "q03_client_acquisition",
    "q03_client_acquisition_other",
    "q04_monthly_pitches",
    "q05_last_presented",
    "q06_materials_shown",
    "q06_materials_shown_other",
    "q07_tools_used",
    "q07_tools_used_other",
    "q08_delivery_methods",
    "q08_delivery_methods_other",
    "q09_customize_frequency",
    "q10_prep_time",
    "q11_difficulties",
    "q11_difficulties_other",
    "q12_biggest_bottleneck_choice",
    "q12_biggest_bottleneck_text",
    "q13_problem_significance",
    "q14_current_workaround",
    "q15_business_impact",
    "q16_concept_usefulness",
    "q17_top_capabilities",
    "q18_adoption_barriers",
    "q18_adoption_barriers_other",
    "q19_willingness_to_pay",
    "q20_followup_opt_in",
  ];

  const rows = records.map((r) => {
    const a = r.answers as Partial<SurveyAnswers>;
    return [
      r.id,
      r.surveyVersion,
      r.submittedAt.toISOString(),
      r.completionSeconds ?? "",
      a.q01_profession ?? [],
      a.q01_profession_other ?? "",
      a.q02_work_setup ?? "",
      a.q03_client_acquisition ?? [],
      a.q03_client_acquisition_other ?? "",
      a.q04_monthly_pitches ?? "",
      a.q05_last_presented ?? "",
      a.q06_materials_shown ?? [],
      a.q06_materials_shown_other ?? "",
      a.q07_tools_used ?? [],
      a.q07_tools_used_other ?? "",
      a.q08_delivery_methods ?? [],
      a.q08_delivery_methods_other ?? "",
      a.q09_customize_frequency ?? "",
      a.q10_prep_time ?? "",
      a.q11_difficulties ?? [],
      a.q11_difficulties_other ?? "",
      a.q12_biggest_bottleneck_choice ?? "",
      a.q12_biggest_bottleneck_text ?? "",
      a.q13_problem_significance ?? "",
      a.q14_current_workaround ?? "",
      a.q15_business_impact ?? "",
      a.q16_concept_usefulness ?? "",
      a.q17_top_capabilities ?? [],
      a.q18_adoption_barriers ?? [],
      a.q18_adoption_barriers_other ?? "",
      a.q19_willingness_to_pay ?? "",
      a.q20_followup_opt_in ?? "",
    ];
  });

  return toCsv(headers, rows);
}

export function buildContactsCsv(
  contacts: Array<{
    id: string;
    surveyVersion: string;
    availability: string;
    name: string | null;
    contact: string;
    consentGiven: boolean;
    consentTimestamp: Date;
    privacyNoticeVersion: string;
    createdAt: Date;
  }>
): string {
  const headers = [
    "id",
    "survey_version",
    "availability",
    "name",
    "contact",
    "consent_given",
    "consent_timestamp",
    "privacy_notice_version",
    "created_at",
  ];
  const rows = contacts.map((c) => [
    c.id,
    c.surveyVersion,
    c.availability,
    c.name ?? "",
    c.contact,
    c.consentGiven,
    c.consentTimestamp.toISOString(),
    c.privacyNoticeVersion,
    c.createdAt.toISOString(),
  ]);
  return toCsv(headers, rows);
}
