"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PACKAGES, formatHoursAgo, type HealthPackage } from "@/lib/data";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BadgeCheck, Check, Clock3, FlaskConical, Loader2, ScrollText, Stethoscope } from "lucide-react";
import { DemoChip, Reveal, SectionHead } from "./bits";

const enquirySchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z.string().trim().regex(/^\+?[\d][\d\s-]{7,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email (optional)").optional().or(z.literal("")),
  preferredDate: z.string().optional().or(z.literal("")),
  message: z.string().trim().max(500).optional().or(z.literal("")),
});

type EnquiryValues = z.input<typeof enquirySchema>;

function PackageCard({ pkg, index, onEnquire }: { pkg: HealthPackage; index: number; onEnquire: (p: HealthPackage) => void }) {
  return (
    <Reveal delay={Math.min(index * 0.06, 0.3)}>
      <motion.article
        whileHover={{ y: -6 }}
        className="flex h-full flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-brand-100"
      >
        <div className="relative bg-brand-950 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold tracking-tight">{pkg.name}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-white/85">
                <BadgeCheck className="size-3.5" aria-hidden /> {pkg.providerName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Package price</p>
              <p className="font-mono text-2xl font-bold">₹{pkg.price.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock3 className="size-3.5 text-brand-400" aria-hidden /> ~{pkg.durationHours} hrs
            </span>
            <span className="flex items-center gap-1">
              <FlaskConical className="size-3.5 text-brand-400" aria-hidden /> {pkg.tests.length} tests
            </span>
            <span className="ml-auto" title="Last verified update (FR-10)">
              Updated {formatHoursAgo(pkg.lastUpdatedHoursAgo)}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-500">Included tests</p>
            <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {pkg.tests.map((t) => (
                <li key={t} className="flex items-start gap-1.5 text-sm text-ink/80">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {pkg.fasting ? (
            <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              Fasting: {pkg.fasting}
            </p>
          ) : null}

          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-500">Preparation</p>
            <ul className="mt-1.5 space-y-1">
              {pkg.prep.map((p) => (
                <li key={p} className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand-300" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-ink">Eligibility:</strong> {pkg.eligibility}. Medical suitability
            is decided by a qualified professional, not by this platform (FR-10).
          </p>

          <div className="mt-auto flex items-center gap-2 pt-5">
            <Button
              onClick={() => onEnquire(pkg)}
              className="h-11 flex-1 rounded-lg bg-brand-600 font-semibold shadow-none"
            >
              <ScrollText className="mr-2 size-4" aria-hidden /> Enquire / book request
            </Button>
          </div>
        </div>
      </motion.article>
    </Reveal>
  );
}

export function PackagesView() {
  const [active, setActive] = useState<HealthPackage | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { fullName: "", phone: "", email: "", preferredDate: "", message: "" },
  });

  async function onSubmit(values: EnquiryValues) {
    if (!active) return;
    setSubmitting(true);
    try {
      const res = await api.createEnquiry({
        ...values,
        packageId: active.id,
        packageName: active.name,
        providerId: active.providerId,
        providerName: active.providerName,
      });
      setDone(res.request.ref);
      toast.success("Enquiry submitted", { description: `Reference ${res.request.ref}` });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit enquiry");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-mesh min-h-[calc(100vh-7rem)]">
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 pt-10">
          <SectionHead
            eyebrow="Health checkups"
            title={
              <>
                Packages with <span className="text-gradient">nothing hidden</span>
              </>
            }
            sub="Every package shows its verified provider, included tests, price, preparation steps and when it was last updated. Enquiries go to the provider — suitability is always decided by professionals (FR-10)."
          />
          <DemoChip label="Prices & packages are demo data" />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {PACKAGES.map((p, i) => (
            <PackageCard key={p.id} pkg={p} index={i} onEnquire={(pkg) => { setActive(pkg); setDone(null); }} />
          ))}
        </div>

        {/* Enquiry dialog (FR-10 enquiry/booking request) */}
        <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
          <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-left">{active?.name}</DialogTitle>
              <DialogDescription className="text-left">
                Enquiry goes to <strong>{active?.providerName}</strong>. The provider confirms slot,
                price and medical suitability — an enquiry is not a booking yet.
              </DialogDescription>
            </DialogHeader>

            {done ? (
              <div className="flex flex-col items-center rounded-2xl bg-emerald-50 py-8 text-center">
                <Stethoscope className="size-10 text-emerald-500" aria-hidden />
                <p className="mt-3 font-bold text-ink">Enquiry submitted</p>
                <p className="mt-1 text-sm text-muted-foreground">Reference</p>
                <p className="font-mono text-lg font-bold text-brand-700">{done}</p>
                <Button
                  onClick={() => setActive(null)}
                  variant="outline"
                  className="mt-4 rounded-full border-brand-200 font-bold text-brand-700"
                >
                  Done
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name *</FormLabel>
                          <FormControl>
                            <Input className="h-11 rounded-xl" placeholder="Your name" {...field} />
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
                            <Input type="tel" inputMode="tel" className="h-11 rounded-xl" placeholder="10-digit mobile" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (optional)</FormLabel>
                          <FormControl>
                            <Input type="email" className="h-11 rounded-xl" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferredDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              min={new Date().toISOString().slice(0, 10)}
                              className="h-11 rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message (optional)</FormLabel>
                        <FormControl>
                          <Textarea rows={3} className="resize-none rounded-xl" placeholder="Questions for the provider…" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 w-full rounded-lg bg-brand-600 font-semibold"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> Submitting…
                      </>
                    ) : (
                      "Submit enquiry"
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
