"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EMERGENCY } from "@/lib/data";
import { PhoneCall, Siren, ShieldAlert } from "lucide-react";

export function EmergencyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-rose-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600">
            <Siren className="size-5" aria-hidden />
            Emergency guidance
          </DialogTitle>
          <DialogDescription className="text-left leading-relaxed">
            {EMERGENCY.notice}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${EMERGENCY.ambulance}`}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50 to-white px-4 py-5 text-center transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-200/60"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-rose-500 text-white shadow-md shadow-rose-300 transition group-hover:scale-110">
              <PhoneCall className="size-5" aria-hidden />
            </span>
            <span className="text-xl font-bold text-rose-600">{EMERGENCY.ambulance}</span>
            <span className="text-xs font-semibold text-muted-foreground">Ambulance (all India)</span>
          </a>
          <a
            href={`tel:${EMERGENCY.national}`}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-brand-200 bg-gradient-to-b from-brand-50 to-white px-4 py-5 text-center transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-200/60"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm transition group-hover:scale-105">
              <PhoneCall className="size-5" aria-hidden />
            </span>
            <span className="text-xl font-bold text-brand-600">{EMERGENCY.national}</span>
            <span className="text-xs font-semibold text-muted-foreground">National emergency</span>
          </a>
        </div>

        <ul className="space-y-1.5 rounded-2xl bg-muted/70 p-4 text-sm leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
            <span>
              Give your exact location — landmark, area, floor — and stay on the line.
            </span>
          </li>
          <li className="flex gap-2">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
            <span>
              Online ambulance booking is <strong>not yet enabled</strong>; it will open only
              after a verified dispatch partner is integrated (AC-11).
            </span>
          </li>
          <li className="flex gap-2">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
            <span>
              LavasaCare never replaces urgent care — go to the nearest emergency department
              if you can travel safely.
            </span>
          </li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
