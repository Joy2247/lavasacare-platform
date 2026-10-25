/**
 * LavasaCare — DEMONSTRATION DATA (FR-21 / AC-13)
 * ------------------------------------------------
 * Every provider, doctor, package, price and bed count in this file is
 * fictional sample data used for the front-end prototype only.
 * None of it may be represented as real medical or operational information.
 */

export const SERVICE_AREA = "Lavasa, Maharashtra";

export const EMERGENCY = {
  ambulance: "108",
  national: "112",
  notice:
    "LavasaCare is not an emergency dispatch centre. In a medical emergency, call 108 (ambulance) or 112 (national emergency) immediately.",
};

export const DEMO_NOTE =
  "Prototype notice — all providers, doctors, prices, schedules and bed counts shown are demonstration data (FR-21) and must not be used for real medical or operational decisions.";

export type ProviderType =
  | "hospital"
  | "clinic"
  | "pharmacy"
  | "lab"
  | "ambulance";

export interface Provider {
  id: string;
  type: ProviderType;
  name: string;
  area: string;
  address: string;
  phone: string;
  hours: string;
  services: string[];
  mapQuery: string;
  verified: boolean;
}

export const PROVIDERS: Provider[] = [
  {
    id: "p-hospital-1",
    type: "hospital",
    name: "Lavasa Multispeciality Hospital",
    area: "Dasve",
    address: "Plot 12, Waterfront Road, Dasve, Lavasa 412112",
    phone: "+91 20 6675 1200",
    hours: "OPD 8:00–20:00 · Emergency 24×7",
    services: [
      "General Medicine",
      "Emergency Care",
      "Day Surgery",
      "Diagnostics",
      "In-house Pharmacy",
    ],
    mapQuery: "Dasve, Lavasa, Maharashtra",
    verified: true,
  },
  {
    id: "p-hospital-2",
    type: "hospital",
    name: "Hillside Daycare & Surgical Centre",
    area: "Mugaon",
    address: "Survey 210, Mugaon Road, Lavasa 412112",
    phone: "+91 20 6675 4410",
    hours: "Mon–Sat 9:00–17:00",
    services: ["Day Surgery", "Orthopaedics", "Diagnostics", "Physiotherapy"],
    mapQuery: "Mugaon, Lavasa, Maharashtra",
    verified: true,
  },
  {
    id: "p-clinic-1",
    type: "clinic",
    name: "Portofino Family Clinic",
    area: "Portofino",
    address: "Shop 4, Portofino Bazaar, Lavasa 412112",
    phone: "+91 20 6675 2314",
    hours: "Mon–Sat 9:00–18:00",
    services: ["Family Medicine", "Paediatrics OPD", "Vaccination"],
    mapQuery: "Portofino, Lavasa, Maharashtra",
    verified: true,
  },
  {
    id: "p-clinic-2",
    type: "clinic",
    name: "Mugaon Primary Health Clinic",
    area: "Mugaon",
    address: "Near Central Square, Mugaon, Lavasa 412112",
    phone: "+91 20 6675 3390",
    hours: "Mon–Sun 8:00–14:00",
    services: ["General OPD", "Health Screening", "First Aid"],
    mapQuery: "Mugaon, Lavasa, Maharashtra",
    verified: true,
  },
  {
    id: "p-pharmacy-1",
    type: "pharmacy",
    name: "Lavasa Wellness Pharmacy",
    area: "Dasve",
    address: "Ground Floor, Event Centre, Dasve, Lavasa 412112",
    phone: "+91 20 6675 7722",
    hours: "Open 24×7",
    services: ["Retail Medicines", "Home Delivery", "Prescription Refills"],
    mapQuery: "Dasve, Lavasa, Maharashtra",
    verified: true,
  },
  {
    id: "p-pharmacy-2",
    type: "pharmacy",
    name: "Dasve Medical & Surgical Store",
    area: "Dasve",
    address: "Market Lane 2, Dasve, Lavasa 412112",
    phone: "+91 20 6675 8154",
    hours: "Mon–Sun 8:30–22:00",
    services: ["Retail Medicines", "Surgical Supplies", "Baby Care"],
    mapQuery: "Dasve, Lavasa, Maharashtra",
    verified: true,
  },
  {
    id: "p-lab-1",
    type: "lab",
    name: "Sahyadri Diagnostics — Lavasa",
    area: "Dasve",
    address: "Unit 6, Business Quarter, Dasve, Lavasa 412112",
    phone: "+91 20 6675 9080",
    hours: "Mon–Sat 7:00–19:00 · Sun 8:00–12:00",
    services: ["Pathology", "Radiology", "Home Sample Collection"],
    mapQuery: "Dasve, Lavasa, Maharashtra",
    verified: true,
  },
  {
    id: "p-ambulance-1",
    type: "ambulance",
    name: "Lavasa Rapid Response Ambulance",
    area: "City-wide",
    address: "Base Station: Fire Station Lane, Dasve, Lavasa 412112",
    phone: "+91 98220 55108",
    hours: "On call 24×7",
    services: ["BLS Ambulance", "Patient Transfer", "Event Standby"],
    mapQuery: "Dasve, Lavasa, Maharashtra",
    verified: true,
  },
];

