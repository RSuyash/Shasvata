import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const leadSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  companyName: z.string().min(1),
  companyType: z.string(),
  websiteUrl: z.string().optional(),
  serviceInterest: z.array(z.string()).min(1),
  budgetRange: z.string(),
  timeline: z.string(),
  problemSummary: z.string().min(10),
  consent: z.literal(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown;
    const data = leadSchema.parse(body);

    const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    const response = await fetch(`${apiUrl}/api/lead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Source-Page": req.headers.get("referer") ?? "/contact",
        "X-Forwarded-For": req.headers.get("x-forwarded-for") ?? "",
      },
      body: JSON.stringify({
        ...data,
        sourcePage: req.headers.get("referer") ?? "/contact",
        sourceCta: "contact_form",
        utmSource: req.nextUrl.searchParams.get("utm_source") ?? undefined,
        utmMedium: req.nextUrl.searchParams.get("utm_medium") ?? undefined,
        utmCampaign: req.nextUrl.searchParams.get("utm_campaign") ?? undefined,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("API error:", errText);
      return NextResponse.json({ error: "Submission failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid form data", issues: err.issues }, { status: 400 });
    }
    console.error("Lead route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
