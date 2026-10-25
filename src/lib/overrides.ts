"use client";

/**
 * Demo provider-data overrides (FR-18).
 * Edits made in the admin dashboard are stored in this browser's localStorage
 * only — clearly a prototype mechanism, never a system of record (SRS §7).
 */

export interface BedOverride {
  type: string;
  available: number;
  total: number;
}

export interface ProviderOverride {
  phone?: string;
  hours?: string;
  beds?: BedOverride[];
  savedAt?: number;
}

export type ProviderOverrides = Record<string, ProviderOverride>;

const KEY = "lavasacare-provider-overrides";

export function loadOverrides(): ProviderOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProviderOverrides) : {};
  } catch {
    return {};
  }
}

export function saveOverride(providerId: string, override: ProviderOverride) {
  if (typeof window === "undefined") return;
  try {
    const all = loadOverrides();
    all[providerId] = { ...all[providerId], ...override, savedAt: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // storage unavailable — demo edit simply won't persist
  }
}
