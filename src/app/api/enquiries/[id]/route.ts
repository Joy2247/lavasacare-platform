import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ENQUIRY_STATUSES } from "@/lib/data";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES as [string, ...string[]]),
  statusNote: z.string().trim().max(300).optional().or(z.literal("")),
  changedBy: z.string().trim().max(80).optional().or(z.literal("")),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid status update" },
        { status: 400 }
      );
    }
    const request = await db.packageEnquiry.update({
      where: { id },
      data: {
        status: parsed.data.status,
        statusNote: parsed.data.statusNote || null,
        changedBy: parsed.data.changedBy || "Provider staff (demo)",
        changedAt: new Date(),
      },
    });
    return NextResponse.json({ request });
  } catch (e) {
    console.error("PATCH /api/enquiries/[id]", e);
    return NextResponse.json({ error: "Could not update enquiry" }, { status: 500 });
  }
}
