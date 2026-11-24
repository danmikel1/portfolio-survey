import { z } from "zod";
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
  SURVEY_VERSION,
  type SurveyOption,
} from "./survey-config";

function enumFromOptions(options: SurveyOption[]) {
  const values = options.map((o) => o.value) as [string, ...string[]];
  return z.enum(values);
}

const optionalOtherText = z.string().trim().max(200).optional().default("");

export const surveyAnswersSchema = z.object({
  // Section 1: Professional Background
  q01_profession: z.array(enumFromOptions(Q01_PROFESSION_OPTIONS)).min(1, "Select at least one profession."),
  q01_profession_other: optionalOtherText,
  q02_work_setup: enumFromOptions(Q02_WORK_SETUP_OPTIONS),
  q03_client_acquisition: z.array(enumFromOptions(Q03_ACQUISITION_OPTIONS)).min(1, "Select at least one client acquisition channel."),
  q03_client_acquisition_other: optionalOtherText,
  q04_monthly_pitches: enumFromOptions(Q04_PITCH_FREQ_OPTIONS),

  // Section 2: Current Presentation Workflow (Q6-Q10 conditionally skipped when q04=0 & q05=never)
  q05_last_presented: enumFromOptions(Q05_LAST_PRESENTED_OPTIONS),
  q06_materials_shown: z.array(enumFromOptions(Q06_MATERIALS_OPTIONS)).default([]),
  q06_materials_shown_other: optionalOtherText,
  q07_tools_used: z.array(enumFromOptions(Q07_TOOLS_OPTIONS)).default([]),
  q07_tools_used_other: optionalOtherText,
  q08_delivery_methods: z.array(enumFromOptions(Q08_DELIVERY_OPTIONS)).default([]),
  q08_delivery_methods_other: optionalOtherText,
  q09_customize_frequency: enumFromOptions(Q09_CUSTOMIZE_OPTIONS).optional(),
  q10_prep_time: enumFromOptions(Q10_PREP_TIME_OPTIONS).optional(),

  // Section 3: Pain Points & Business Impact (Q12-Q14 conditionally skipped when q11=no_difficulties)
  q11_difficulties: z.array(enumFromOptions(Q11_DIFFICULTIES_OPTIONS)).min(1, "Select at least one option."),
  q11_difficulties_other: optionalOtherText,
  q12_biggest_bottleneck_choice: z.string().trim().max(120).optional().default(""),
  q12_biggest_bottleneck_text: z.string().trim().max(1000).optional().default(""),
  q13_problem_significance: z.number().int().min(1).max(5).optional(),
  q14_current_workaround: z.string().trim().max(1000).optional().default(""),
  q15_business_impact: enumFromOptions(Q15_IMPACT_OPTIONS),

  // Section 4: Solution Validation
  q16_concept_usefulness: z.number().int().min(1).max(5),
  q17_top_capabilities: z
    .array(enumFromOptions(Q17_CAPABILITIES_OPTIONS))
    .min(1, "Select at least one capability.")
    .max(3, "Select up to three capabilities."),
  q18_adoption_barriers: z.array(enumFromOptions(Q18_BARRIERS_OPTIONS)).min(1, "Select at least one option."),
  q18_adoption_barriers_other: optionalOtherText,

  // Section 5: Pricing & Follow-up
  q19_willingness_to_pay: enumFromOptions(Q19_WTP_OPTIONS),
  q20_followup_opt_in: enumFromOptions(Q20_FOLLOWUP_OPTIONS),
});

export type SurveyAnswers = z.infer<typeof surveyAnswersSchema>;

export function shouldSkipWorkflowDetails(answers: Partial<SurveyAnswers>): boolean {
  return answers.q04_monthly_pitches === "0" && answers.q05_last_presented === "never";
}

export function shouldSkipPainDetails(answers: Partial<SurveyAnswers>): boolean {
  return Boolean(answers.q11_difficulties?.includes("no_difficulties"));
}

export const followUpContactSchema = z.object({
  name: z.string().trim().max(160).optional().default(""),
  contact: z.string().trim().max(255).optional().default(""),
  consentGiven: z.boolean().default(false),
  privacyNoticeVersion: z.string().trim().max(32).default(PRIVACY_NOTICE_VERSION),
});

export const surveySubmissionPayloadSchema = z
  .object({
    surveyVersion: z.string().trim().max(32).default(SURVEY_VERSION),
    completionSeconds: z.number().int().min(1).max(7200).optional(),
    turnstileToken: z.string().max(2048).optional().default(""),
    metadata: z
      .object({
        viewportCategory: z.enum(["mobile", "tablet", "desktop"]).optional(),
      })
      .optional(),
    answers: surveyAnswersSchema,
    followUpContact: followUpContactSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const { answers, followUpContact } = data;

    // Workflow conditional requirements
    if (!shouldSkipWorkflowDetails(answers)) {
      if (answers.q06_materials_shown.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["answers", "q06_materials_shown"],
          message: "Select at least one material you show prospective clients.",
        });
      }
      if (answers.q07_tools_used.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["answers", "q07_tools_used"],
          message: "Select at least one tool or choose 'I don't use dedicated tools'.",
        });
      }
      if (answers.q08_delivery_methods.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["answers", "q08_delivery_methods"],
          message: "Select at least one delivery method.",
        });
      }
      if (!answers.q09_customize_frequency) {
        ctx.addIssue({
          code: "custom",
          path: ["answers", "q09_customize_frequency"],
          message: "Indicate how often you customize presentations.",
        });
      }
      if (!answers.q10_prep_time) {
        ctx.addIssue({
          code: "custom",
          path: ["answers", "q10_prep_time"],
          message: "Select typical presentation preparation time.",
        });
      }
    }

    // Pain-point conditional requirements
    if (!shouldSkipPainDetails(answers)) {
      const hasChoice =
        Boolean(answers.q12_biggest_bottleneck_choice) &&
        answers.q12_biggest_bottleneck_choice !== "__custom__";
      const hasCustomText = Boolean(answers.q12_biggest_bottleneck_text?.trim());
      if (!hasChoice && !hasCustomText) {
        ctx.addIssue({
          code: "custom",
          path: ["answers", "q12_biggest_bottleneck_choice"],
          message: "Choose or describe the single problem that costs you the most time.",
        });
      }
      if (!answers.q13_problem_significance) {
        ctx.addIssue({
          code: "custom",
          path: ["answers", "q13_problem_significance"],
          message: "Rate how significant this problem is to your business (1–5).",
        });
      }
    }

    // RA 10173 follow-up contact consent enforcement
    const wantsFollowUp =
      answers.q20_followup_opt_in === "yes" || answers.q20_followup_opt_in === "maybe";
    const providedContact = Boolean(followUpContact?.contact?.trim());
    const providedName = Boolean(followUpContact?.name?.trim());

    if (wantsFollowUp && (providedContact || providedName)) {
      if (!providedContact) {
        ctx.addIssue({
          code: "custom",
          path: ["followUpContact", "contact"],
          message: "Provide an email or preferred contact handle, or clear the name field.",
        });
      }
      if (!followUpContact?.consentGiven) {
        ctx.addIssue({
          code: "custom",
          path: ["followUpContact", "consentGiven"],
          message:
            "Explicit consent is required under RA 10173 before we can store your contact details.",
        });
      }
    }
  });

export type SurveySubmissionPayload = z.infer<typeof surveySubmissionPayloadSchema>;
