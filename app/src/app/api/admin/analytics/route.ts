import { NextResponse } from "next/server";
import { computeAnalytics } from "@/lib/analytics";
import { getAdminSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { getDevDemoStore, isDevDemoFallbackAllowed } from "@/lib/dev-demo-store";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const version = searchParams.get("version") ?? "all";
  const profession = searchParams.get("profession") ?? "all";
  const workSetup = searchParams.get("workSetup") ?? "all";

  try {
    const prisma = getPrisma();
    const [responses, contacts] = await Promise.all([
      prisma.surveyResponse.findMany({
        orderBy: { submittedAt: "desc" },
        select: {
          id: true,
          surveyVersion: true,
          submittedAt: true,
          completionSeconds: true,
          answers: true,
        },
      }),
      prisma.followUpContact.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          surveyVersion: true,
          availability: true,
          name: true,
          contact: true,
          consentGiven: true,
          consentTimestamp: true,
          privacyNoticeVersion: true,
          createdAt: true,
        },
      }),
    ]);

    const summary = computeAnalytics(responses, { version, profession, workSetup });

    return NextResponse.json(
      {
        demoMode: false,
        summary,
        contactsCount: contacts.length,
        contacts,
      },
      { status: 200 }
    );
  } catch (err) {
    if (isDevDemoFallbackAllowed()) {
      const store = getDevDemoStore();
      const summary = computeAnalytics(store.responses, { version, profession, workSetup });
      return NextResponse.json(
        {
          demoMode: true,
          summary,
          contactsCount: store.contacts.length,
          contacts: store.contacts,
        },
        { status: 200 }
      );
    }

    console.error("Failed to load admin analytics:", err);
    return NextResponse.json({ error: "Failed to load analytics data." }, { status: 500 });
  }
}
