import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { makeRef, ensureSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";

const phoneRe = /^\+?[\d][\d\s-]{7,15}$/;
const dateRe = /^\d{4}-\d{2}-\d{2}$/;

const createSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(phoneRe, "Enter a valid phone number"),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  specialty: z.string().trim().min(2).max(60),
  providerId: z.string().trim().min(1),
  providerName: z.string().trim().min(2),
  doctorId: z.string().trim().optional().or(z.literal("")),
  doctorName: z.string().trim().optional().or(z.literal("")),
  preferredDate: z.string().regex(dateRe, "Use date picker"),
  preferredTime: z.string().trim().min(3).max(20),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function GET() {
  try {
    await ensureSeed();
    const requests = await db.appointmentRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ requests });
  } catch (e) {
    console.error("GET /api/appointments", e);
    return NextResponse.json({ error: "Could not load requests" }, { status: 500 });
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

    // FR-05: prevent past dates (server-side, mirrors client validation)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(`${d.preferredDate}T00:00:00`);
    if (Number.isNaN(chosen.getTime()) || chosen < today) {
      return NextResponse.json(
        { error: "Appointment date cannot be in the past" },
        { status: 400 }
      );
    }

    const request = await db.appointmentRequest.create({
      data: {
        ref: makeRef("AP"),
        fullName: d.fullName,
        phone: d.phone,
        email: d.email || null,
        specialty: d.specialty,
        providerId: d.providerId,
        providerName: d.providerName,
        doctorId: d.doctorId || null,
        doctorName: d.doctorName || null,
        preferredDate: d.preferredDate,
        preferredTime: d.preferredTime,
        notes: d.notes || null,
        status: "Submitted",
      },
    });
    return NextResponse.json({ request }, { status: 201 });
  } catch (e) {
    console.error("POST /api/appointments", e);
    return NextResponse.json({ error: "Could not submit request" }, { status: 500 });
  }
}
