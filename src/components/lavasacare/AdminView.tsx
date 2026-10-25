"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useLavasa } from "@/lib/store";
import {
  APPOINTMENT_STATUSES,
  BED_REPORTS,
  ENQUIRY_STATUSES,
  MEDICINE_STATUSES,
  MESSAGE_STATUSES,
  PROVIDERS,
} from "@/lib/data";
import { api, type AppointmentRow, type ContactRow, type EnquiryRow, type MedicineRow } from "@/lib/api";
import { loadOverrides, saveOverride } from "@/lib/overrides";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BadgeCheck,
  BedDouble,
  Clock3,
  Database,
  Eye,
  Fingerprint,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  Pill,
  RefreshCw,
  Search,
  ShieldAlert,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { DemoChip, StatusBadge } from "./bits";
import { cn } from "@/lib/utils";

/* =============================== LOGIN GATE =============================== */

const ROLES = ["Provider staff", "Provider administrator", "Platform administrator"];

function LoginGate() {
  const setAdminAuthed = useLavasa((s) => s.setAdminAuthed);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Enter a demo email and password");
      return;
    }
    if (!ack) {
      toast.error("Please acknowledge the demo notice first");
      return;
    }
    setBusy(true);
    // FR-16: browser-only demo login — NOT secure authentication.
    setTimeout(() => {
      setBusy(false);
      setAdminAuthed(true, role);
      toast.success("Signed in to demo dashboard", { description: `Role: ${role}` });
    }, 600);
  };

  return (
    <div className="bg-mesh flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-2xl shadow-brand-900/10">
          <div className="flex flex-col items-center text-center">
            <span className="flex size-14 items-center justify-center rounded-xl bg-brand-700 text-white">
              <Lock className="size-6" aria-hidden />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">Provider Admin</h1>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Sign in to review requests and maintain authorised service information.
            </p>
            <div className="mt-3"><DemoChip label="Demo login · not secure" /></div>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <div>
              <Label htmlFor="admin-email">Work email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="you@provider.example"
                className="mt-1.5 h-11 rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="admin-pass">Password</Label>
              <Input
                id="admin-pass"
                type="password"
                placeholder="Any password works in the demo"
                className="mt-1.5 h-11 rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div>
              <Label>Demo role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="mt-1.5 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                Roles only change what the demo shows — real access control (FR-16) happens on a
                secure server.
              </p>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <Checkbox checked={ack} onCheckedChange={(v) => setAck(v === true)} className="mt-0.5" />
              <span className="text-xs leading-relaxed text-amber-800">
                I understand this is a <strong>browser-only demo login</strong> — it is not real
                authentication, must never be used for real patient data, and any role I pick is
                for display only (FR-16).
              </span>
            </label>

            <Button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-lg bg-brand-600 text-[15px] font-semibold shadow-none hover:bg-brand-700"
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" aria-hidden /> Signing in…
                </>
              ) : (
                "Sign in to demo dashboard"
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================== REQUEST PANEL ============================== */

interface RowLike {
  id: string;
  ref: string;
  title: string;
  meta: string;
  when: string;
  status: string;
  statusNote?: string | null;
  changedBy?: string | null;
  changedAt?: string;
  details: [string, string][];
}

function RequestsPanel({
  icon: Icon,
  heading,
  sub,
  rows,
  loading,
  statuses,
  onUpdate,
}: {
  icon: typeof Inbox;
  heading: string;
  sub: string;
  rows: RowLike[];
  loading: boolean;
  statuses: string[];
  onUpdate: (id: string, status: string) => Promise<void>;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RowLike | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      const okS = status === "all" || r.status === status;
      const hay = `${r.ref} ${r.title} ${r.meta}`.toLowerCase();
      return okS && (!needle || hay.includes(needle));
    });
  }, [rows, q, status]);

  async function change(id: string, next: string) {
    setBusyId(id);
    try {
      await onUpdate(id, next);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Icon className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="font-bold tracking-tight text-ink">{heading}</h3>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-400" aria-hidden />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ref / name…"
              aria-label={`Search ${heading}`}
              className="h-10 w-44 rounded-full pl-9 text-sm"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-10 w-[150px] rounded-full text-sm" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-brand-50">
        <div className="scroll-slim max-h-[30rem] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-brand-50/90 backdrop-blur">
              <TableRow>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-brand-700">Reference</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-brand-700">Request</TableHead>
                <TableHead className="hidden text-[11px] font-bold uppercase tracking-wider text-brand-700 md:table-cell">When</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-brand-700">Status</TableHead>
                <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-brand-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full max-w-[120px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No requests match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id} className="hover:bg-brand-50/40">
                    <TableCell className="whitespace-nowrap font-mono text-xs font-bold text-brand-700">
                      {r.ref}
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <p className="truncate text-sm font-bold text-ink">{r.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{r.meta}</p>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground md:table-cell">
                      {r.when}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          value={r.status}
                          onValueChange={(v) => change(r.id, v)}
                          disabled={busyId === r.id}
                        >
                          <SelectTrigger
                            className="h-8 w-[136px] rounded-full text-xs"
                            aria-label={`Change status for ${r.ref}`}
                          >
                            {busyId === r.id ? (
                              <span className="flex items-center gap-1.5">
                                <Loader2 className="size-3.5 animate-spin" aria-hidden /> Saving…
                              </span>
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-full text-brand-600 hover:bg-brand-50"
                          onClick={() => setDetail(r)}
                          aria-label={`View details for ${r.ref}`}
                        >
                          <Eye className="size-4" aria-hidden />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* details dialog with audit trail (FR-17 / FR-20) */}
      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-left">
              <Fingerprint className="size-5 text-brand-500" aria-hidden />
              {detail?.ref}
            </DialogTitle>
            <DialogDescription className="text-left">Full request details & audit trail.</DialogDescription>
          </DialogHeader>
          {detail ? (
            <div className="space-y-4">
              <dl className="space-y-2 rounded-2xl bg-muted/50 p-4 text-sm">
                {detail.details.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="shrink-0 text-xs font-bold uppercase tracking-wide text-muted-foreground">{k}</dt>
                    <dd className="text-right font-semibold text-ink">{v || "—"}</dd>
                  </div>
                ))}
              </dl>
              <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 text-xs leading-relaxed text-muted-foreground">
                <p className="font-bold uppercase tracking-wider text-brand-600">Audit trail</p>
                <p className="mt-1.5">
                  Current status: <StatusBadge status={detail.status} />
                </p>
                {detail.statusNote ? <p className="mt-1">Note: “{detail.statusNote}”</p> : null}
                <p className="mt-1">
                  Last change by <strong>{detail.changedBy ?? "—"}</strong>
                  {detail.changedAt ? ` · ${new Date(detail.changedAt).toLocaleString("en-IN")}` : ""}
                </p>
                <p className="mt-1 text-[11px]">
                  Production systems record every change immutably (FR-20) and notify the user
                  through approved channels only (FR-19).
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================ PROVIDER DATA (FR-18) ======================== */

function ProviderDataPanel() {
  const [overrides, setOverrides] = useState(() => loadOverrides());
  const [editing, setEditing] = useState<(typeof PROVIDERS)[number] | null>(null);
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");
  const [beds, setBeds] = useState<{ type: string; available: number; total: number }[]>([]);
  const [busy, setBusy] = useState(false);

  function openEdit(p: (typeof PROVIDERS)[number]) {
    setEditing(p);
    const o = overrides[p.id] || {};
    setPhone(o.phone || p.phone);
    setHours(o.hours || p.hours);
    const base = BED_REPORTS.find((b) => b.providerId === p.id);
    setBeds(o.beds || base?.rows?.map((r) => ({ ...r })) || []);
  }

  function persist() {
    if (!editing) return;
    setBusy(true);
    // FR-18 demo: staff update provider info; changes are timestamped locally.
    setTimeout(() => {
      saveOverride(editing.id, {
        phone,
        hours,
        ...(BED_REPORTS.some((b) => b.providerId === editing.id) ? { beds } : {}),
      });
      setOverrides(loadOverrides());
      setBusy(false);
      setEditing(null);
      toast.success("Provider information updated (demo)", {
        description: "Saved to this browser only — production writes to the provider record.",
      });
    }, 500);
  }

  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Database className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="font-bold tracking-tight text-ink">Provider data management</h3>
            <p className="text-xs text-muted-foreground">
              Update contact details, operating hours and bed reports (FR-18). Published pages show
              the update time.
            </p>
          </div>
        </div>
        <DemoChip label="Edits stay in your browser" />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {PROVIDERS.map((p) => {
          const o = overrides[p.id];
          return (
            <div key={p.id} className="rounded-2xl border border-brand-100 p-4 transition hover:border-brand-300">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-bold text-ink">
                    <BadgeCheck className="size-4 shrink-0 text-brand-500" aria-hidden />
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {p.type} · {p.area}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(p)}
                  className="h-8 shrink-0 rounded-full border-brand-200 text-xs font-bold text-brand-700"
                >
                  Edit
                </Button>
              </div>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <Stethoscope className="size-3.5 text-brand-400" aria-hidden />
                  Phone: <span className={cn("font-semibold", o?.phone && "text-brand-600")}>{o?.phone || p.phone}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock3 className="size-3.5 text-brand-400" aria-hidden />
                  Hours: <span className={cn("font-semibold", o?.hours && "text-brand-600")}>{o?.hours || p.hours}</span>
                </p>
                {o?.beds ? (
                  <p className="flex items-center gap-1.5">
                    <BedDouble className="size-3.5 text-brand-400" aria-hidden />
                    Beds edited:{" "}
                    <span className="font-semibold text-brand-600">
                      {o.beds.map((b) => `${b.type} ${b.available}/${b.total}`).join(" · ")}
                    </span>
                  </p>
                ) : null}
              </div>
              {o?.savedAt ? (
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Updated {new Date(o.savedAt).toLocaleString("en-IN")} (audit: Demo Admin)
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-left">Edit — {editing?.name}</DialogTitle>
            <DialogDescription className="text-left">
              Demo edit — saved to this browser only, timestamped, never published to real providers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" className="mt-1.5 h-10 rounded-xl" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-hours">Operating hours</Label>
              <Input id="edit-hours" className="mt-1.5 h-10 rounded-xl" value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
            {beds.length > 0 ? (
              <div>
                <Label>Bed report (available / total)</Label>
                <div className="mt-1.5 space-y-2">
                  {beds.map((b, i) => (
                    <div key={`${b.type}-${i}`} className="flex items-center gap-2">
                      <span className="w-24 text-sm font-bold text-ink">{b.type}</span>
                      <Input
                        type="number"
                        min={0}
                        max={b.total}
                        value={b.available}
                        aria-label={`${b.type} available`}
                        className="h-10 rounded-xl"
                        onChange={(e) => {
                          const v = Math.max(0, Math.min(b.total, Number(e.target.value) || 0));
                          setBeds((prev) => prev.map((r, j) => (j === i ? { ...r, available: v } : r)));
                        }}
                      />
                      <span className="text-sm text-muted-foreground">/ {b.total}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Validation: available can never exceed total (SRS §6.2).
                </p>
              </div>
            ) : null}
            <Button
              onClick={persist}
              disabled={busy}
              className="h-11 w-full rounded-lg bg-brand-600 font-semibold"
            >
              {busy ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : null}
              Save changes (demo)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ================================ DASHBOARD =============================== */

export function AdminView() {
  const { adminAuthed, adminRole, setAdminAuthed } = useLavasa();
  const [appts, setAppts] = useState<AppointmentRow[]>([]);
  const [meds, setMeds] = useState<MedicineRow[]>([]);
  const [enqs, setEnqs] = useState<EnquiryRow[]>([]);
  const [msgs, setMsgs] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [a, m, e, c] = await Promise.all([
        api.listAppointments(),
        api.listMedicine(),
        api.listEnquiries(),
        api.listContact(),
      ]);
      setAppts(a.requests);
      setMeds(m.requests);
      setEnqs(e.requests);
      setMsgs(c.messages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (adminAuthed) void loadAll();
  }, [adminAuthed, loadAll]);

  const actor = `Demo Admin (${adminRole})`;

  async function updateAppointment(id: string, status: string) {
    const res = await api.updateAppointment(id, { status, changedBy: actor });
    setAppts((prev) => prev.map((r) => (r.id === id ? res.request : r)));
    toast.success(`${res.request.ref} → ${status}`);
  }
  async function updateMedicine(id: string, status: string) {
    const res = await api.updateMedicine(id, { status, changedBy: actor });
    setMeds((prev) => prev.map((r) => (r.id === id ? res.request : r)));
    toast.success(`${res.request.ref} → ${status}`);
  }
  async function updateEnquiry(id: string, status: string) {
    const res = await api.updateEnquiry(id, { status, changedBy: actor });
    setEnqs((prev) => prev.map((r) => (r.id === id ? res.request : r)));
    toast.success(`${res.request.ref} → ${status}`);
  }
  async function updateMessage(id: string, status: string) {
    const res = await api.updateContact(id, { status });
    setMsgs((prev) => prev.map((r) => (r.id === id ? res.message : r)));
    toast.success(`${res.message.ref} → ${status}`);
  }

  if (!adminAuthed) return <LoginGate />;

  const apptRows: RowLike[] = appts.map((a) => ({
    id: a.id,
    ref: a.ref,
    title: `${a.fullName} · ${a.specialty}`,
    meta: `${a.providerName}${a.doctorName ? ` · ${a.doctorName}` : " · any doctor"} · 📞 ${a.phone}`,
    when: `${a.preferredDate} · ${a.preferredTime}`,
    status: a.status,
    statusNote: a.statusNote,
    changedBy: a.changedBy,
    changedAt: a.changedAt,
    details: [
      ["Patient", a.fullName],
      ["Phone", a.phone],
      ["Email", a.email ?? ""],
      ["Specialty", a.specialty],
      ["Provider", a.providerName],
      ["Doctor", a.doctorName ?? "Any available"],
      ["Preferred slot", `${a.preferredDate} · ${a.preferredTime}`],
      ["Notes", a.notes ?? ""],
      ["Submitted", new Date(a.createdAt).toLocaleString("en-IN")],
    ],
  }));

  const medRows: RowLike[] = meds.map((m) => ({
    id: m.id,
    ref: m.ref,
    title: m.productName,
    meta: `${m.contactName} · ${m.deliveryArea}${m.pinCode ? ` ${m.pinCode}` : ""} · ${m.pharmacyName ?? "unassigned"}`,
    when: new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    status: m.status,
    statusNote: m.statusNote,
    changedBy: m.changedBy,
    changedAt: m.changedAt,
    details: [
      ["Product", m.productName],
      ["Contact", m.contactName],
      ["Phone", m.phone],
      ["Delivery area", `${m.deliveryArea} ${m.pinCode ?? ""}`],
      ["Pharmacy", m.pharmacyName ?? "—"],
      ["Notes", m.notes ?? ""],
      ["Submitted", new Date(m.createdAt).toLocaleString("en-IN")],
    ],
  }));

  const enqRows: RowLike[] = enqs.map((e) => ({
    id: e.id,
    ref: e.ref,
    title: `${e.packageName}`,
    meta: `${e.fullName} · ${e.providerName}`,
    when: e.preferredDate || new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    status: e.status,
    statusNote: e.statusNote,
    changedBy: e.changedBy,
    changedAt: e.changedAt,
    details: [
      ["Package", e.packageName],
      ["Provider", e.providerName],
      ["Name", e.fullName],
      ["Phone", e.phone],
      ["Email", e.email ?? ""],
      ["Preferred date", e.preferredDate ?? ""],
      ["Message", e.message ?? ""],
      ["Submitted", new Date(e.createdAt).toLocaleString("en-IN")],
    ],
  }));

  const msgRows: RowLike[] = msgs.map((c) => ({
    id: c.id,
    ref: c.ref,
    title: c.subject,
    meta: `${c.name} · ${c.email}`,
    when: new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    status: c.status,
    details: [
      ["Name", c.name],
      ["Email", c.email],
      ["Phone", c.phone ?? ""],
      ["Subject", c.subject],
      ["Message", c.message],
      ["Received", new Date(c.createdAt).toLocaleString("en-IN")],
    ],
  }));

  return (
    <div className="bg-mesh min-h-[calc(100vh-7rem)]">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
              Provider administration
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Demo dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review requests, update statuses with an audit trail, and maintain provider service
              information (FR-17 / FR-18).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => void loadAll()}
              disabled={refreshing}
              className="rounded-full border-brand-200 font-bold text-brand-700"
            >
              <RefreshCw className={cn("mr-2 size-4", refreshing && "animate-spin")} aria-hidden />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAdminAuthed(false);
                toast("Signed out of demo dashboard");
              }}
              className="rounded-full border-rose-200 font-bold text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="mr-2 size-4" aria-hidden />
              Sign out
            </Button>
          </div>
        </div>

        {/* Demo warning (FR-16) */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
          <p className="text-sm leading-relaxed text-amber-800">
            <strong>Demo session</strong> as <strong>{adminRole}</strong> — signed in with the
            browser-only demo login. This is not secure authentication; never enter real patient
            information here. Production enforces organisation-scoped role-based access (FR-16,
            NFR-05).
          </p>
        </div>

        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { icon: Inbox, label: "Appointment requests", n: appts.length },
            { icon: Pill, label: "Medicine requests", n: meds.length },
            { icon: Wallet, label: "Package enquiries", n: enqs.length },
            { icon: Stethoscope, label: "Support messages", n: msgs.length },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-brand-100 bg-white p-4">
              <div className="flex items-center gap-2 text-brand-600">
                <s.icon className="size-4" aria-hidden />
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
              </div>
              <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{s.n}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="mt-8">
          <TabsList className="flex h-auto w-full flex-wrap gap-1 rounded-2xl bg-white/70 p-1.5">
            <TabsTrigger value="appointments" className="rounded-xl px-4">Appointments</TabsTrigger>
            <TabsTrigger value="medicine" className="rounded-xl px-4">Medicine</TabsTrigger>
            <TabsTrigger value="enquiries" className="rounded-xl px-4">Enquiries</TabsTrigger>
            <TabsTrigger value="messages" className="rounded-xl px-4">Messages</TabsTrigger>
            <TabsTrigger value="provider" className="rounded-xl px-4">Provider data</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="mt-5">
            <RequestsPanel
              icon={Inbox}
              heading="Appointment requests"
              sub="Only authorised provider staff confirm or decline requests (FR-06)."
              rows={apptRows}
              loading={loading}
              statuses={APPOINTMENT_STATUSES}
              onUpdate={updateAppointment}
            />
          </TabsContent>
          <TabsContent value="medicine" className="mt-5">
            <RequestsPanel
              icon={Pill}
              heading="Medicine delivery requests"
              sub="Route to participating pharmacies; confirm stock only after verification (FR-08)."
              rows={medRows}
              loading={loading}
              statuses={MEDICINE_STATUSES}
              onUpdate={updateMedicine}
            />
          </TabsContent>
          <TabsContent value="enquiries" className="mt-5">
            <RequestsPanel
              icon={Wallet}
              heading="Package enquiries"
              sub="Checkup package enquiries and booking requests (FR-10)."
              rows={enqRows}
              loading={loading}
              statuses={ENQUIRY_STATUSES}
              onUpdate={updateEnquiry}
            />
          </TabsContent>
          <TabsContent value="messages" className="mt-5">
            <RequestsPanel
              icon={Stethoscope}
              heading="Support messages"
              sub="Contact & support inbox (FR-15). Production sends these to an authorised inbox."
              rows={msgRows}
              loading={loading}
              statuses={MESSAGE_STATUSES}
              onUpdate={updateMessage}
            />
          </TabsContent>
          <TabsContent value="provider" className="mt-5">
            <ProviderDataPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