export interface Doctor {
  id: string;
  name: string;
  qualifications: string;
  specialty: string;
  providerId: string;
  providerName: string;
  experienceYears: number;
  languages: string[];
  consultModes: string[];
  weeklySchedule: string[];
  nextSlots: string[];
  lastUpdatedHoursAgo: number; // FR-07: availability timestamps
}

export const DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Ananya Deshpande",
    qualifications: "MBBS, MD (General Medicine)",
    specialty: "General Medicine",
    providerId: "p-hospital-1",
    providerName: "Lavasa Multispeciality Hospital",
    experienceYears: 12,
    languages: ["Marathi", "Hindi", "English"],
    consultModes: ["In-clinic", "Video"],
    weeklySchedule: ["Mon–Fri 9:00–13:00", "Sat 9:00–12:00"],
    nextSlots: ["Today 16:00", "Tomorrow 09:30", "Tomorrow 11:00"],
    lastUpdatedHoursAgo: 2,
  },
  {
    id: "d2",
    name: "Dr. Rohan Kulkarni",
    qualifications: "MBBS, DNB (Paediatrics)",
    specialty: "Paediatrics",
    providerId: "p-clinic-1",
    providerName: "Portofino Family Clinic",
    experienceYears: 9,
    languages: ["Marathi", "Hindi", "English"],
    consultModes: ["In-clinic"],
    weeklySchedule: ["Mon–Sat 10:00–13:00", "Mon–Sat 17:00–19:00"],
    nextSlots: ["Tomorrow 10:30", "Tomorrow 17:30", "Fri 11:00"],
    lastUpdatedHoursAgo: 5,
  },
  {
    id: "d3",
    name: "Dr. Meera Joshi",
    qualifications: "MBBS, MS (OB-GYN)",
    specialty: "Gynaecology & Obstetrics",
    providerId: "p-hospital-1",
    providerName: "Lavasa Multispeciality Hospital",
    experienceYears: 14,
    languages: ["Marathi", "Hindi", "English"],
    consultModes: ["In-clinic"],
    weeklySchedule: ["Tue/Thu/Sat 10:00–14:00"],
    nextSlots: ["Thu 10:30", "Sat 12:00", "Next Tue 11:00"],
    lastUpdatedHoursAgo: 1,
  },
  {
    id: "d4",
    name: "Dr. Vikram Patil",
    qualifications: "MBBS, MS (Orthopaedics)",
    specialty: "Orthopaedics",
    providerId: "p-hospital-2",
    providerName: "Hillside Daycare & Surgical Centre",
    experienceYears: 16,
    languages: ["Marathi", "Hindi", "English"],
    consultModes: ["In-clinic"],
    weeklySchedule: ["Mon/Wed/Fri 11:00–16:00"],
    nextSlots: ["Wed 11:30", "Fri 14:00", "Next Mon 12:00"],
    lastUpdatedHoursAgo: 3,
  },
  {
    id: "d5",
    name: "Dr. Sana Sheikh",
    qualifications: "MBBS, DVD (Dermatology)",
    specialty: "Dermatology",
    providerId: "p-hospital-1",
    providerName: "Lavasa Multispeciality Hospital",
    experienceYears: 8,
    languages: ["Hindi", "English", "Marathi"],
    consultModes: ["In-clinic", "Video"],
    weeklySchedule: ["Tue/Thu 15:00–18:00"],
    nextSlots: ["Thu 15:30", "Next Tue 16:00"],
    lastUpdatedHoursAgo: 7,
  },
  {
    id: "d6",
    name: "Dr. Arjun Nair",
    qualifications: "MBBS, MD, DM (Cardiology)",
    specialty: "Cardiology",
    providerId: "p-hospital-1",
    providerName: "Lavasa Multispeciality Hospital",
    experienceYears: 18,
    languages: ["English", "Hindi", "Malayalam"],
    consultModes: ["In-clinic"],
    weeklySchedule: ["Visiting — 1st & 3rd Sunday 10:00–14:00"],
    nextSlots: ["Next Sun 10:00", "Next Sun 12:30"],
    lastUpdatedHoursAgo: 4,
  },
  {
    id: "d7",
    name: "Dr. Priya Bhosale",
    qualifications: "BDS, MDS (Prosthodontics)",
    specialty: "Dentistry",
    providerId: "p-clinic-2",
    providerName: "Mugaon Primary Health Clinic",
    experienceYears: 7,
    languages: ["Marathi", "Hindi"],
    consultModes: ["In-clinic"],
    weeklySchedule: ["Mon–Thu 9:00–13:00"],
    nextSlots: ["Tomorrow 09:00", "Thu 10:00"],
    lastUpdatedHoursAgo: 26,
  },
  {
    id: "d8",
    name: "Dr. Sameer Inamdar",
    qualifications: "MBBS, MS (ENT)",
    specialty: "ENT",
    providerId: "p-hospital-2",
    providerName: "Hillside Daycare & Surgical Centre",
    experienceYears: 11,
    languages: ["Marathi", "Urdu", "Hindi", "English"],
    consultModes: ["In-clinic", "Video"],
    weeklySchedule: ["Tue–Sat 10:00–14:00"],
    nextSlots: ["Tomorrow 10:00", "Fri 13:00"],
    lastUpdatedHoursAgo: 2,
  },
];

