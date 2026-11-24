import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { getDevDemoStore, isDevDemoFallbackAllowed } from "@/lib/dev-demo-store";
import { checkRateLimit, getTransientClientKey } from "@/lib/rate-limit";
import { PRIVACY_NOTICE_VERSION, SURVEY_VERSION } from "@/lib/survey-config";
import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  shouldSkipPainDetails,
  shouldSkipWorkflowDetails,
  surveySubmissionPayloadSchema,
} from "@/lib/validation";

export async function POST(request: Request) {
  // 1. Privacy-preserving rate limit (10 submissions per 15 min per ephemeral salted source)
  const rate = checkRateLimit(getTransientClientKey(request), {
    namespace: "survey_submit",
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many submissions in a short period. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      }
    );
  }

  // 2. Parse JSON body safely
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  // 3. Server-side Zod validation
  const parsed = surveySubmissionPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please review your answers and fix the highlighted fields.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  // 4. Cloudflare Turnstile verification
  const turnstile = await verifyTurnstileToken(parsed.data.turnstileToken);
  if (!turnstile.ok) {
    return NextResponse.json(
      { error: "Bot verification failed. Please complete the security check and try again." },
      { status: 403 }
    );
  }

  const { answers, followUpContact, completionSeconds, metadata } = parsed.data;
  const surveyVersion = parsed.data.surveyVersion || SURVEY_VERSION;

  // Normalize conditionally skipped fields so JSONB remains clean and unambiguous
  const normalizedAnswers = {
    ...answers,
    ...(shouldSkipWorkflowDetails(answers)
      ? {
          q06_materials_shown: [],
          q06_materials_shown_other: "",
          q07_tools_used: [],
          q07_tools_used_other: "",
          q08_delivery_methods: [],
          q08_delivery_methods_other: "",
          q09_customize_frequency: undefined,
          q10_prep_time: undefined,
          workflow_skipped: true,
        }
      : { workflow_skipped: false }),
    ...(shouldSkipPainDetails(answers)
      ? {
          q12_biggest_bottleneck_choice: "",
          q12_biggest_bottleneck_text: "",
          q13_problem_significance: undefined,
          q14_current_workaround: "",
          pain_details_skipped: true,
        }
      : { pain_details_skipped: false }),
  };

  const wantsFollowUp =
    (answers.q20_followup_opt_in === "yes" || answers.q20_followup_opt_in === "maybe") &&
    Boolean(followUpContact?.contact?.trim()) &&
    followUpContact?.consentGiven === true;

  try {
    const prisma = getPrisma();

    // Write anonymous survey response and (if consented) strictly unlinked contact record
    await prisma.$transaction(async (tx) => {
      await tx.surveyResponse.create({
        data: {
          surveyVersion,
          completionSeconds: completionSeconds ?? null,
          answers: normalizedAnswers,
          metadata: metadata ?? undefined,
        },
      });

      if (wantsFollowUp && followUpContact) {
        await tx.followUpContact.create({
          data: {
            surveyVersion,
            availability: answers.q20_followup_opt_in,
            name: followUpContact.name?.trim() || null,
            contact: followUpContact.contact.trim(),
            consentGiven: true,
            consentTimestamp: new Date(),
            privacyNoticeVersion: followUpContact.privacyNoticeVersion || PRIVACY_NOTICE_VERSION,
          },
        });
      }
    });

    return NextResponse.json(
      { ok: true, surveyVersion },
      { status: 201 }
    );
  } catch (err) {
    if (isDevDemoFallbackAllowed()) {
      const store = getDevDemoStore();
      const now = new Date();
      store.responses.unshift({
        id: `demo_live_${Date.now()}`,
        surveyVersion,
        submittedAt: now,
        completionSeconds: completionSeconds ?? null,
        answers: normalizedAnswers,
      });

      if (wantsFollowUp && followUpContact) {
        store.contacts.unshift({
          id: `demo_contact_live_${Date.now()}`,
          surveyVersion,
          availability: answers.q20_followup_opt_in,
          name: followUpContact.name?.trim() || null,
          contact: followUpContact.contact.trim(),
          consentGiven: true,
          consentTimestamp: now,
          privacyNoticeVersion: followUpContact.privacyNoticeVersion || PRIVACY_NOTICE_VERSION,
          createdAt: now,
        });
      }

      return NextResponse.json(
        { ok: true, surveyVersion, demoMode: true },
        { status: 201 }
      );
    }

    console.error("Failed to save survey submission:", err);
    return NextResponse.json(
      { error: "Unable to record your response right now. Please try again shortly." },
      { status: 500 }
    );
  }
}
