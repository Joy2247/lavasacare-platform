import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { makeRef, ensureSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";

const phoneRe = /^\+?[\d][\d\s-]{7,15}$/;
const dateRe = /^\d{4}-\d{2}-\d{2}$/;

const createSchema = z.object({
  packageId: z.string().trim().min(1),
  packageName: z.string().trim().min(2),
  providerId: z.string().trim().min(1),
  providerName: z.string().trim().min(2),
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(phoneRe, "Enter a valid phone number"),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  preferredDate: z.string().regex(dateRe).optional().or(z.literal("")),
  message: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function GET() {
  try {
    await ensureSeed();
    const requests = await db.packageEnquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ requests });
  } catch (e) {
    console.error("GET /api/enquiries", e);
    return NextResponse.json({ error: "Could not load enquiries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid details";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const d = parsed.data;
    const request = await db.packageEnquiry.create({
      data: {
        ref: makeRef("PK"),
        packageId: d.packageId,
        packageName: d.packageName,
        providerId: d.providerId,
        providerName: d.providerName,
        fullName: d.fullName,
        phone: d.phone,
        email: d.email || null,
        preferredDate: d.preferredDate || null,
        message: d.message || null,
        status: "Submitted",
      },
    });
    return NextResponse.json({ request }, { status: 201 });
  } catch (e) {
    console.error("POST /api/enquiries", e);
    return NextResponse.json({ error: "Could not submit enquiry" }, { status: 500 });
  }
}
