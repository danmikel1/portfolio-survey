"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Banner } from "@astryxdesign/core/Banner";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { Divider } from "@astryxdesign/core/Divider";
import { Text } from "@astryxdesign/core/Text";
import {
  PRIVACY_NOTICE_VERSION,
  Q01_PROFESSION_OPTIONS,
  Q02_WORK_SETUP_OPTIONS,
  Q03_ACQUISITION_OPTIONS,
  Q04_PITCH_FREQ_OPTIONS,
  Q05_LAST_PRESENTED_OPTIONS,
  Q06_MATERIALS_OPTIONS,
  Q07_TOOLS_OPTIONS,
  Q08_DELIVERY_OPTIONS,
  Q09_CUSTOMIZE_OPTIONS,
  Q10_PREP_TIME_OPTIONS,
  Q11_DIFFICULTIES_OPTIONS,
  Q15_IMPACT_OPTIONS,
  Q17_CAPABILITIES_OPTIONS,
  Q18_BARRIERS_OPTIONS,
  Q19_WTP_OPTIONS,
  Q20_FOLLOWUP_OPTIONS,
  SURVEY_STEPS,
  SURVEY_VERSION,
  optionLabelMap,
} from "@/lib/survey-config";
import {
  shouldSkipPainDetails,
  shouldSkipWorkflowDetails,
  type SurveyAnswers,
} from "@/lib/validation";
import { PrivacyDialog } from "./PrivacyDialog";
import {
  LikertQuestion,
  MultiSelectQuestion,
  SingleSelectQuestion,
} from "./SurveyOptionGroup";
import { TurnstileWidget } from "./TurnstileWidget";

const DRAFT_STORAGE_KEY = `portfolio_survey_draft_${SURVEY_VERSION}`;

interface DraftState {
  answers: Partial<SurveyAnswers>;
  contactName: string;
  contactHandle: string;
  consentGiven: boolean;
  step: number;
}

const INITIAL_DRAFT: DraftState = {
  answers: {
    q01_profession: [],
    q01_profession_other: "",
    q03_client_acquisition: [],
    q03_client_acquisition_other: "",
    q06_materials_shown: [],
    q06_materials_shown_other: "",
    q07_tools_used: [],
    q07_tools_used_other: "",
    q08_delivery_methods: [],
    q08_delivery_methods_other: "",
    q11_difficulties: [],
    q11_difficulties_other: "",
    q12_biggest_bottleneck_choice: "",
    q12_biggest_bottleneck_text: "",
    q14_current_workaround: "",
    q17_top_capabilities: [],
    q18_adoption_barriers: [],
    q18_adoption_barriers_other: "",
  },
  contactName: "",
  contactHandle: "",
  consentGiven: false,
  step: 0,
};

type StepErrors = Record<string, string>;

function validateStep(step: number, draft: DraftState): StepErrors {
  const errors: StepErrors = {};
  const a = draft.answers;

  if (step === 0) {
    if (!a.q01_profession?.length) {
      errors.q01_profession = "Select at least one profession or business type.";
    }
    if (!a.q02_work_setup) {
      errors.q02_work_setup = "Select how you currently work.";
    }
    if (!a.q03_client_acquisition?.length) {
      errors.q03_client_acquisition = "Select at least one way you acquire clients.";
    }
    if (!a.q04_monthly_pitches) {
      errors.q04_monthly_pitches = "Select your typical monthly client pitches.";
    }
  } else if (step === 1) {
    if (!a.q05_last_presented) {
      errors.q05_last_presented = "Select when you last presented to a prospective client.";
    }
    if (!shouldSkipWorkflowDetails(a)) {
      if (!a.q06_materials_shown?.length) {
        errors.q06_materials_shown = "Select at least one item you normally show clients.";
      }
      if (!a.q07_tools_used?.length) {
        errors.q07_tools_used = "Select at least one tool or 'I don't use dedicated tools'.";
      }
      if (!a.q08_delivery_methods?.length) {
        errors.q08_delivery_methods = "Select at least one delivery method.";
      }
      if (!a.q09_customize_frequency) {
        errors.q09_customize_frequency = "Select how often you customize presentations.";
      }
      if (!a.q10_prep_time) {
        errors.q10_prep_time = "Select how long it typically takes to prepare one presentation.";
      }
    }
  } else if (step === 2) {
    if (!a.q11_difficulties?.length) {
      errors.q11_difficulties = "Select at least one difficulty or 'No significant difficulties'.";
    }
    if (!shouldSkipPainDetails(a)) {
      const hasChoice =
        Boolean(a.q12_biggest_bottleneck_choice) &&
        a.q12_biggest_bottleneck_choice !== "__custom__";
      const hasText = Boolean(a.q12_biggest_bottleneck_text?.trim());
      if (!hasChoice && !hasText) {
        errors.q12_biggest_bottleneck_choice =
          "Pick one problem from your selections above or describe your biggest bottleneck.";
      }
      if (!a.q13_problem_significance) {
        errors.q13_problem_significance = "Select a rating from 1 to 5.";
      }
    }
    if (!a.q15_business_impact) {
      errors.q15_business_impact = "Select one option.";
    }
  } else if (step === 3) {
    if (!a.q16_concept_usefulness) {
      errors.q16_concept_usefulness = "Select a usefulness rating from 1 to 5.";
    }
    if (!a.q17_top_capabilities?.length) {
      errors.q17_top_capabilities = "Select 1 to 3 most valuable capabilities.";
    } else if (a.q17_top_capabilities.length > 3) {
      errors.q17_top_capabilities = "Select at most 3 capabilities.";
    }
    if (!a.q18_adoption_barriers?.length) {
      errors.q18_adoption_barriers = "Select at least one potential barrier.";
    }
  } else if (step === 4) {
    if (!a.q19_willingness_to_pay) {
      errors.q19_willingness_to_pay = "Select a monthly price range or 'Not sure'.";
    }
    if (!a.q20_followup_opt_in) {
      errors.q20_followup_opt_in = "Let us know if you're open to a short follow-up.";
    }
    const wantsFollowUp =
      a.q20_followup_opt_in === "yes" || a.q20_followup_opt_in === "maybe";
    const hasContact = Boolean(draft.contactHandle.trim());
    const hasName = Boolean(draft.contactName.trim());
    if (wantsFollowUp && (hasContact || hasName)) {
      if (!hasContact) {
        errors.contactHandle =
          "Add an email or Viber/WhatsApp contact, or clear the name field.";
      }
      if (!draft.consentGiven) {
        errors.consentGiven =
          "Confirm consent under RA 10173 before sharing contact information.";
      }
    }
  }

  return errors;
}

