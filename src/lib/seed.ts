import { db } from "@/lib/db";

/** Generates a unique human-readable reference number, e.g. LVC-AP-8H3K2QX7 */
export function makeRef(prefix: string): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LVC-${prefix}-${t}${r}`;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

function futureDate(daysFromNow: number): string {
  const d = new Date(Date.now() + daysFromNow * 86400000);
  return d.toISOString().slice(0, 10);
}

/**
 * Seeds a small set of clearly-demo sample requests the first time each
 * endpoint is queried, so the provider-admin dashboard can be explored.
 * Sample data only — production replaces this with real backend flows.
 */
export async function ensureSeed() {
  const apptCount = await db.appointmentRequest.count();
  if (apptCount === 0) {
    await db.appointmentRequest.createMany({
      data: [
        {
          ref: makeRef("AP"),
          fullName: "Asha Kale",
          phone: "9822011223",
          specialty: "General Medicine",
          providerId: "p-hospital-1",
          providerName: "Lavasa Multispeciality Hospital",
          doctorId: "d1",
          doctorName: "Dr. Ananya Deshpande",
          preferredDate: futureDate(2),
          preferredTime: "10:00 – 10:30",
          notes: "Fever and body ache since 2 days.",
          status: "Confirmed",
          statusNote: "Slot confirmed by OPD desk.",
          changedBy: "OPD Desk (demo)",
          changedAt: new Date(Date.now() - 3600000),
        },
        {
          ref: makeRef("AP"),
          fullName: "Rahul Mendhe",
          phone: "9730044556",
          specialty: "Paediatrics",
          providerId: "p-clinic-1",
          providerName: "Portofino Family Clinic",
          doctorId: "d2",
          doctorName: "Dr. Rohan Kulkarni",
          preferredDate: futureDate(1),
          preferredTime: "17:00 – 17:30",
          notes: "Child vaccination — 18 months.",
          status: "Under Review",
          statusNote: "Checking vaccine stock.",
          changedBy: "Front Desk (demo)",
          changedAt: new Date(Date.now() - 7200000),
        },
        {
          ref: makeRef("AP"),
          fullName: "Nikita Shah",
          phone: "9921067788",
          specialty: "Dermatology",
          providerId: "p-hospital-1",
          providerName: "Lavasa Multispeciality Hospital",
          preferredDate: futureDate(5),
          preferredTime: "15:30 – 16:00",
          notes: null,
          status: "Submitted",
          changedBy: null,
          changedAt: new Date(Date.now() - 5400000),
        },
      ],
    });
  }

  const medCount = await db.medicineRequest.count();
  if (medCount === 0) {
    await db.medicineRequest.createMany({
      data: [
        {
          ref: makeRef("RX"),
          productName: "Paracetamol 650 mg (strip of 15)",
          contactName: "Suresh Pawar",
          phone: "9890112233",
          deliveryArea: "Dasve",
          pinCode: "412112",
          pharmacyId: "p-pharmacy-1",
          pharmacyName: "Lavasa Wellness Pharmacy",
          notes: "Deliver after 6 PM please.",
          status: "Out for Delivery",
          statusNote: "Rider assigned (demo).",
          changedBy: "Pharmacy counter (demo)",
          changedAt: new Date(Date.now() - 1800000),
        },
        {
          ref: makeRef("RX"),
          productName: "Cetirizine 10 mg tablets",
          contactName: "Farida Qureshi",
          phone: "9765044332",
          deliveryArea: "Portofino",
          pinCode: "412112",
          status: "Submitted",
          changedBy: null,
          changedAt: new Date(Date.now() - 900000),
        },
      ],
    });
  }

  const enqCount = await db.packageEnquiry.count();
  if (enqCount === 0) {
    await db.packageEnquiry.createMany({
      data: [
        {
          ref: makeRef("PK"),
          packageId: "pk3",
          packageName: "Cardiac Screening Package",
          providerId: "p-hospital-1",
          providerName: "Lavasa Multispeciality Hospital",
          fullName: "Deepak Rao",
          phone: "9845011223",
          email: "deepak.rao@example.com",
          preferredDate: futureDate(4),
          message: "Would like TMT included if possible.",
          status: "Under Review",
          statusNote: "Awaiting cardiologist schedule.",
          changedBy: "Wellness desk (demo)",
          changedAt: new Date(Date.now() - 3600000),
        },
        {
          ref: makeRef("PK"),
          packageId: "pk1",
          packageName: "Essential Health Checkup",
          providerId: "p-lab-1",
          providerName: "Sahyadri Diagnostics — Lavasa",
          fullName: "Sneha Gaikwad",
          phone: "9700012345",
          status: "Submitted",
          changedBy: null,
          changedAt: new Date(Date.now() - 2700000),
        },
      ],
    });
  }

  const msgCount = await db.contactMessage.count();
  if (msgCount === 0) {
    await db.contactMessage.createMany({
      data: [
        {
          ref: makeRef("CS"),
          name: "Kiran Bhosale",
          email: "kiran.b@example.com",
          phone: "9860775431",
          subject: "Provider partnership",
          message:
            "We run a dental clinic near Mugaon and would like to join the platform.",
          status: "Open",
        },
      ],
    });
  }

  // keep "today" referenced so lint doesn't flag unused helpers in future edits
  void todayISO;
}
