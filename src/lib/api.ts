"use client";

/** Shared client types + fetch helpers for LavasaCare request APIs. */

export interface AppointmentRow {
  id: string;
  ref: string;
  fullName: string;
  phone: string;
  email: string | null;
  specialty: string;
  providerId: string;
  providerName: string;
  doctorId: string | null;
  doctorName: string | null;
  preferredDate: string;
  preferredTime: string;
  notes: string | null;
  status: string;
  statusNote: string | null;
  changedBy: string | null;
  changedAt: string;
  createdAt: string;
}

export interface MedicineRow {
  id: string;
  ref: string;
  productName: string;
  contactName: string;
  phone: string;
  deliveryArea: string;
  pinCode: string | null;
  pharmacyId: string | null;
  pharmacyName: string | null;
  notes: string | null;
  status: string;
  statusNote: string | null;
  changedBy: string | null;
  changedAt: string;
  createdAt: string;
}

export interface EnquiryRow {
  id: string;
  ref: string;
  packageId: string;
  packageName: string;
  providerId: string;
  providerName: string;
  fullName: string;
  phone: string;
  email: string | null;
  preferredDate: string | null;
  message: string | null;
  status: string;
  statusNote: string | null;
  changedBy: string | null;
  changedAt: string;
  createdAt: string;
}

export interface ContactRow {
  id: string;
  ref: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

async function handle<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body as T;
}

export const api = {
  createAppointment: (payload: unknown) =>
    fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<{ request: AppointmentRow }>(r)),

  listAppointments: () =>
    fetch("/api/appointments").then((r) => handle<{ requests: AppointmentRow[] }>(r)),

  updateAppointment: (id: string, payload: unknown) =>
    fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<{ request: AppointmentRow }>(r)),

  createMedicine: (payload: unknown) =>
    fetch("/api/medicine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<{ request: MedicineRow }>(r)),

  listMedicine: () =>
    fetch("/api/medicine").then((r) => handle<{ requests: MedicineRow[] }>(r)),

  updateMedicine: (id: string, payload: unknown) =>
    fetch(`/api/medicine/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<{ request: MedicineRow }>(r)),

  createEnquiry: (payload: unknown) =>
    fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<{ request: EnquiryRow }>(r)),

  listEnquiries: () =>
    fetch("/api/enquiries").then((r) => handle<{ requests: EnquiryRow[] }>(r)),

  updateEnquiry: (id: string, payload: unknown) =>
    fetch(`/api/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<{ request: EnquiryRow }>(r)),

  createContact: (payload: unknown) =>
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<{ message: ContactRow }>(r)),

  listContact: () =>
    fetch("/api/contact").then((r) => handle<{ messages: ContactRow[] }>(r)),

  updateContact: (id: string, payload: unknown) =>
    fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<{ message: ContactRow }>(r)),
};
