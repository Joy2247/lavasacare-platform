"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api, type ContactRow } from "@/lib/api";
import { EMERGENCY } from "@/lib/data";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Reveal, SectionHead } from "./bits";
import {
  Clock3,
  Loader2,
  LifeBuoy,
  Mail,
  PhoneCall,
  Send,
  Siren,
  Building2,
  PartyPopper,
} from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d][\d\s-]{7,15}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(1, "Choose a subject"),
  message: z.string().trim().min(10, "Please add a few more details (10+ characters)").max(1000),
});

type FormValues = z.input<typeof schema>;

const SUBJECTS = [
  "General question",
  "Problem with a request",
  "Provider partnership",
  "Feedback about the platform",
  "Privacy / data question",
];

export function ContactView() {
  const [done, setDone] = useState<ContactRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await api.createContact(values);
      setDone(res.message);
      toast.success("Message sent", { description: `Reference ${res.message.ref}` });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-mesh min-h-[calc(100vh-7rem)]">
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="pt-10">
          <SectionHead
            eyebrow="Contact & support"
            title={
              <>
                We&apos;re here to <span className="text-gradient">help</span>
              </>
            }
            sub="Questions about the platform, a request, or joining as a provider — send us a message. Required fields are validated, and in production messages go to the authorised support inbox (FR-15)."
          />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* Info column */}
          <div className="space-y-5">
            <Reveal>
              <Alert className="rounded-3xl border-rose-200 bg-rose-50">
                <Siren className="size-5 text-rose-600" aria-hidden />
                <AlertTitle className="text-rose-700">Medical emergency?</AlertTitle>
                <AlertDescription className="text-rose-800">
                  <p className="leading-relaxed">
                    Do not use this form. Call{" "}
                    <a href={`tel:${EMERGENCY.ambulance}`} className="font-bold underline">
                      {EMERGENCY.ambulance}
                    </a>{" "}
                    (ambulance) or{" "}
                    <a href={`tel:${EMERGENCY.national}`} className="font-bold underline">
                      {EMERGENCY.national}
                    </a>{" "}
                    (national emergency) immediately. {EMERGENCY.notice}
                  </p>
                </AlertDescription>
              </Alert>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: Mail,
                    t: "Email",
                    d: "support@lavasacare.example",
                    note: "Replies within 1 working day (demo)",
                  },
                  {
                    icon: PhoneCall,
                    t: "Support line",
                    d: "+91 20 6675 1000",
                    note: "Mon–Sat, 9:00–18:00 (demo)",
                  },
                  {
                    icon: Building2,
                    t: "Platform office",
                    d: "Business Quarter, Dasve, Lavasa 412112",
                    note: "Visits by appointment only (demo)",
                  },
                  {
                    icon: Clock3,
                    t: "Response window",
                    d: "Messages queued with a reference",
                    note: "Track via your reference number",
                  },
                ].map((c) => (
                  <div key={c.t} className="rounded-3xl border border-brand-100 bg-white p-5 card-hover">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                      <c.icon className="size-5" aria-hidden />
                    </span>
                    <p className="mt-3 text-xs font-bold uppercase tracking-widest text-brand-500">{c.t}</p>
                    <p className="mt-1 text-sm font-bold leading-snug text-ink">{c.d}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
                  </div>
                ))}
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
                  <h3 className="mt-4 text-xl font-bold tracking-tight text-ink">Message received</h3>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Thank you, {done.name.split(" ")[0]}. Our support team will reply to{" "}
                    <strong>{done.email}</strong>. Keep your reference handy:
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
                    Send another message
                  </Button>
                </motion.div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your name *</FormLabel>
                            <FormControl>
                              <Input className="h-11 rounded-xl" placeholder="Full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" className="h-11 rounded-xl" placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (optional)</FormLabel>
                            <FormControl>
                              <Input type="tel" inputMode="tel" className="h-11 rounded-xl" placeholder="10-digit mobile" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl">
                                  <SelectValue placeholder="What is this about?" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SUBJECTS.map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
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
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message *</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={5}
                              className="resize-none rounded-xl"
                              placeholder="Tell us what you need — please never include sensitive medical details here."
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
                          <Loader2 className="mr-2 size-5 animate-spin" aria-hidden /> Sending…
                        </>
                      ) : (
                        <>
                          <LifeBuoy className="mr-2 size-5" aria-hidden /> Send message
                        </>
                      )}
                    </Button>
                    <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                      <Send className="size-3" aria-hidden />
                      Demo prototype — messages are stored locally, not emailed (FR-15).
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