export function SurveyWizard() {
  const router = useRouter();
  const startedAtRef = useRef<number>(Date.now());
  const [draft, setDraft] = useState<DraftState>(INITIAL_DRAFT);
  const [attemptedSteps, setAttemptedSteps] = useState<Set<number>>(new Set());
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DraftState>;
        if (parsed && typeof parsed === "object" && parsed.answers) {
          setDraft({
            answers: { ...INITIAL_DRAFT.answers, ...parsed.answers },
            contactName: parsed.contactName ?? "",
            contactHandle: parsed.contactHandle ?? "",
            consentGiven: Boolean(parsed.consentGiven),
            step:
              typeof parsed.step === "number" && parsed.step >= 0 && parsed.step <= 4
                ? parsed.step
                : 0,
          });
        }
      }
    } catch {
      // Ignore malformed storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore quota errors
    }
  }, [draft, hydrated]);

  const updateAnswer = useCallback(
    <K extends keyof SurveyAnswers>(key: K, value: SurveyAnswers[K]) => {
      setDraft((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          [key]: value,
        },
      }));
    },
    []
  );

  const q11LabelMap = useMemo(() => optionLabelMap(Q11_DIFFICULTIES_OPTIONS), []);

  const q12QuickPickOptions = useMemo(() => {
    const selected = (draft.answers.q11_difficulties ?? []).filter(
      (v) => v !== "no_difficulties" && v !== "other"
    );
    const items = selected.map((v) => ({
      value: v,
      label: q11LabelMap[v] ?? v,
    }));
    if (
      draft.answers.q11_difficulties?.includes("other") &&
      draft.answers.q11_difficulties_other?.trim()
    ) {
      items.push({
        value: "other",
        label: `Other: ${draft.answers.q11_difficulties_other.trim()}`,
      });
    }
    return items;
  }, [draft.answers.q11_difficulties, draft.answers.q11_difficulties_other, q11LabelMap]);

  useEffect(() => {
    const current = draft.answers.q12_biggest_bottleneck_choice;
    if (!current || current === "__custom__") return;
    const stillValid = q12QuickPickOptions.some((opt) => opt.value === current);
    if (!stillValid) {
      updateAnswer("q12_biggest_bottleneck_choice", "");
    }
  }, [draft.answers.q12_biggest_bottleneck_choice, q12QuickPickOptions, updateAnswer]);

  const allStepErrors = useMemo(
    () => SURVEY_STEPS.map((s) => validateStep(s.index, draft)),
    [draft]
  );

  const currentStep = draft.step;
  const currentErrors = attemptedSteps.has(currentStep) ? allStepErrors[currentStep] : {};
  const skipWorkflow = shouldSkipWorkflowDetails(draft.answers);
  const skipPain = shouldSkipPainDetails(draft.answers);
  const wantsFollowUp =
    draft.answers.q20_followup_opt_in === "yes" ||
    draft.answers.q20_followup_opt_in === "maybe";

  const scrollToStepTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const focusFirstError = (errs: StepErrors) => {
    const firstKey = Object.keys(errs)[0];
    if (!firstKey) return;
    const el = document.getElementById(firstKey);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const goToStep = (index: number) => {
    setDraft((prev) => ({ ...prev, step: index }));
    setSubmitError(null);
    scrollToStepTop();
  };

  const handleNextOrSubmit = async () => {
    setSubmitError(null);
    setAttemptedSteps((prev) => new Set(prev).add(currentStep));

    const stepErrs = allStepErrors[currentStep];
    if (Object.keys(stepErrs).length > 0) {
      focusFirstError(stepErrs);
      return;
    }

    if (currentStep < SURVEY_STEPS.length - 1) {
      goToStep(currentStep + 1);
      return;
    }

    const firstInvalidIndex = allStepErrors.findIndex(
      (errs) => Object.keys(errs).length > 0
    );
    if (firstInvalidIndex !== -1) {
      setAttemptedSteps(new Set([0, 1, 2, 3, 4]));
      goToStep(firstInvalidIndex);
      setSubmitError(
        `Please complete the required fields in Section 0${firstInvalidIndex + 1} (${SURVEY_STEPS[firstInvalidIndex].shortLabel}).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const completionSeconds = Math.max(
        1,
        Math.round((Date.now() - startedAtRef.current) / 1000)
      );
      const viewportWidth = window.innerWidth;
      const viewportCategory =
        viewportWidth < 640 ? "mobile" : viewportWidth < 1024 ? "tablet" : "desktop";

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyVersion: SURVEY_VERSION,
          completionSeconds,
          turnstileToken,
          metadata: { viewportCategory },
          answers: draft.answers,
          followUpContact: wantsFollowUp
            ? {
                name: draft.contactName.trim(),
                contact: draft.contactHandle.trim(),
                consentGiven: draft.consentGiven,
                privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
              }
            : undefined,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setSubmitError(
          payload.error ?? "Unable to submit your response. Please check your answers."
        );
        return;
      }

      try {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
      router.push("/survey/thank-you");
    } catch {
      setSubmitError(
        "Network error while submitting. Your answers are saved locally—please retry."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeMeta = SURVEY_STEPS[currentStep];
  const progressPct = Math.round(((currentStep + 1) / SURVEY_STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#18191C] lg:grid lg:grid-cols-12">
      {/* ================================================================ */}
      {/* LEFT PERSISTENT STRUCTURAL CARBON RAIL (DESKTOP)                 */}
      {/* ================================================================ */}
      <aside className="hidden lg:flex lg:col-span-4 xl:col-span-3 carbon-draft-grid text-[#F5F4F0] border-r border-[#2D3038] lg:sticky lg:top-0 lg:h-screen flex-col justify-between p-7 xl:p-8">
        <div className="space-y-8">
          {/* Study Wordmark */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight text-[#F5F4F0] hover:text-[#F47B4F] transition-colors"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              <span className="w-6 h-6 rounded-[3px] bg-[#D94E1F] text-white inline-flex items-center justify-center font-mono text-xs">
                F
              </span>
              <span>Field Study 01</span>
            </Link>
            <span className="font-mono text-[11px] text-[#9B9FA8]">{SURVEY_VERSION}</span>
          </div>

          {/* Oversized Step Readout + Signal Orange Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div
                className="text-4xl font-semibold tabular-nums tracking-tight text-[#F5F4F0]"
                style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
              >
                0{currentStep + 1}
                <span className="text-[#555963] text-2xl"> / 05</span>
              </div>
              <span className="font-mono text-xs tabular-nums text-[#F47B4F]">
                {progressPct}%
              </span>
            </div>
            <div className="h-1 w-full bg-[#2D3038] rounded-[1px] overflow-hidden">
              <div
                className="h-full bg-[#D94E1F] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Interactive Architectural Section Ledger */}
          <nav aria-label="Survey sections" className="space-y-1">
            {SURVEY_STEPS.map((s) => {
              const isActive = s.index === currentStep;
              const isPast = s.index < currentStep;
              const hasErr =
                attemptedSteps.has(s.index) &&
                Object.keys(allStepErrors[s.index]).length > 0;
              const isComplete =
                isPast && Object.keys(allStepErrors[s.index]).length === 0;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToStep(s.index)}
                  className={`w-full text-left px-3.5 py-3 rounded-[4px] border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? "bg-[#23252C] border-[#D94E1F] text-[#F5F4F0] shadow-[inset_3px_0_0_#D94E1F]"
                      : "bg-transparent border-transparent text-[#9B9FA8] hover:bg-[#23252C]/60 hover:text-[#F5F4F0]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`font-mono text-xs tabular-nums ${
                        isActive ? "text-[#F47B4F]" : "text-[#6D717C]"
                      }`}
                    >
                      0{s.index + 1}
                    </span>
                    <span className="text-sm font-medium truncate">{s.shortLabel}</span>
                  </div>
                  {hasErr ? (
                    <span
                      className="w-2 h-2 rounded-full bg-[#F87171] shrink-0"
                      title="Needs attention"
                    />
                  ) : isComplete ? (
                    <span
                      className="font-mono text-[11px] text-[#34D399] shrink-0"
                      aria-label="Completed"
                    >
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Privacy & Auto-Save Specification */}
        <div className="pt-6 border-t border-[#2D3038] space-y-2.5 text-xs text-[#9B9FA8]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
            <span>Draft auto-saved on this device</span>
          </div>
          <p className="leading-relaxed">
            Anonymous research · Zero IP logging.
          </p>
          <div>
            <PrivacyDialog
              triggerLabel="Privacy Notice (RA 10173)"
              triggerClassName="underline underline-offset-4 font-medium text-[#F5F4F0] hover:text-[#F47B4F] transition-colors cursor-pointer"
            />
          </div>
        </div>
      </aside>

      {/* ================================================================ */}
      {/* MOBILE TOP CARBON PROGRESS BAR (< lg)                            */}
      {/* ================================================================ */}
      <header className="lg:hidden sticky top-0 z-20 bg-[#18191C] text-[#F5F4F0] border-b border-[#2D3038] px-4 py-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-xs font-semibold tracking-tight text-[#F5F4F0]"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Field Study 01 · {activeMeta.shortLabel}
          </Link>
          <span className="font-mono text-xs tabular-nums text-[#F47B4F]">
            0{currentStep + 1} / 05
          </span>
        </div>
        <div
          className="grid grid-cols-5 gap-1.5"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={5}
          aria-valuenow={currentStep + 1}
        >
          {SURVEY_STEPS.map((s) => {
            const hasErr =
              attemptedSteps.has(s.index) &&
              Object.keys(allStepErrors[s.index]).length > 0;
            const barColor = hasErr
              ? "bg-[#F87171]"
              : s.index <= currentStep
                ? "bg-[#D94E1F]"
                : "bg-[#32353D]";
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goToStep(s.index)}
                aria-label={`Jump to section 0${s.index + 1}: ${s.shortLabel}`}
                className={`h-1.5 rounded-[1px] ${barColor} transition-colors cursor-pointer`}
              />
            );
          })}
        </div>
      </header>

      {/* ================================================================ */}
      {/* RIGHT OPEN PLASTER CANVAS (NO GOOGLE-FORMS BOX!)                 */}
      {/* ================================================================ */}
      <div className="lg:col-span-8 xl:col-span-9 flex flex-col min-h-[calc(100vh-76px)] lg:min-h-screen">
        <main className="flex-1 w-full max-w-3xl mx-auto px-5 sm:px-10 lg:px-14 py-8 sm:py-12 space-y-9">
          {/* Editorial Section Header */}
          <div className="space-y-2 pb-6 border-b border-[#18191C]">
            <div className="font-mono text-xs uppercase tracking-wider text-[#C44114]">
              Section 0{currentStep + 1} of 0{SURVEY_STEPS.length}
            </div>
            <h1
              className="text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-[#18191C]"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              {activeMeta.title}
            </h1>
            <p className="text-sm sm:text-base text-[#555963] max-w-[58ch]">
              {activeMeta.description}
            </p>
          </div>

          {submitError ? (
            <Banner status="error" title="Could not submit survey" collapsible={false}>
              <Text type="supporting">{submitError}</Text>
            </Banner>
          ) : null}

          {/* STEP 1: PROFESSIONAL BACKGROUND (Q1–Q4) */}
          {currentStep === 0 ? (
            <div className="space-y-9">
              <MultiSelectQuestion
                id="q01_profession"
                questionNumber={1}
                prompt="Which best describes your profession or business?"
                helper="Select all that apply."
                options={Q01_PROFESSION_OPTIONS}
                values={draft.answers.q01_profession ?? []}
                onChange={(val) => updateAnswer("q01_profession", val)}
                otherText={draft.answers.q01_profession_other}
                onOtherTextChange={(val) => updateAnswer("q01_profession_other", val)}
                columns={2}
                error={currentErrors.q01_profession}
              />

              <Divider />

              <SingleSelectQuestion
                id="q02_work_setup"
                questionNumber={2}
                prompt="How do you currently work?"
                options={Q02_WORK_SETUP_OPTIONS}
                value={draft.answers.q02_work_setup}
                onChange={(val) => updateAnswer("q02_work_setup", val)}
                error={currentErrors.q02_work_setup}
              />

              <Divider />

              <MultiSelectQuestion
                id="q03_client_acquisition"
                questionNumber={3}
                prompt="How do you typically acquire new clients?"
                helper="Select all that apply."
                options={Q03_ACQUISITION_OPTIONS}
                values={draft.answers.q03_client_acquisition ?? []}
                onChange={(val) => updateAnswer("q03_client_acquisition", val)}
                otherText={draft.answers.q03_client_acquisition_other}
                onOtherTextChange={(val) =>
                  updateAnswer("q03_client_acquisition_other", val)
                }
                columns={2}
                error={currentErrors.q03_client_acquisition}
              />

              <Divider />

              <SingleSelectQuestion
                id="q04_monthly_pitches"
                questionNumber={4}
                prompt="Approximately how many prospective clients do you pitch to per month?"
                options={Q04_PITCH_FREQ_OPTIONS}
                value={draft.answers.q04_monthly_pitches}
                onChange={(val) => updateAnswer("q04_monthly_pitches", val)}
                layout="grid-compact"
                error={currentErrors.q04_monthly_pitches}
              />
            </div>
          ) : null}

          {/* STEP 2: CURRENT PRESENTATION WORKFLOW (Q5–Q10) */}
          {currentStep === 1 ? (
            <div className="space-y-9">
              <SingleSelectQuestion
                id="q05_last_presented"
                questionNumber={5}
                prompt="When was the last time you presented your work or services to a prospective client?"
                options={Q05_LAST_PRESENTED_OPTIONS}
                value={draft.answers.q05_last_presented}
                onChange={(val) => updateAnswer("q05_last_presented", val)}
                error={currentErrors.q05_last_presented}
              />

              {skipWorkflow ? (
                <div className="rounded-[4px] border border-[#18191C] bg-[#FFFFFF] p-4 border-l-4 border-l-[#D94E1F] text-sm text-[#18191C]">
                  <strong>Questions Q06–Q10 skipped automatically.</strong> Since you pitch 0
                  prospective clients per month and have not presented yet, continue directly
                  to Pain Points.
                </div>
              ) : (
                <>
                  <Divider />

                  <MultiSelectQuestion
                    id="q06_materials_shown"
                    questionNumber={6}
                    prompt="What do you normally show prospective clients?"
                    helper="Select all that apply."
                    options={Q06_MATERIALS_OPTIONS}
                    values={draft.answers.q06_materials_shown ?? []}
                    onChange={(val) => updateAnswer("q06_materials_shown", val)}
                    otherText={draft.answers.q06_materials_shown_other}
                    onOtherTextChange={(val) =>
                      updateAnswer("q06_materials_shown_other", val)
                    }
                    columns={2}
                    error={currentErrors.q06_materials_shown}
                  />

                  <Divider />

                  <MultiSelectQuestion
                    id="q07_tools_used"
                    questionNumber={7}
                    prompt="Which tools do you use to prepare client presentations?"
                    helper="Select all that apply."
                    options={Q07_TOOLS_OPTIONS}
                    values={draft.answers.q07_tools_used ?? []}
                    onChange={(val) => updateAnswer("q07_tools_used", val)}
                    otherText={draft.answers.q07_tools_used_other}
                    onOtherTextChange={(val) => updateAnswer("q07_tools_used_other", val)}
                    columns={2}
                    error={currentErrors.q07_tools_used}
                  />

                  <Divider />

                  <MultiSelectQuestion
                    id="q08_delivery_methods"
                    questionNumber={8}
                    prompt="How do you typically deliver presentations?"
                    helper="Select all that apply."
                    options={Q08_DELIVERY_OPTIONS}
                    values={draft.answers.q08_delivery_methods ?? []}
                    onChange={(val) => updateAnswer("q08_delivery_methods", val)}
                    otherText={draft.answers.q08_delivery_methods_other}
                    onOtherTextChange={(val) =>
                      updateAnswer("q08_delivery_methods_other", val)
                    }
                    columns={2}
                    error={currentErrors.q08_delivery_methods}
                  />

                  <Divider />

                  <SingleSelectQuestion
                    id="q09_customize_frequency"
                    questionNumber={9}
                    prompt="Do you customize your presentations for individual clients?"
                    options={Q09_CUSTOMIZE_OPTIONS}
                    value={draft.answers.q09_customize_frequency}
                    onChange={(val) => updateAnswer("q09_customize_frequency", val)}
                    layout="grid-compact"
                    error={currentErrors.q09_customize_frequency}
                  />

                  <Divider />

                  <SingleSelectQuestion
                    id="q10_prep_time"
                    questionNumber={10}
                    prompt="How long does it typically take to prepare or customize one client presentation?"
                    options={Q10_PREP_TIME_OPTIONS}
                    value={draft.answers.q10_prep_time}
                    onChange={(val) => updateAnswer("q10_prep_time", val)}
                    layout="grid-2"
                    error={currentErrors.q10_prep_time}
                  />
                </>
              )}
            </div>
          ) : null}

          {/* STEP 3: PAIN POINTS & BUSINESS IMPACT (Q11–Q15) */}
          {currentStep === 2 ? (
            <div className="space-y-9">
              <MultiSelectQuestion
                id="q11_difficulties"
                questionNumber={11}
                prompt="Which difficulties have you experienced when preparing or presenting to clients?"
                helper="Select all that apply."
                options={Q11_DIFFICULTIES_OPTIONS}
                values={draft.answers.q11_difficulties ?? []}
                onChange={(val) => updateAnswer("q11_difficulties", val)}
                otherText={draft.answers.q11_difficulties_other}
                onOtherTextChange={(val) => updateAnswer("q11_difficulties_other", val)}
                columns={2}
                error={currentErrors.q11_difficulties}
              />

              {skipPain ? (
                <div className="rounded-[4px] border border-[#18191C] bg-[#FFFFFF] p-4 border-l-4 border-l-[#D94E1F] text-sm text-[#18191C]">
                  <strong>Questions Q12–Q14 skipped.</strong> Since you reported no
                  significant difficulties, please answer Q15 below.
                </div>
              ) : (
                <>
                  <Divider />

                  {/* Q12: Dynamic quick-pick populated from Q11 */}
                  <fieldset id="q12_biggest_bottleneck_choice" className="space-y-3.5">
                    <div className="space-y-1.5">
                      <span className="font-mono text-[11px] font-medium tracking-wider text-[#C44114]">
                        Q12
                      </span>
                      <legend
                        className="text-lg font-semibold leading-snug text-[#18191C]"
                        style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                      >
                        Which ONE of these problems costs you the most time or effort?
                      </legend>
                      <p className="text-xs text-[#555963]">
                        {q12QuickPickOptions.length > 0
                          ? "Populated from your Q11 selections above, or describe another bottleneck."
                          : "Check difficulties in Q11 above for quick-pick choices, or describe below."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {q12QuickPickOptions.map((opt) => {
                        const checked =
                          draft.answers.q12_biggest_bottleneck_choice === opt.value;
                        return (
                          <label
                            key={opt.value}
                            data-selected={checked}
                            className="folio-option-tile flex items-center gap-3 px-4 py-3 min-h-[48px] cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="q12_biggest_bottleneck_choice"
                              value={opt.value}
                              checked={checked}
                              onChange={() =>
                                updateAnswer("q12_biggest_bottleneck_choice", opt.value)
                              }
                              className="sr-only"
                            />
                            <span
                              aria-hidden="true"
                              className={`w-4 h-4 shrink-0 rounded-full border flex items-center justify-center ${
                                checked ? "border-[#D94E1F]" : "border-[#A8A49B]"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full transition-transform ${
                                  checked ? "bg-[#D94E1F] scale-100" : "scale-0"
                                }`}
                              />
                            </span>
                            <span className="text-[15px] leading-snug text-[#18191C]">
                              {opt.label}
                            </span>
                          </label>
                        );
                      })}

                      <label
                        data-selected={
                          draft.answers.q12_biggest_bottleneck_choice === "__custom__" ||
                          q12QuickPickOptions.length === 0
                        }
                        className="folio-option-tile flex items-center gap-3 px-4 py-3 min-h-[48px] cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="q12_biggest_bottleneck_choice"
                          value="__custom__"
                          checked={
                            draft.answers.q12_biggest_bottleneck_choice === "__custom__" ||
                            q12QuickPickOptions.length === 0
                          }
                          onChange={() =>
                            updateAnswer("q12_biggest_bottleneck_choice", "__custom__")
                          }
                          className="sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={`w-4 h-4 shrink-0 rounded-full border flex items-center justify-center ${
                            draft.answers.q12_biggest_bottleneck_choice === "__custom__" ||
                            q12QuickPickOptions.length === 0
                              ? "border-[#D94E1F]"
                              : "border-[#A8A49B]"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full transition-transform ${
                              draft.answers.q12_biggest_bottleneck_choice === "__custom__" ||
                              q12QuickPickOptions.length === 0
                                ? "bg-[#D94E1F] scale-100"
                                : "scale-0"
                            }`}
                          />
                        </span>
                        <span className="text-[15px] leading-snug text-[#18191C]">
                          Describe in your own words
                        </span>
                      </label>
                    </div>

                    {draft.answers.q12_biggest_bottleneck_choice === "__custom__" ||
                    q12QuickPickOptions.length === 0 ? (
                      <textarea
                        rows={3}
                        maxLength={1000}
                        value={draft.answers.q12_biggest_bottleneck_text ?? ""}
                        onChange={(e) =>
                          updateAnswer("q12_biggest_bottleneck_text", e.target.value)
                        }
                        placeholder="Describe the presentation problem that costs you the most time or effort"
                        className="w-full rounded-[4px] border border-[#18191C] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#18191C] focus:border-[#D94E1F] focus:outline-none focus:ring-2 focus:ring-[#D94E1F]/20"
                      />
                    ) : null}

                    {currentErrors.q12_biggest_bottleneck_choice ? (
                      <p role="alert" className="text-xs font-medium text-[#B91C1C]">
                        {currentErrors.q12_biggest_bottleneck_choice}
                      </p>
                    ) : null}
                  </fieldset>

                  <Divider />

                  <LikertQuestion
                    id="q13_problem_significance"
                    questionNumber={13}
                    prompt="How significant is this problem to your business?"
                    lowLabel="Not significant"
                    highLabel="Extremely significant"
                    value={draft.answers.q13_problem_significance}
                    onChange={(val) => updateAnswer("q13_problem_significance", val)}
                    error={currentErrors.q13_problem_significance}
                  />

                  <Divider />

                  <div id="q14_current_workaround" className="space-y-2">
                    <span className="font-mono text-[11px] font-medium tracking-wider text-[#C44114]">
                      Q14
                    </span>
                    <label
                      htmlFor="q14-textarea"
                      className="block text-lg font-semibold leading-snug text-[#18191C]"
                      style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                    >
                      What do you currently do to work around this problem?
                    </label>
                    <p className="text-xs text-[#555963]">Optional, but very helpful.</p>
                    <textarea
                      id="q14-textarea"
                      rows={3}
                      maxLength={1000}
                      value={draft.answers.q14_current_workaround ?? ""}
                      onChange={(e) => updateAnswer("q14_current_workaround", e.target.value)}
                      placeholder="e.g., Duplicate an old Canva/InDesign file and swap project photos manually"
                      className="w-full rounded-[4px] border border-[#A8A49B] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#18191C] focus:border-[#18191C] focus:outline-none focus:ring-2 focus:ring-[#D94E1F]/20"
                    />
                  </div>
                </>
              )}

              <Divider />

              <SingleSelectQuestion
                id="q15_business_impact"
                questionNumber={15}
                prompt="Have presentation-related difficulties ever caused you to miss a deadline, delay a proposal, or lose a potential client?"
                options={Q15_IMPACT_OPTIONS}
                value={draft.answers.q15_business_impact}
                onChange={(val) => updateAnswer("q15_business_impact", val)}
                layout="grid-2"
                error={currentErrors.q15_business_impact}
              />
            </div>
          ) : null}

          {/* STEP 4: SOLUTION VALIDATION (Q16–Q18) */}
          {currentStep === 3 ? (
            <div className="space-y-9">
              <LikertQuestion
                id="q16_concept_usefulness"
                questionNumber={16}
                prompt="Imagine a tool where you upload previous projects once, then select relevant projects to automatically assemble branded, client-specific presentations. How useful would this be for your work?"
                lowLabel="Not useful"
                highLabel="Extremely useful"
                value={draft.answers.q16_concept_usefulness}
                onChange={(val) => updateAnswer("q16_concept_usefulness", val)}
                error={currentErrors.q16_concept_usefulness}
              />

              <Divider />

              <MultiSelectQuestion
                id="q17_top_capabilities"
                questionNumber={17}
                prompt="Which capabilities would be most valuable?"
                helper="Select up to three."
                options={Q17_CAPABILITIES_OPTIONS}
                values={draft.answers.q17_top_capabilities ?? []}
                onChange={(val) => updateAnswer("q17_top_capabilities", val)}
                maxSelections={3}
                columns={2}
                error={currentErrors.q17_top_capabilities}
              />

              <Divider />

              <MultiSelectQuestion
                id="q18_adoption_barriers"
                questionNumber={18}
                prompt="What would prevent you from using a tool like this?"
                helper="Select all that apply."
                options={Q18_BARRIERS_OPTIONS}
                values={draft.answers.q18_adoption_barriers ?? []}
                onChange={(val) => updateAnswer("q18_adoption_barriers", val)}
                otherText={draft.answers.q18_adoption_barriers_other}
                onOtherTextChange={(val) =>
                  updateAnswer("q18_adoption_barriers_other", val)
                }
                columns={2}
                error={currentErrors.q18_adoption_barriers}
              />
            </div>
          ) : null}

          {/* STEP 5: PRICING (₱) & FOLLOW-UP (Q19–Q20) */}
          {currentStep === 4 ? (
            <div className="space-y-9">
              <SingleSelectQuestion
                id="q19_willingness_to_pay"
                questionNumber={19}
                prompt="If this tool solved your biggest presentation-related problem, what monthly price would you realistically consider paying?"
                options={Q19_WTP_OPTIONS}
                value={draft.answers.q19_willingness_to_pay}
                onChange={(val) => updateAnswer("q19_willingness_to_pay", val)}
                layout="grid-2"
                error={currentErrors.q19_willingness_to_pay}
              />

              <Divider />

              <SingleSelectQuestion
                id="q20_followup_opt_in"
                questionNumber={20}
                prompt="Would you be open to a short follow-up interview or early product test?"
                options={Q20_FOLLOWUP_OPTIONS}
                value={draft.answers.q20_followup_opt_in}
                onChange={(val) => updateAnswer("q20_followup_opt_in", val)}
                layout="grid-compact"
                error={currentErrors.q20_followup_opt_in}
              />

              {wantsFollowUp ? (
                <div className="rounded-[4px] border border-[#18191C] bg-[#FFFFFF] p-5 sm:p-6 space-y-4">
                  <div className="space-y-1">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#C44114]">
                      Optional · Separated Table (RA 10173)
                    </span>
                    <p className="text-sm font-semibold text-[#18191C]">
                      Follow-up contact information
                    </p>
                    <p className="text-xs text-[#555963]">
                      Stored separately with no link to your survey responses. Leave blank to
                      remain completely anonymous.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-medium text-[#555963]"
                      >
                        Name (optional)
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        maxLength={160}
                        value={draft.contactName}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, contactName: e.target.value }))
                        }
                        placeholder="e.g., Ar. Paolo Reyes"
                        className="w-full rounded-[4px] border border-[#A8A49B] bg-[#F5F4F0] px-3 py-2 text-sm text-[#18191C] focus:border-[#18191C] focus:bg-[#FFFFFF] focus:outline-none"
                      />
                    </div>

                    <div id="contactHandle" className="space-y-1">
                      <label
                        htmlFor="contact-handle"
                        className="block text-xs font-medium text-[#555963]"
                      >
                        Email or Viber / WhatsApp
                      </label>
                      <input
                        id="contact-handle"
                        type="text"
                        maxLength={255}
                        value={draft.contactHandle}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, contactHandle: e.target.value }))
                        }
                        placeholder="Email, Viber, or WhatsApp"
                        className="w-full rounded-[4px] border border-[#A8A49B] bg-[#F5F4F0] px-3 py-2 text-sm text-[#18191C] focus:border-[#18191C] focus:bg-[#FFFFFF] focus:outline-none"
                      />
                      {currentErrors.contactHandle ? (
                        <p role="alert" className="text-xs font-medium text-[#B91C1C]">
                          {currentErrors.contactHandle}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div id="consentGiven" className="pt-1">
                    <CheckboxInput
                      label="I consent to my contact details being used solely for a follow-up interview or early product test under the Privacy Notice (RA 10173)."
                      value={draft.consentGiven}
                      onChange={(checked) =>
                        setDraft((prev) => ({ ...prev, consentGiven: checked }))
                      }
                      status={
                        currentErrors.consentGiven
                          ? { type: "error", message: currentErrors.consentGiven }
                          : undefined
                      }
                    />
                  </div>
                </div>
              ) : null}

              <Divider />

              <TurnstileWidget onTokenChange={setTurnstileToken} />
            </div>
          ) : null}

          {/* Mobile Privacy Footer */}
          <div className="lg:hidden pt-4 border-t border-[#D9D6CE] flex items-center justify-between text-xs text-[#555963]">
            <span>No IP tracking · Draft saved</span>
            <PrivacyDialog />
          </div>
        </main>

        {/* Sticky Bottom Swiss Action Bar */}
        <footer className="sticky bottom-0 z-10 border-t border-[#D9D6CE] bg-[#F5F4F0]/95 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-5 sm:px-10 lg:px-14 py-3.5 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentStep === 0 || isSubmitting}
              onClick={() => goToStep(Math.max(0, currentStep - 1))}
              className="rounded-[4px] border border-[#18191C] bg-[#FFFFFF] px-4 py-2.5 text-sm font-medium text-[#18191C] hover:bg-[#18191C] hover:text-[#F5F4F0] transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
            >
              Back
            </button>

            <span className="hidden sm:inline font-mono text-xs tabular-nums text-[#555963]">
              SECTION 0{currentStep + 1} / 0{SURVEY_STEPS.length}
            </span>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleNextOrSubmit}
              className="rounded-[4px] bg-[#C44114] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#18191C] transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSubmitting
                ? "Submitting..."
                : currentStep === SURVEY_STEPS.length - 1
                  ? "Submit responses"
                  : "Continue"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
