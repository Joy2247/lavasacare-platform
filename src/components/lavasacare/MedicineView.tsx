"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api, type MedicineRow } from "@/lib/api";
import { PROVIDERS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Reveal, SectionHead } from "./bits";
import {
  FileWarning,
  Loader2,
  PackageCheck,
  PartyPopper,
  Pill,
  Route,
  ShieldCheck,
  Truck,
} from "lucide-react";

const schema = z.object({
  productName: z.string().trim().min(3, "Enter the medicine or product name").max(160),
  contactName: z.string().trim().min(2, "Enter a contact name").max(80),
  phone: z.string().trim().regex(/^\+?[\d][\d\s-]{7,15}$/, "Enter a valid phone number"),
  deliveryArea: z.string().trim().min(2, "Enter your delivery area").max(80),
  pinCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "PIN code must be exactly 6 digits")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

type FormValues = z.input<typeof schema>;

const STEPS = [
  {
    icon: Pill,
    t: "You submit the request",
    d: "Tell us the medicine or product, your area and a contact number — nothing more than the minimum necessary (FR-08).",
  },
  {
    icon: Route,
    t: "Routed to a pharmacy",
    d: "In production the request goes to a participating pharmacy. Here, it is demo-assigned to Lavasa Wellness Pharmacy so you can see the flow.",
  },
  {
    icon: Truck,
    t: "Pharmacy confirms honestly",
    d: "Only the pharmacy confirms stock, price and delivery. Until then the status stays honest — no promises (AC-07).",
  },
];

export function MedicineView() {
  const [done, setDone] = useState<MedicineRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { productName: "", contactName: "", phone: "", deliveryArea: "", pinCode: "", notes: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await api.createMedicine(values);
      setDone(res.request);
      toast.success("Medicine request submitted", {
        description: `Reference ${res.request.ref} — routed to ${res.request.pharmacyName}.`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-mesh min-h-[calc(100vh-7rem)]">
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="pt-10">
          <SectionHead
            eyebrow="Medicine delivery"
            title={
              <>
                Request <span className="text-gradient">medicine delivery</span>
              </>
            }
            sub="Send a medicine or product request to participating pharmacies. Requests are only fulfilled after the pharmacy confirms — stock, price and delivery are never promised in advance (FR-08)."
          />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* Explainer */}
          <div className="space-y-5">
            {STEPS.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.08}>
                <div className="flex gap-4 rounded-3xl border border-brand-100 bg-white p-6 card-hover">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                    <s.icon className="size-6" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-400">
                      Step {i + 1}
                    </p>
                    <h3 className="mt-0.5 font-bold tracking-tight text-ink">{s.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={0.2}>
              <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6">
                <h3 className="flex items-center gap-2 font-bold tracking-tight text-amber-800">
                  <FileWarning className="size-5" aria-hidden />
                  Prescription rules (FR-09)
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-amber-800/90">
                  Prescription medicines are dispensed only after the pharmacy&apos;s compliant
                  verification workflow. This prototype does <strong>not</strong> collect
                  prescription uploads — you would show the prescription at the pharmacy or during
                  verified delivery in production.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="rounded-3xl border border-brand-100 bg-white p-6">
                <h3 className="flex items-center gap-2 font-bold tracking-tight text-ink">
                  <ShieldCheck className="size-5 text-brand-500" aria-hidden />
                  Participating pharmacies
                </h3>
                <ul className="mt-3 space-y-2">
                  {PROVIDERS.filter((p) => p.type === "pharmacy").map((p) => (
                    <li key={p.id} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2.5 text-sm">
                      <span className="font-semibold text-ink">{p.name}</span>
                      <span className="text-xs font-semibold text-muted-foreground">{p.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <Reveal delay={0.05}>
            <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-xl shadow-brand-900/5 sm:p-8">
              {done ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8 text-center"
                >
                  <span className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                    <PartyPopper className="size-8" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-xl font-bold tracking-tight text-ink">Request submitted</h3>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Routed to <strong>{done.pharmacyName}</strong>. Status:{" "}
                    <strong>{done.status}</strong> — the pharmacy confirms stock and delivery before
                    anything is final.
                  </p>
                  <div className="mt-5 rounded-2xl bg-brand-50 px-6 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-500">Reference</p>
                    <p className="font-mono text-xl font-bold tracking-wide text-brand-700">{done.ref}</p>
                  </div>
                  <Button
                    onClick={() => setDone(null)}
                    variant="outline"
                    className="mt-6 rounded-full border-brand-200 font-bold text-brand-700"
                  >
                    Submit another request
                  </Button>
                </motion.div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medicine / product name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='e.g. Paracetamol 650 mg (strip of 15)'
                              className="h-11 rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" className="h-11 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone *</FormLabel>
                            <FormControl>
                              <Input type="tel" inputMode="tel" placeholder="10-digit mobile" className="h-11 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
                      <FormField
                        control={form.control}
                        name="deliveryArea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery area *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Dasve, Portofino…" className="h-11 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pinCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PIN code</FormLabel>
                            <FormControl>
                              <Input inputMode="numeric" placeholder="412112" maxLength={6} className="h-11 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              placeholder="Delivery timing preferences, brand acceptable?…"
                              className="resize-none rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="h-12 w-full rounded-lg bg-brand-600 text-[15px] font-semibold shadow-none hover:bg-brand-700"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 size-5 animate-spin" aria-hidden /> Submitting…
                        </>
                      ) : (
                        <>
                          <PackageCheck className="mr-2 size-5" aria-hidden /> Submit medicine request
                        </>
                      )}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Minimum necessary data only · demo prototype, stored locally (FR-21)
                    </p>
                  </form>
                </Form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
