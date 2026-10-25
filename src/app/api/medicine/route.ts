import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { makeRef, ensureSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";

const phoneRe = /^\+?[\d][\d\s-]{7,15}$/;

const createSchema = z.object({
  productName: z.string().trim().min(3, "Enter the medicine / product name").max(160),
  contactName: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(phoneRe, "Enter a valid phone number"),
  deliveryArea: z.string().trim().min(2).max(80),
  pinCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "PIN code must be 6 digits")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  pharmacyId: z.string().trim().optional().or(z.literal("")),
  pharmacyName: z.string().trim().optional().or(z.literal("")),
});

export async function GET() {
  try {
    await ensureSeed();
    const requests = await db.medicineRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ requests });
  } catch (e) {
    console.error("GET /api/medicine", e);
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

    // Demo auto-assignment: route to the 24×7 participating pharmacy.
    // Production: request is routed to a real participating pharmacy instead.
    const pharmacy =
      d.pharmacyId && d.pharmacyName
        ? { id: d.pharmacyId, name: d.pharmacyName }
        : { id: "p-pharmacy-1", name: "Lavasa Wellness Pharmacy" };

    const request = await db.medicineRequest.create({
      data: {
        ref: makeRef("RX"),
        productName: d.productName,
        contactName: d.contactName,
        phone: d.phone,
        deliveryArea: d.deliveryArea,
        pinCode: d.pinCode || null,
        pharmacyId: pharmacy.id,
        pharmacyName: pharmacy.name,
        notes: d.notes || null,
        status: "Assigned to Pharmacy",
        statusNote: "Routed to participating pharmacy (demo assignment).",
        changedBy: "LavasaCare routing (demo)",
        changedAt: new Date(),
      },
    });
    return NextResponse.json({ request }, { status: 201 });
  } catch (e) {
    console.error("POST /api/medicine", e);
    return NextResponse.json({ error: "Could not submit request" }, { status: 500 });
  }
}
