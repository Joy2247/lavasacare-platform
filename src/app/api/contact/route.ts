import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { makeRef, ensureSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";

const phoneRe = /^\+?[\d][\d\s-]{7,15}$/;

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: z
    .string()
    .trim()
    .regex(phoneRe, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  subject: z.string().trim().min(2).max(100),
  message: z.string().trim().min(10, "Please add a few more details").max(1000),
});

export async function GET() {
  try {
    await ensureSeed();
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ messages });
  } catch (e) {
    console.error("GET /api/contact", e);
    return NextResponse.json({ error: "Could not load messages" }, { status: 500 });
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
    // FR-15: production sends this through a secure backend to a support inbox.
    const message = await db.contactMessage.create({
      data: {
        ref: makeRef("CS"),
        name: d.name,
        email: d.email,
        phone: d.phone || null,
        subject: d.subject,
        message: d.message,
        status: "Open",
      },
    });
    return NextResponse.json({ message }, { status: 201 });
  } catch (e) {
    console.error("POST /api/contact", e);
    return NextResponse.json({ error: "Could not send message" }, { status: 500 });
  }
}
