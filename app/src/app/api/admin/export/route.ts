import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { buildContactsCsv, buildResponsesCsv } from "@/lib/csv";
import { getPrisma } from "@/lib/db";
import { getDevDemoStore, isDevDemoFallbackAllowed } from "@/lib/dev-demo-store";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") === "contacts" ? "contacts" : "responses";
  const version = searchParams.get("version");
  const dateStamp = new Date().toISOString().slice(0, 10);

  try {
    const prisma = getPrisma();

    if (type === "contacts") {
      const contacts = await prisma.followUpContact.findMany({
        where: version && version !== "all" ? { surveyVersion: version } : undefined,
        orderBy: { createdAt: "desc" },
      });
      const csv = buildContactsCsv(contacts);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="follow_up_contacts_${dateStamp}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const responses = await prisma.surveyResponse.findMany({
      where: version && version !== "all" ? { surveyVersion: version } : undefined,
      orderBy: { submittedAt: "desc" },
    });
    const csv = buildResponsesCsv(responses);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="survey_responses_${dateStamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (isDevDemoFallbackAllowed()) {
      const store = getDevDemoStore();
      if (type === "contacts") {
        const contacts = store.contacts.filter(
          (c) => !version || version === "all" || c.surveyVersion === version
        );
        return new NextResponse(buildContactsCsv(contacts), {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="follow_up_contacts_demo_${dateStamp}.csv"`,
            "Cache-Control": "no-store",
          },
        });
      }
      const responses = store.responses.filter(
        (r) => !version || version === "all" || r.surveyVersion === version
      );
      return new NextResponse(buildResponsesCsv(responses), {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="survey_responses_demo_${dateStamp}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    console.error("Failed to export CSV:", err);
    return NextResponse.json({ error: "Failed to generate CSV export." }, { status: 500 });
  }
}