export interface HealthPackage {
  id: string;
  name: string;
  providerId: string;
  providerName: string;
  tests: string[];
  price: number;
  durationHours: number;
  fasting?: string;
  prep: string[];
  eligibility: string;
  lastUpdatedHoursAgo: number;
}

export const PACKAGES: HealthPackage[] = [
  {
    id: "pk1",
    name: "Essential Health Checkup",
    providerId: "p-lab-1",
    providerName: "Sahyadri Diagnostics — Lavasa",
    tests: ["CBC", "Blood Sugar (Fasting)", "Lipid Profile", "Urine Routine", "BMI & BP Review"],
    price: 999,
    durationHours: 2,
    fasting: "10–12 hrs fasting required",
    prep: ["Water allowed", "Carry previous reports", "Avoid alcohol 24 hrs prior"],
    eligibility: "Adults 18+",
    lastUpdatedHoursAgo: 6,
  },
  {
    id: "pk2",
    name: "Diabetes Care Panel",
    providerId: "p-lab-1",
    providerName: "Sahyadri Diagnostics — Lavasa",
    tests: ["HbA1c", "Fasting & PP Glucose", "Kidney Function (KFT)", "Lipid Profile", "Fundus Screening"],
    price: 1799,
    durationHours: 3,
    fasting: "10–12 hrs fasting required",
    prep: ["Bring current medication list", "Morning sample preferred"],
    eligibility: "Adults 18+ · Suitable for diabetics & pre-diabetics",
    lastUpdatedHoursAgo: 10,
  },
  {
    id: "pk3",
    name: "Cardiac Screening Package",
    providerId: "p-hospital-1",
    providerName: "Lavasa Multispeciality Hospital",
    tests: ["ECG", "Echocardiogram", "TMT (if advised)", "Lipid Profile", "Cardiologist Consultation"],
    price: 3499,
    durationHours: 4,
    prep: ["Wear comfortable clothing", "Light breakfast allowed", "Carry ID proof"],
    eligibility: "Adults 30+ · Cardiologist decides on TMT suitability",
    lastUpdatedHoursAgo: 2,
  },
  {
    id: "pk4",
    name: "Women's Wellness Check",
    providerId: "p-hospital-1",
    providerName: "Lavasa Multispeciality Hospital",
    tests: ["CBC", "Thyroid (TSH)", "Iron Studies", "Pap Smear", "Gynaec Consultation"],
    price: 2599,
    durationHours: 3,
    fasting: "8 hrs fasting preferred",
    prep: ["Schedule outside menstrual days for Pap smear", "Carry previous reports"],
    eligibility: "Women 21+",
    lastUpdatedHoursAgo: 20,
  },
  {
    id: "pk5",
    name: "Senior Citizen Comprehensive",
    providerId: "p-hospital-2",
    providerName: "Hillside Daycare & Surgical Centre",
    tests: ["CBC", "KFT & LFT", "Bone Density ( heel )", "ECG", "Chest X-ray", "Physician Consultation"],
    price: 2999,
    durationHours: 5,
    fasting: "10–12 hrs fasting required",
    prep: ["Wheelchair assistance available on request", "Companion recommended"],
    eligibility: "60+ years",
    lastUpdatedHoursAgo: 3,
  },
  {
    id: "pk6",
    name: "Child Wellness & Growth Panel",
    providerId: "p-clinic-1",
    providerName: "Portofino Family Clinic",
    tests: ["CBC", "Vitamin D", "Growth Assessment", "Paediatric Consultation"],
    price: 1299,
    durationHours: 2,
    prep: ["Child should be comfortable & fed (except where advised)", "Carry immunisation card"],
    eligibility: "Ages 2–15 · Paediatrician supervision",
    lastUpdatedHoursAgo: 8,
  },
];

