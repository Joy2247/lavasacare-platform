import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { MESSAGE_STATUSES } from "@/lib/data";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(MESSAGE_STATUSES as [string, ...string[]]),
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
    const message = await db.contactMessage.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json({ message });
  } catch (e) {
    console.error("PATCH /api/contact/[id]", e);
    return NextResponse.json({ error: "Could not update message" }, { status: 500 });
  }
}
