"use client";

import { create } from "zustand";

export type ViewKey =
  | "home"
  | "find"
  | "appointments"
  | "medicine"
  | "packages"
  | "beds"
  | "coverage"
  | "contact"
  | "admin";

interface AppointmentPrefill {
  specialty?: string;
  providerId?: string;
  providerName?: string;
  doctorId?: string;
  doctorName?: string;
}

interface LavasaState {
  view: ViewKey;
  searchQuery: string;
  adminAuthed: boolean;
  adminRole: string;
  appointmentPrefill: AppointmentPrefill;
  setView: (v: ViewKey) => void;
  goSearch: (q: string) => void; // sets query + navigates to find (FR-02)
  setAdminAuthed: (v: boolean, role?: string) => void;
  setAppointmentPrefill: (p: AppointmentPrefill) => void;
}

export const useLavasa = create<LavasaState>((set) => ({
  view: "home",
  searchQuery: "",
  adminAuthed: false,
  adminRole: "",
  appointmentPrefill: {},
  setView: (v) => set({ view: v }),
  goSearch: (q) => set({ searchQuery: q, view: "find" }),
  setAdminAuthed: (v, role = "Provider staff (demo)") =>
    set({ adminAuthed: v, adminRole: v ? role : "" }),
  setAppointmentPrefill: (p) => set({ appointmentPrefill: p }),
}));