export interface BedRow {
  type: string; // e.g. General | ICU | Oxygen | Observation
  available: number;
  total: number;
}

export interface BedReport {
  providerId: string;
  facility: string;
  phone: string;
  rows: BedRow[];
  reportedHoursAgo: number; // FR-11: timestamp & staleness labelling
  reportedBy: string;
}

export const BED_REPORTS: BedReport[] = [
  {
    providerId: "p-hospital-1",
    facility: "Lavasa Multispeciality Hospital",
    phone: "+91 20 6675 1200",
    rows: [
      { type: "General", available: 6, total: 40 },
      { type: "ICU", available: 2, total: 8 },
      { type: "Oxygen", available: 3, total: 10 },
    ],
    reportedHoursAgo: 1.5,
    reportedBy: "Facility duty manager (demo)",
  },
  {
    providerId: "p-hospital-2",
    facility: "Hillside Daycare & Surgical Centre",
    phone: "+91 20 6675 4410",
    rows: [
      { type: "General", available: 9, total: 22 },
      { type: "Oxygen", available: 1, total: 6 },
    ],
    reportedHoursAgo: 7.5,
    reportedBy: "Facility duty manager (demo)",
  },
  {
    providerId: "p-clinic-2",
    facility: "Mugaon Primary Health Clinic",
    phone: "+91 20 6675 3390",
    rows: [
      { type: "Observation", available: 4, total: 6 },
      { type: "General", available: 2, total: 4 },
    ],
    reportedHoursAgo: 30,
    reportedBy: "Clinic staff (demo)",
  },
];

export interface CoverageArea {
  area: string;
  pin: string;
  services: { type: string; provider: string }[];
  status: "verified" | "pending";
}

