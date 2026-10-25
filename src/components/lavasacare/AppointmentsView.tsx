"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useLavasa } from "@/lib/store";
import {
  APPOINTMENT_SLOTS,
  DOCTORS,
  PROVIDERS,
  SPECIALTIES,
  STATUS_STYLE,
} from "@/lib/data";
import { api, type AppointmentRow } from "@/lib/api";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DemoChip, Reveal, SectionHead } from "./bits";
import {
  CalendarPlus,
  ClipboardCheck,
  FileText,
  Hourglass,
  Loader2,
  Lock,
  PartyPopper,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const isNotPast = (v: string) => {
  if (!v) return true; // empty is handled by min(1)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${v}T00:00:00`);
  return !Number.isNaN(d.getTime()) && d >= today;
};

const schema = z.object({
  specialty: z.string().min(1, "Choose a specialty"),
  providerId: z.string().min(1, "Choose a participating provider"),
  doctorId: z.string().optional(),
  preferredDate: z
    .string()
    .min(1, "Pick a preferred date")
    .refine(isNotPast, { message: "Appointment date cannot be in the past" }),
  preferredTime: z.string().min(1, "Pick a preferred time slot"),
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d][\d\s-]{7,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email (optional)").optional().or(z.literal("")),
  notes: z.string().trim().max(500, "Please keep notes under 500 characters").optional().or(z.literal("")),
  consent: z.literal(true, { message: "Please accept the privacy notice to continue" }),
});

type FormValues = z.input<typeof schema>;

const STATUS_FLOW = [
  { s: "Submitted", d: "Your request reached the platform and was given a reference number." },
  { s: "Under Review", d: "Provider staff are checking doctor availability for your slot." },
  { s: "Confirmed", d: "Only the provider confirms — that is your real appointment." },
  { s: "Declined / Reschedule", d: "The provider couldn't honour the slot and may propose another." },
];

export function AppointmentsView() {
  const { appointmentPrefill, setAppointmentPrefill } = useLavasa();
  const [done, setDone] = useState<AppointmentRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      specialty: "",
      providerId: "",
      doctorId: "",
      preferredDate: "",
      preferredTime: "",
      fullName: "",
      phone: "",
      email: "",
      notes: "",
    },
  });

  // consume prefill from doctor cards (FR-04 → FR-05 flow)
  useEffect(() => {
    if (appointmentPrefill.specialty || appointmentPrefill.providerId) {
      form.reset((prev) => ({
        ...prev,
        specialty: appointmentPrefill.specialty || "",
        providerId: appointmentPrefill.providerId || "",
        doctorId: appointmentPrefill.doctorId || "",
      }));
      setAppointmentPrefill({});
    }
  }, [appointmentPrefill, form, setAppointmentPrefill]);

  const specialty = form.watch("specialty");
  const providerId = form.watch("providerId");

  const providerOptions = useMemo(() => {
    const base = PROVIDERS.filter((p) => p.type === "hospital" || p.type === "clinic");
    if (!specialty) return base;
    const matchingDoctors = DOCTORS.filter((d) => d.specialty === specialty);
    const ids = new Set(matchingDoctors.map((d) => d.providerId));
    // providers hosting the specialty first
    return [...base.filter((p) => ids.has(p.id)), ...base.filter((p) => !ids.has(p.id))];
  }, [specialty]);

  const doctorOptions = useMemo(() => {
    return DOCTORS.filter((d) => {
      if (specialty && d.specialty !== specialty) return false;
      if (providerId && d.providerId !== providerId) return false;
      return true;
    });
  }, [specialty, providerId]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const provider = PROVIDERS.find((p) => p.id === values.providerId);
      const doctor = DOCTORS.find((d) => d.id === values.doctorId);
      const res = await api.createAppointment({
        ...values,
        providerName: provider?.name ?? "Selected provider",
        doctorName: doctor?.name ?? "",
      });
      setDone(res.request);
      toast.success("Appointment request submitted", {
        description: `Reference ${res.request.ref} — the provider will review it.`,
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
            eyebrow="Appointments"
            title={
              <>
                Request an <span className="text-gradient">appointment</span>
              </>
            }
            sub="Submit a request to a participating provider. Required fields are validated and past dates are never accepted. The provider's confirmation is what makes it a real appointment (FR-05 / FR-06)."
          />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.15fr]">
          {/* Explainer column */}
          <div className="space-y-5">
            <Reveal>
              <div className="rounded-3xl border border-brand-100 bg-white p-6">
                <h3 className="flex items-center gap-2 font-bold tracking-tight text-ink">
                  <ClipboardCheck className="size-5 text-brand-500" aria-hidden />
                  What happens to your request?
                </h3>
                <ol className="mt-4 space-y-4">
                  {STATUS_FLOW.map((s, i) => (
                    <li key={s.s} className="flex gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                        {i + 1}
                      </span>
                      <div>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold",
                            STATUS_STYLE[s.s]
                          )}
                        >
                          {s.s}
                        </span>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6">
                <h3 className="flex items-center gap-2 font-bold tracking-tight text-amber-800">
                  <Hourglass className="size-5" aria-hidden />
                  A request is not a confirmed appointment
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-amber-800/90">
                  Only authorised provider staff can confirm or decline. Slots shown on this
                  prototype are demonstration data — in production they would come from the
                  provider&apos;s own system with a last-updated timestamp (FR-07).
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="rounded-2xl border border-brand-900 bg-brand-900 p-6 text-white">
                <h3 className="flex items-center gap-2 font-bold tracking-tight">
                  <ShieldCheck className="size-5" aria-hidden />
                  Privacy first
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/85">
                  We ask only for the minimum details needed to process the request (NFR-06).
                  Sensitive information is never placed in URLs or public storage, and this
                  prototype never shares your data.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Form column */}
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
                    Your request is <strong>not confirmed yet</strong>. Keep this reference number
                    for follow-up — the provider will review and update the status.
                  </p>
                  <div className="mt-5 rounded-2xl bg-brand-50 px-6 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-500">Reference</p>
                    <p className="font-mono text-xl font-bold tracking-wide text-brand-700">{done.ref}</p>
                  </div>
                  <dl className="mt-5 grid w-full max-w-sm grid-cols-2 gap-2 text-left text-sm">
                    <div className="rounded-xl bg-muted/60 px-3 py-2">
                      <dt className="text-[10px] font-bold uppercase text-muted-foreground">Status</dt>
                      <dd className="font-bold text-ink">{done.status}</dd>
                    </div>
                    <div className="rounded-xl bg-muted/60 px-3 py-2">
                      <dt className="text-[10px] font-bold uppercase text-muted-foreground">Slot</dt>
                      <dd className="font-bold text-ink">{done.preferredDate} · {done.preferredTime}</dd>
                    </div>
                    <div className="col-span-2 rounded-xl bg-muted/60 px-3 py-2">
                      <dt className="text-[10px] font-bold uppercase text-muted-foreground">Provider</dt>
                      <dd className="font-bold text-ink">{done.providerName}{done.doctorName ? ` · ${done.doctorName}` : ""}</dd>
                    </div>
                  </dl>
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
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="specialty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialty *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl">
                                  <SelectValue placeholder="Choose specialty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SPECIALTIES.map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="providerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Participating provider *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl">
                                  <SelectValue placeholder="Choose provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {providerOptions.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name} · {p.area}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="doctorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred doctor (optional)</FormLabel>
                          <Select
                            onValueChange={(v) => field.onChange(v === "any" ? "" : v)}
                            value={field.value || "any"}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder="Any available doctor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="any">Any available doctor</SelectItem>
                              {doctorOptions.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                  {d.name} — {d.specialty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="preferredDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred date *</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                min={today}
                                className="h-11 rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="preferredTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred time slot *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl">
                                  <SelectValue placeholder="Choose slot" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {APPOINTMENT_SLOTS.map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Asha Kale" className="h-11 rounded-xl" {...field} />
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
                              <Input
                                type="tel"
                                inputMode="tel"
                                placeholder="10-digit mobile"
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (optional)</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" className="h-11 rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes for the provider (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              placeholder="Brief reason for visit, accessibility needs…"
                              className="resize-none rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consent"
                      render={({ field }) => (
                        <FormItem className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={field.value === true}
                              onCheckedChange={(v) => field.onChange(v === true)}
                              className="mt-0.5"
                              aria-label="Accept privacy notice"
                            />
                            <div>
                              <p className="text-sm font-semibold leading-relaxed text-ink">
                                I understand this is a <strong>request, not a confirmation</strong>, and
                                agree to the privacy notice: only minimum necessary details are
                                collected for this demo.
                              </p>
                              <FormMessage className="mt-1" />
                            </div>
                          </div>
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
                          <Loader2 className="mr-2 size-5 animate-spin" aria-hidden />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 size-5" aria-hidden />
                          Submit request
                        </>
                      )}
                    </Button>
                    <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                      <Lock className="size-3" aria-hidden />
                      Demo prototype — submissions are stored locally, never shared (FR-21).
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