export const COVERAGE_AREAS: CoverageArea[] = [
  {
    area: "Dasve",
    pin: "412112",
    status: "verified",
    services: [
      { type: "Hospital", provider: "Lavasa Multispeciality Hospital" },
      { type: "Pharmacy", provider: "Lavasa Wellness Pharmacy" },
      { type: "Diagnostics", provider: "Sahyadri Diagnostics — Lavasa" },
      { type: "Ambulance", provider: "Lavasa Rapid Response Ambulance" },
    ],
  },
  {
    area: "Portofino",
    pin: "412112",
    status: "verified",
    services: [
      { type: "Clinic", provider: "Portofino Family Clinic" },
      { type: "Pharmacy", provider: "Dasve Medical & Surgical Store" },
    ],
  },
  {
    area: "Mugaon",
    pin: "412112",
    status: "verified",
    services: [
      { type: "Clinic", provider: "Mugaon Primary Health Clinic" },
      { type: "Hospital", provider: "Hillside Daycare & Surgical Centre" },
    ],
  },
  {
    area: "Dhamnholi",
    pin: "412112",
    status: "pending",
    services: [{ type: "Pharmacy", provider: "Under verification" }],
  },
  {
    area: "Lavasa Technology Park",
    pin: "412112",
    status: "verified",
    services: [
      { type: "Pharmacy", provider: "Lavasa Wellness Pharmacy" },
      { type: "Ambulance", provider: "Lavasa Rapid Response Ambulance" },
    ],
  },
  {
    area: "Panshet Road belt",
    pin: "412111",
    status: "pending",
    services: [{ type: "Ambulance", provider: "Under verification" }],
  },
];

export const SPECIALTIES = [
  "General Medicine",
  "Paediatrics",
  "Gynaecology & Obstetrics",
  "Orthopaedics",
  "Dermatology",
  "Cardiology",
  "Dentistry",
  "ENT",
];

export const POPULAR_SEARCHES = [
  "General Medicine",
  "Paediatrics",
  "Cardiology",
  "Full body checkup",
  "ICU beds",
  "Medicine delivery",
];

export const APPOINTMENT_SLOTS = [
  "09:00 – 09:30",
  "09:30 – 10:00",
  "10:00 – 10:30",
  "10:30 – 11:00",
  "11:30 – 12:00",
  "12:00 – 12:30",
  "15:00 – 15:30",
  "15:30 – 16:00",
  "16:00 – 16:30",
  "16:30 – 17:00",
];

export const APPOINTMENT_STATUSES = [
  "Submitted",
  "Under Review",
  "Confirmed",
  "Reschedule Requested",
  "Completed",
  "Declined",
  "Cancelled",
];

export const MEDICINE_STATUSES = [
  "Submitted",
  "Assigned to Pharmacy",
  "Under Review",
  "Ready for Pickup",
  "Out for Delivery",
  "Completed",
  "Declined",
  "Cancelled",
];

export const ENQUIRY_STATUSES = ["Submitted", "Under Review", "Confirmed", "Completed", "Declined", "Cancelled"];

export const MESSAGE_STATUSES = ["Open", "In Progress", "Resolved"];

export const STATUS_STYLE: Record<string, string> = {
  Submitted: "bg-brand-50 text-brand-700 border-brand-200",
  "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Completed: "bg-teal-50 text-teal-700 border-teal-200",
  Declined: "bg-rose-50 text-rose-700 border-rose-200",
  Cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  "Reschedule Requested": "bg-violet-50 text-violet-700 border-violet-200",
  "Assigned to Pharmacy": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Ready for Pickup": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Out for Delivery": "bg-sky-50 text-sky-700 border-sky-200",
  Open: "bg-brand-50 text-brand-700 border-brand-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function formatHoursAgo(hours: number): string {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min ago`;
  if (hours < 24) return `${Math.round(hours)} hr${Math.round(hours) === 1 ? "" : "s"} ago`;
  return `${Math.round(hours / 24)} day${Math.round(hours / 24) === 1 ? "" : "s"} ago`;
}

export function reportedAtLabel(hoursAgo: number): string {
  const d = new Date(Date.now() - hoursAgo * 3600 * 1000);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
